import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/orders");
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 403) {
          toast.error("Admin access required");
        } else {
          toast.error("Failed to fetch orders");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" && user?.token) {
      fetchAllOrders();
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <h2 className="text-lg sm:text-2xl font-bold">Loading orders...</h2>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <h2 className="text-lg sm:text-2xl font-bold">No Orders Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">All Orders</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
          Total: {orders.length}
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full border-collapse min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <th className="p-2 sm:p-4 text-left font-semibold text-xs sm:text-sm">Order ID</th>
              <th className="p-2 sm:p-4 text-left font-semibold text-xs sm:text-sm">Customer</th>
              <th className="p-2 sm:p-4 text-left font-semibold text-xs sm:text-sm">Items</th>
              <th className="p-2 sm:p-4 text-right font-semibold text-xs sm:text-sm">Amount</th>
              <th className="p-2 sm:p-4 text-left font-semibold text-xs sm:text-sm">Status</th>
              <th className="p-2 sm:p-4 text-left font-semibold text-xs sm:text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="p-2 sm:p-4 text-xs sm:text-sm font-mono truncate max-w-xs">
                  {order._id.substring(0, 8)}...
                </td>
                <td className="p-2 sm:p-4">
                  <div className="text-xs sm:text-sm font-semibold truncate">
                    {order.user?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {order.user?.email || "N/A"}
                  </div>
                </td>
                <td className="p-2 sm:p-4 text-xs sm:text-sm">
                  {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                </td>
                <td className="p-2 sm:p-4 text-right font-bold text-primary text-xs sm:text-sm">
                  ₹{order.totalAmount}
                </td>
                <td className="p-2 sm:p-4">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                      order.orderStatus === "Placed"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.orderStatus === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-2 sm:p-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal Preview */}
      <div className="space-y-4 sm:space-y-6 mt-6">
        {orders.slice(0, 3).map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Order ID</p>
                <p className="font-mono text-xs sm:text-sm break-all">{order._id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Customer</p>
                <p className="font-semibold text-xs sm:text-sm">{order.user?.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded mb-4">
              <p className="text-xs sm:text-sm font-semibold mb-2">Items:</p>
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-xs sm:text-sm gap-2">
                  <span className="truncate">{item.name} x {item.quantity}</span>
                  <span className="flex-shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                <p className="text-xs sm:text-sm break-all">{order.shippingAddress.address}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;