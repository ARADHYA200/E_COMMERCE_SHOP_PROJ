import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    }
  }, []);

  // ✅ Change Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ✅ Delete Order
  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?"))
      return;

    try {
      await API.delete(`/orders/${orderId}`);
      toast.success("Order deleted successfully");

      setOrders((prev) =>
        prev.filter((order) => order._id !== orderId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Loading orders...</h2>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No Orders Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Orders</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Total: {orders.length}
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="p-4 font-mono">
                  {order._id.substring(0, 8)}...
                </td>

                <td className="p-4">
                  <div className="font-semibold">
                    {order.user?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.user?.email || "N/A"}
                  </div>
                </td>

                <td className="p-4">
                  {order.orderItems.length} item
                  {order.orderItems.length !== 1 && "s"}
                </td>

                <td className="p-4 text-right font-bold text-primary">
                  ₹{order.totalAmount}
                </td>

                <td className="p-4">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ backgroundColor: "#111827" }}
                    className={`px-3 py-1 rounded-md text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-primary ${
                      order.orderStatus === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                        : order.orderStatus === "Processing"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                        : order.orderStatus === "Shipped"
                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                        : order.orderStatus === "Out for Delivery"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                        : order.orderStatus === "Delivered"
                        ? "bg-green-500/20 text-green-400 border-green-500/40"
                        : "bg-red-500/20 text-red-400 border-red-500/40"
                    }`}
                  >
                                      <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">
                      Out for Delivery
                    </option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="p-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 ORDER DETAILS PREVIEW SECTION (RESTORED) */}
      <div className="space-y-6 mt-10">
        <h2 className="text-xl font-bold">Recent Order Preview</h2>

        {orders.slice(0, 3).map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Order ID</p>
                <p className="font-mono text-sm break-all">{order._id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Customer</p>
                <p className="font-semibold text-sm">
                  {order.user?.name}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded mb-4">
              <p className="text-sm font-semibold mb-2">Items:</p>
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Shipping Address
                </p>
                <p className="text-sm">
                  {order.shippingAddress?.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-primary">
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