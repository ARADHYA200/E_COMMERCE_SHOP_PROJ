import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import CoShopRoom from "../models/CoShopRoom.js";

const httpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const isRoomMember = (room, userId) =>
  room.members.some(
    (member) => String(member?._id || member) === String(userId)
  );

const validateAddress = (address) => {
  if (
    !address ||
    typeof address.name !== "string" ||
    typeof address.address !== "string" ||
    typeof address.phone !== "string" ||
    !address.name.trim() ||
    !address.address.trim() ||
    !address.phone.trim()
  ) {
    throw httpError("Please provide all shipping details.");
  }

  const phone = address.phone.trim();

  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    throw httpError("Please enter a valid phone number.");
  }

  return {
    name: address.name.trim(),
    address: address.address.trim(),
    phone,
  };
};

const getEligibleCouponItems = (coupon, items) => {
  const productRestrictions = (coupon.applicableProducts || []).map(
    String
  );
  const categoryRestrictions = (coupon.applicableCategories || []).map(
    (category) => category.toLowerCase()
  );

  return items.filter((item) => {
    const productAllowed =
      productRestrictions.length === 0 ||
      productRestrictions.includes(String(item.product));

    const categoryAllowed =
      categoryRestrictions.length === 0 ||
      categoryRestrictions.includes(
        String(item.category || "").toLowerCase()
      );

    return productAllowed && categoryAllowed;
  });
};

const calculateCouponDiscount = (coupon, eligibleSubtotal) => {
  if (!coupon.isValid()) {
    throw httpError("Coupon is expired, inactive, or has reached its usage limit.");
  }

  if (eligibleSubtotal < Number(coupon.minOrderAmount || 0)) {
    throw httpError(
      `Minimum eligible order amount of ₹${coupon.minOrderAmount} is required for this coupon.`
    );
  }

  const discount = Number(coupon.calculateDiscount(eligibleSubtotal));

  if (!Number.isFinite(discount) || discount < 0) {
    throw httpError("Unable to calculate coupon discount.");
  }

  // Keep the discount within the eligible subtotal.
  return Math.min(
    Math.round((discount + Number.EPSILON) * 100) / 100,
    eligibleSubtotal
  );
};

