import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

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

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 pb-10">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Monitor platform performance, users, revenue and inventory insights.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Link
          to="/admin/products"
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
        >
          <h3 className="font-semibold text-lg">Manage Products</h3>
          <p className="text-sm opacity-90">Add, edit or update product inventory</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
        >
          <h3 className="font-semibold text-lg">Manage Orders</h3>
          <p className="text-sm opacity-90">Track and manage customer orders</p>
        </Link>

        <Link
          to="/admin/coupons"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
        >
          <h3 className="font-semibold text-lg">Manage Coupons</h3>
          <p className="text-sm opacity-90">Create and control discounts</p>
        </Link>

      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-gray-500">Total Users</h2>
            <span className="bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full">
              Users
            </span>
          </div>
          <p className="text-3xl font-bold mt-3">{stats.totalUsers}</p>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-gray-500">Total Products</h2>
            <span className="bg-yellow-100 text-yellow-600 text-xs px-3 py-1 rounded-full">
              Inventory
            </span>
          </div>
          <p className="text-3xl font-bold mt-3">{stats.totalProducts}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-gray-500">Total Orders</h2>
            <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
              Sales
            </span>
          </div>
          <p className="text-3xl font-bold mt-3">{stats.totalOrders}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-gray-500">Total Revenue</h2>
            <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <p className="text-3xl font-bold mt-3 text-green-600">
            ₹{stats.totalRevenue}
          </p>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-gray-500">Low Stock Products</h2>
            <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full">
              Alert
            </span>
          </div>
          <p className="text-3xl font-bold mt-3 text-red-600">
            {stats.lowStockProducts}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;