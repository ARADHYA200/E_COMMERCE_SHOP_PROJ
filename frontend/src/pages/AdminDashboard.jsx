import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/stats");
        setStats(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard stats"
        );
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="text-xl font-semibold animate-pulse">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const statusData = Object.entries(stats.statusCounts || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const PIE_COLORS = [
    "#facc15",
    "#3b82f6",
    "#6366f1",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 pb-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Business Intelligence & Analytics Center
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Link
          to="/admin/products"
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 rounded-2xl shadow-md hover:scale-[1.02] transition"
        >
          <h3 className="font-semibold text-lg">Manage Products</h3>
          <p className="text-sm opacity-90">
            Add, edit or update inventory
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-md hover:scale-[1.02] transition"
        >
          <h3 className="font-semibold text-lg">Manage Orders</h3>
          <p className="text-sm opacity-90">
            Track and manage orders
          </p>
        </Link>

        <Link
          to="/admin/coupons"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-md hover:scale-[1.02] transition"
        >
          <h3 className="font-semibold text-lg">Manage Coupons</h3>
          <p className="text-sm opacity-90">
            Create and control discounts
          </p>
        </Link>

      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Users</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Products</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Revenue</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">
            ₹{stats.totalRevenue?.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Low Stock</h3>
          <p className="text-3xl font-bold mt-2 text-red-500">
            {stats.lowStockProducts}
          </p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg mb-4">
            Revenue Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="#10b981"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg mb-4">
            Orders Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* PIE + TOP PRODUCTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg mb-4">
            Order Status Distribution
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <h2 className="font-semibold text-lg mb-4">
            Top Selling Products
          </h2>

          <div className="space-y-4">
            {stats.topProducts?.map((product, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-3"
              >
                <span>{product.name}</span>
                <span className="font-bold text-green-600">
                  {product.sold} sold
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
        <h2 className="font-semibold text-lg mb-4">
          Recent Orders
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Customer</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {stats.recentOrders?.map((order) => (
                <tr
                  key={order._id}
                  className="border-b"
                >
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">
                    ₹{order.amount}
                  </td>
                  <td className="py-3">
                    {order.status}
                  </td>
                  <td className="py-3">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;