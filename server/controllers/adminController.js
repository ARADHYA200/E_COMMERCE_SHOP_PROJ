import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Revenue (excluding cancelled orders)
    const totalRevenue = orders
      .filter((order) => order.orderStatus !== "Cancelled")
      .reduce((acc, order) => acc + order.totalAmount, 0);

    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 10 },
    });

    // -------------------------------
    // Order Status Distribution
    // -------------------------------
    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      statusCounts[order.orderStatus]++;
    });

    // -------------------------------
    // Monthly Revenue & Orders
    // -------------------------------
    const monthlyMap = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);

      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: date.toLocaleString("default", {
            month: "short",
          }),
          revenue: 0,
          orders: 0,
        };
      }

      monthlyMap[monthKey].orders += 1;

      if (order.orderStatus !== "Cancelled") {
        monthlyMap[monthKey].revenue += order.totalAmount;
      }
    });

    const monthlyStats = Object.values(monthlyMap).slice(-6);

    // -------------------------------
    // Top Selling Products
    // -------------------------------
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!productSales[item.name]) {
          productSales[item.name] = 0;
        }

        productSales[item.name] += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, sold]) => ({
        name,
        sold,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // -------------------------------
    // Recent Orders
    // -------------------------------
    const recentOrders = orders.slice(0, 5).map((order) => ({
      _id: order._id,
      customer: order.user?.name || "Unknown",
      amount: order.totalAmount,
      status: order.orderStatus,
      createdAt: order.createdAt,
    }));

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,

      statusCounts,
      monthlyStats,
      topProducts,
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Dashboard fetch failed",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};