// Create Order
export const createOrder = async (req, res) => {
  const stockChanges = [];
  let createdOrder = null;
  let couponUsageReserved = false;
  let reservedCouponId = null;
  let reservedUserId = null;

  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = "COD",
      couponCode,
      coShopRoom: coShopRoomId,
    } = req.body;

    if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
      throw httpError("Invalid payment method.");
    }

    const validatedAddress = validateAddress(shippingAddress);
    let requestedItems = [];

    // The database shared cart is authoritative for Co-Shop orders.
    if (coShopRoomId) {
      if (!validId(coShopRoomId)) {
        throw httpError("Invalid Co-Shop room ID.");
      }

      const room = await CoShopRoom.findById(coShopRoomId);

      if (!room) {
        throw httpError("Co-Shop room not found.", 404);
      }

      if (!isRoomMember(room, req.user._id)) {
        throw httpError("You are not a member of this room.", 403);
      }

      if (room.status !== "active") {
        throw httpError("This Co-Shop room is closed.");
      }

      if (!room.sharedCart?.length) {
        throw httpError("The shared cart is empty.");
      }

      requestedItems = room.sharedCart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));
    } else {
      if (!Array.isArray(orderItems) || orderItems.length === 0) {
        throw httpError("No order items provided.");
      }

      requestedItems = orderItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));
    }

    // Combine duplicate product entries before checking stock.
    const quantities = new Map();

    for (const item of requestedItems) {
      if (!item.product || !validId(item.product)) {
        throw httpError("An order contains an invalid product ID.");
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw httpError(
          "Each product quantity must be a whole number between 1 and 99."
        );
      }

      const id = String(item.product);
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const productIds = [...quantities.keys()];

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    const verifiedItems = [];
    let subtotal = 0;

    for (const [id, quantity] of quantities) {
      const product = productMap.get(id);

      if (!product) {
        throw httpError(`Product ${id} was not found.`, 404);
      }

      const price = Number(product.price);
      const stock = Number(product.stock);

      if (!Number.isFinite(price) || price < 0) {
        throw httpError(`Invalid price for ${product.name}.`);
      }

      if (!Number.isInteger(stock) || stock < quantity) {
        throw httpError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}.`,
          409
        );
      }

      verifiedItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price,
        category: product.category,
      });

      subtotal += price * quantity;
    }

    // Calculate coupon discount exclusively on eligible products.
    let discount = 0;
    let coupon = null;

    if (couponCode && String(couponCode).trim()) {
      coupon = await Coupon.findOne({
        code: String(couponCode).trim().toUpperCase(),
      });

      if (!coupon) {
        throw httpError("Coupon not found.", 404);
      }

      if (!coupon.isValid()) {
        throw httpError(
          "Coupon is expired, inactive, or has reached its usage limit."
        );
      }

      const eligibleItems = getEligibleCouponItems(
        coupon,
        verifiedItems
      );

      if (!eligibleItems.length) {
        throw httpError(
          "This coupon does not apply to any products in your order."
        );
      }

      const eligibleSubtotal = eligibleItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      discount = calculateCouponDiscount(coupon, eligibleSubtotal);

      // Reserve one coupon use, checking the limit again in the update.
      // A duplicate use by the same user is rejected.
      const userAlreadyUsed = (coupon.usedBy || []).some(
        (entry) => String(entry.userId) === String(req.user._id)
      );

      if (userAlreadyUsed) {
        throw httpError("You have already used this coupon.");
      }

      const reservationConditions = {
        _id: coupon._id,
        isActive: true,
        expiresAt: { $gt: new Date() },
        $or: [
          { maxUses: null },
          { maxUses: { $exists: false } },
          { $expr: { $lt: ["$currentUses", "$maxUses"] } },
        ],
        "usedBy.userId": { $ne: req.user._id },
      };

      const reservedCoupon = await Coupon.findOneAndUpdate(
        reservationConditions,
        {
          $inc: { currentUses: 1 },
          $push: {
            usedBy: {
              userId: req.user._id,
              usedAt: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!reservedCoupon) {
        throw httpError(
          "Coupon is no longer available or has already been used."
        );
      }

      couponUsageReserved = true;
      reservedCouponId = coupon._id;
      reservedUserId = req.user._id;
    }

    const finalTotal = Math.max(
      0,
      Math.round((subtotal - discount + Number.EPSILON) * 100) / 100
    );

    // Conditionally decrement stock to handle concurrent orders.
    for (const item of verifiedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        throw httpError(
          `Stock changed for ${item.name}. Please try again.`,
          409
        );
      }

      stockChanges.push({
        productId: item.product,
        quantity: item.quantity,
      });
    }

    createdOrder = await Order.create({
      user: req.user._id,
      orderItems: verifiedItems.map(
        ({ product, name, quantity, price }) => ({
          product,
          name,
          quantity,
          price,
        })
      ),
      shippingAddress: validatedAddress,
      totalAmount: finalTotal,
      paymentMethod,

      // UPI/Card are demo methods until a real gateway verifies payment.
      paymentStatus: "Pending",
      transactionId: null,

      ...(coShopRoomId ? { coShopRoom: coShopRoomId } : {}),
    });

    await createdOrder.populate("user", "name email");

    return res.status(201).json({
      ...createdOrder.toObject(),
      subtotal,
      discount,
      coupon: coupon
        ? {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          }
        : null,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    // If order creation failed, restore any stock already deducted.
    if (!createdOrder) {
      for (const change of stockChanges.reverse()) {
        try {
          await Product.updateOne(
            { _id: change.productId },
            { $inc: { stock: change.quantity } }
          );
        } catch (rollbackError) {
          console.error("Stock rollback failed:", rollbackError);
        }
      }

      // Release a reserved coupon use if no order was created.
      if (couponUsageReserved && reservedCouponId && reservedUserId) {
        try {
          await Coupon.updateOne(
            { _id: reservedCouponId },
            {
              $inc: { currentUses: -1 },
              $pull: { usedBy: { userId: reservedUserId } },
            }
          );
        } catch (rollbackError) {
          console.error("Coupon rollback failed:", rollbackError);
        }
      }
    }

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Order creation failed. Please try again.",
    });
  }
};

// Get orders based on user role
export const getOrders = async (req, res) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { user: req.user._id };

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .populate("coShopRoom", "name inviteCode")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
};

// Get current user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .populate("coShopRoom", "name inviteCode")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
};

// Edit pending order
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        message: "Not authorized to edit this order.",
      });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be edited.",
      });
    }

    if (order.coShopRoom) {
      return res.status(400).json({
        message: "Co-Shop orders cannot be edited through this endpoint.",
      });
    }

    if (req.body.shippingAddress) {
      order.shippingAddress = validateAddress(req.body.shippingAddress);
    }

    if (req.body.orderItems !== undefined) {
      if (
        !Array.isArray(req.body.orderItems) ||
        req.body.orderItems.length === 0
      ) {
        return res.status(400).json({
          message: "An order must contain at least one item.",
        });
      }

      const quantities = new Map();

      for (const item of req.body.orderItems) {
        if (!item.product || !validId(item.product)) {
          return res.status(400).json({
            message: "Invalid product ID in order.",
          });
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          return res.status(400).json({
            message: "Invalid product quantity.",
          });
        }

        const id = String(item.product);
        quantities.set(id, (quantities.get(id) || 0) + quantity);
      }

      const products = await Product.find({
        _id: { $in: [...quantities.keys()] },
      });

      const productMap = new Map(
        products.map((product) => [String(product._id), product])
      );

      const verifiedItems = [];
      let newTotal = 0;

      for (const [id, quantity] of quantities) {
        const product = productMap.get(id);

        if (!product) {
          return res.status(404).json({
            message: `Product ${id} not found.`,
          });
        }

        if (product.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}.`,
          });
        }

        const price = Number(product.price);

        verifiedItems.push({
          product: product._id,
          name: product.name,
          quantity,
          price,
        });

        newTotal += price * quantity;
      }

      order.orderItems = verifiedItems;
      order.totalAmount = newTotal;
    }

    const updatedOrder = await order.save();
    return res.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to update order.",
    });
  }
};

// Cancel pending order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        message: "Not authorized to cancel this order.",
      });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled.",
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    for (const item of order.orderItems) {
      try {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } }
        );
      } catch (restoreError) {
        console.error("Stock restoration failed:", restoreError);
      }
    }

    // Coupon usage remains recorded after cancellation in this version.
    return res.json(order);
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      message: "Failed to cancel order.",
    });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (
      String(order.user) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this order.",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Delete order error:", error);
    return res.status(500).json({
      message: "Failed to delete order.",
    });
  }
};

// Admin manually updates order status
export const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.orderStatus = req.body.status;
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      message: "Failed to update order status.",
    });
  }
};
