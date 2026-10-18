import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import CoShopRoom from "../models/CoShopRoom.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customers only — admin accounts cannot use Co-Shop.
const customerOnly = (req, res, next) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({
      message: "Co-Shop is available to customer accounts only",
    });
  }
  next();
};

router.use(protect, customerOnly);

const isMember = (room, userId) =>
  room.members.some((member) => {
    const memberId = member?._id
      ? member._id.toString()
      : member.toString();

    return memberId === userId.toString();
  });

const getRoomDetails = (id) =>
  CoShopRoom.findById(id)
    .populate("owner", "name email")
    .populate("members", "name email")
    .populate("items.product")
    .populate("items.addedBy", "name")
    .populate("sharedCart.product")
    .populate("sharedCart.addedBy", "name");

// Broadcast updated room data to connected room members.
const emitRoomUpdate = async (req, roomId) => {
  const io = req.app.get("io");
  if (!io) return;

  const updatedRoom = await getRoomDetails(roomId);

  io.to(`co-shop:${roomId}`).emit("room:updated", updatedRoom);
};

// CREATE ROOM
router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    if (!name || name.length > 80) {
      return res.status(400).json({
        message: "Room name is required (maximum 80 characters)",
      });
    }

    const inviteCode = crypto.randomBytes(6).toString("hex");

    const room = await CoShopRoom.create({
      name,
      inviteCode,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Create Co-Shop room:", error);
    res.status(500).json({ message: "Failed to create room" });
  }
});

// LIST MY ROOMS
router.get("/my-rooms", async (req, res) => {
  try {
    const rooms = await CoShopRoom.find({
      members: req.user._id,
    })
      .select("name inviteCode owner members status createdAt updatedAt")
      .populate("owner", "name")
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error("Fetch Co-Shop rooms:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// JOIN ROOM BY INVITE CODE
router.post("/join", async (req, res) => {
  try {
    const inviteCode = String(req.body.inviteCode || "")
      .trim()
      .toLowerCase();

    const room = await CoShopRoom.findOne({ inviteCode });

    if (!room) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    if (!isMember(room, req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
      await emitRoomUpdate(req, room._id);
    }

    res.json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Join Co-Shop room:", error);
    res.status(500).json({ message: "Failed to join room" });
  }
});

// GET ROOM DETAILS
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await getRoomDetails(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    res.json(room);
  } catch (error) {
    console.error("Fetch Co-Shop room:", error);
    res.status(500).json({ message: "Failed to fetch room" });
  }
});

// ADD PRODUCT TO ROOM
router.post("/:id/items", async (req, res) => {
  try {
    const { productId } = req.body;

    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid room or product ID",
      });
    }

    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "Room membership required",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = room.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(409).json({
        message: "This product is already in the room",
      });
    }

    room.items.push({
      product: product._id,
      addedBy: req.user._id,
      quantity: 1,
      votes: [],
    });

    await room.save();
    await emitRoomUpdate(req, room._id);

    res.status(201).json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Add room product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// REMOVE PRODUCT FROM ROOM
router.delete("/:id/items/:itemId", async (req, res) => {
  try {
    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "Room membership required",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    const item = room.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Room product not found" });
    }

    const isOwner =
      room.owner.toString() === req.user._id.toString();

    const addedByMe =
      item.addedBy.toString() === req.user._id.toString();

    if (!isOwner && !addedByMe) {
      return res.status(403).json({
        message:
          "Only the room owner or the person who added this product can remove it",
      });
    }

    item.deleteOne();
    await room.save();
    await emitRoomUpdate(req, room._id);

    res.json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Remove room product:", error);
    res.status(500).json({ message: "Failed to remove product" });
  }
});

// VOTE ON ROOM PRODUCT
router.put("/:id/items/:itemId/vote", async (req, res) => {
  try {
    const { value } = req.body;

    if (!["want", "skip"].includes(value)) {
      return res.status(400).json({
        message: "Vote must be 'want' or 'skip'",
      });
    }

    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "Room membership required",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    const item = room.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Room product not found" });
    }

    const existingVote = item.votes.find(
      (vote) => vote.user.toString() === req.user._id.toString()
    );

    if (existingVote) {
      existingVote.value = value;
    } else {
      item.votes.push({
        user: req.user._id,
        value,
      });
    }

    await room.save();
    await emitRoomUpdate(req, room._id);

    res.json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Submit room vote:", error);
    res.status(500).json({ message: "Failed to submit vote" });
  }
});

// ADD PRODUCT TO SHARED CART
router.post("/:id/cart", async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Number(req.body.quantity ?? 1);

    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid room or product ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({
        message: "Quantity must be between 1 and 99",
      });
    }

    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "Room membership required",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = room.sharedCart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > 99) {
        return res.status(400).json({
          message: "Maximum quantity per product is 99",
        });
      }

      existingItem.quantity += quantity;
    } else {
      room.sharedCart.push({
        product: product._id,
        quantity,
        addedBy: req.user._id,
      });
    }

    await room.save();
    await emitRoomUpdate(req, room._id);

    res.status(201).json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Add shared cart item:", error);
    res.status(500).json({
      message: "Failed to add item to shared cart",
    });
  }
});

// UPDATE SHARED CART QUANTITY
router.patch("/:id/cart/:cartItemId", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(req.params.cartItemId)
    ) {
      return res.status(400).json({
        message: "Invalid room or cart item ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({
        message: "Quantity must be an integer between 1 and 99",
      });
    }

    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "Room membership required",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    const item = room.sharedCart.id(req.params.cartItemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = quantity;

    await room.save();
    await emitRoomUpdate(req, room._id);

    res.json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Update shared cart quantity:", error);
    res.status(500).json({
      message: "Failed to update cart quantity",
    });
  }
});

// REMOVE ITEM FROM SHARED CART
router.delete("/:id/cart/:cartItemId", async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(req.params.cartItemId)
    ) {
      return res.status(400).json({
        message: "Invalid room or cart item ID",
      });
    }

    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!isMember(room, req.user._id)) {
      return res.status(403).json({
        message: "Room membership required",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({ message: "This room is closed" });
    }

    const item = room.sharedCart.id(req.params.cartItemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.deleteOne();

    await room.save();
    await emitRoomUpdate(req, room._id);

    res.json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Remove shared cart item:", error);
    res.status(500).json({
      message: "Failed to remove cart item",
    });
  }
});

// CLOSE ROOM — OWNER ONLY
router.patch("/:id/close", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await CoShopRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the room owner can close it",
      });
    }

    if (room.status === "closed") {
      return res.json(await getRoomDetails(room._id));
    }

    room.status = "closed";
    await room.save();
    await emitRoomUpdate(req, room._id);

    res.json(await getRoomDetails(room._id));
  } catch (error) {
    console.error("Close Co-Shop room:", error);
    res.status(500).json({ message: "Failed to close room" });
  }
});

export default router;
