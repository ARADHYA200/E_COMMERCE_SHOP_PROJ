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

// Edit pending order
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow editing if status is Pending
    if (order.orderStatus !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be edited" });
    }

    // Ensure only the owner can edit
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this order" });
    }

    const { shippingAddress, orderItems } = req.body;

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    if (orderItems && orderItems.length > 0) {
      // Re-calculate the total amount based on the new items
      // (Assuming items contain price logic or we fetch from DB, but user sends {product, name, quantity, price})
      let newTotal = 0;
      for (const item of orderItems) {
        newTotal += item.price * item.quantity;
      }
      order.orderItems = orderItems;
      order.totalAmount = newTotal;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};

// Cancel pending order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow canceling if status is Pending
    if (order.orderStatus !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    // Ensure only the owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    order.orderStatus = "Cancelled";
    const updatedOrder = await order.save();
    
    // Optional: Restore product stock if logic requires it
    for (let item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure only the owner can delete
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this order" });
    }

    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

// Admin manually updates order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = req.body.status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
