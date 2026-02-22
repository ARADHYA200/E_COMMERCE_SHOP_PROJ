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
      <div className="text-center py-12 sm:py-20 px-4">
        <div className="text-lg sm:text-xl font-semibold">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Link to="/admin/products" className="text-primary underline hover:no-underline text-sm sm:text-base">
          Manage Products →
        </Link>
        <Link to="/admin/orders" className="text-primary underline hover:no-underline text-sm sm:text-base">
          Manage Orders →
        </Link>
        <Link to="/admin/coupons" className="text-primary underline hover:no-underline text-sm sm:text-base">
          Manage Coupons →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xs sm:text-sm text-gray-500">Total Users</h2>
          <p className="text-2xl sm:text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xs sm:text-sm text-gray-500">Total Products</h2>
          <p className="text-2xl sm:text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xs sm:text-sm text-gray-500">Total Orders</h2>
          <p className="text-2xl sm:text-3xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xs sm:text-sm text-gray-500">Total Revenue</h2>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            ₹{stats.totalRevenue}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xs sm:text-sm text-gray-500">Low Stock Products</h2>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">
            {stats.lowStockProducts}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;