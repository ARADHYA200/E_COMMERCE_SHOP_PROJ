
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import CoShopRoom from "../models/CoShopRoom.js";
import CoShopMessage from "../models/CoShopMessage.js";

export default function setupCoShopSocket(io) {
  // Authenticate every socket connection using the existing JWT.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user || user.role !== "user") {
        return next(new Error("Customer account required"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Join a room only after verifying actual membership.
    socket.on("chat:join", async ({ roomId } = {}, callback) => {
      const reply = typeof callback === "function" ? callback : () => {};

      try {
        if (!mongoose.isValidObjectId(roomId)) {
          return reply({ ok: false, message: "Invalid room ID" });
        }

        const room = await CoShopRoom.findById(roomId).select(
          "members status"
        );

        if (!room) {
          return reply({ ok: false, message: "Room not found" });
        }

        const isMember = room.members.some(
          (member) => member.toString() === socket.user._id.toString()
        );

        if (!isMember) {
          return reply({
            ok: false,
            message: "You are not a member of this room",
          });
        }

        socket.join(`co-shop:${roomId}`);

        const messages = await CoShopMessage.find({ room: roomId })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate("sender", "name")
          .lean();

        reply({
          ok: true,
          messages: messages.reverse(),
          status: room.status,
        });
      } catch (error) {
        console.error("Co-Shop chat join error:", error);
        reply({ ok: false, message: "Could not load chat" });
      }
    });

    socket.on("chat:send", async ({ roomId, text } = {}, callback) => {
      const reply = typeof callback === "function" ? callback : () => {};

      try {
        if (!mongoose.isValidObjectId(roomId)) {
          return reply({ ok: false, message: "Invalid room ID" });
        }

        if (typeof text !== "string" || !text.trim() || text.length > 2000) {
          return reply({
            ok: false,
            message: "Message must contain 1–2000 characters",
          });
        }

        const room = await CoShopRoom.findById(roomId).select(
          "members status"
        );

        if (!room) {
          return reply({ ok: false, message: "Room not found" });
        }

        const isMember = room.members.some(
          (member) => member.toString() === socket.user._id.toString()
        );

        if (!isMember) {
          return reply({
            ok: false,
            message: "You are not a member of this room",
          });
        }

        if (room.status !== "active") {
          return reply({
            ok: false,
            message: "This room is closed",
          });
        }

        const message = await CoShopMessage.create({
          room: roomId,
          sender: socket.user._id,
          text: text.trim(),
        });

        const savedMessage = await CoShopMessage.findById(message._id)
          .populate("sender", "name")
          .lean();

        io.to(`co-shop:${roomId}`).emit("chat:message", savedMessage);

        reply({ ok: true, message: savedMessage });
      } catch (error) {
        console.error("Co-Shop message error:", error);
        reply({ ok: false, message: "Failed to send message" });
      }
    });
  });
}
