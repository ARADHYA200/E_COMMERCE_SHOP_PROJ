import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalAmount } = req.body;

    if (!orderItems || !orderItems.length) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!shippingAddress || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Reduce product stock
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
        }
        product.stock -= item.quantity;
        await product.save();
      } else {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
    }

    // Create order with authenticated user ID
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalAmount,
    });

    // Populate user details
    await order.populate("user", "name email");

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// Get orders based on user role
export const getOrders = async (req, res) => {
  try {
    let query = {};
    let options = { sort: { createdAt: -1 } };

    // If user is admin, return all orders with user details
    if (req.user.role === "admin") {
      const orders = await Order.find(query)
        .populate("user", "name email")
        .populate("orderItems.product", "name price")
        .sort(options.sort);
      return res.json(orders);
    }

    // Otherwise, return only this user's orders
    query.user = req.user._id;
    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .sort(options.sort);

    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Keep for backward compatibility if specific endpoint needed
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Fetch user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};