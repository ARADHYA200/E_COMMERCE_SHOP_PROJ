import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const OrderHistory = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/orders");
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
        } else {
          toast.error("Failed to fetch orders");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOrders();
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
        <h2 className="text-xl sm:text-2xl font-bold">No Orders Found</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Start shopping to create your first order!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
            <div className="break-all">
              <span className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Order ID:
              </span>{" "}
              <span className="text-gray-900 dark:text-white font-mono text-xs sm:text-sm">
                {order._id}
              </span>
            </div>
            <span className="text-primary font-bold text-base sm:text-lg whitespace-nowrap">
              ₹{order.totalAmount}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
              Items:
            </p>
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between text-xs sm:text-sm pl-3 sm:pl-4 gap-2">
                <span className="truncate">
                  {item.name} x {item.quantity}
                </span>
                <span className="flex-shrink-0">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded space-y-1">
            <p className="text-xs sm:text-sm break-all"><span className="font-semibold">Shipping Address:</span> {order.shippingAddress.address}</p>
            <p className="text-xs sm:text-sm"><span className="font-semibold">Phone:</span> {order.shippingAddress.phone}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Status: <span className="font-semibold text-green-600">{order.orderStatus}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400 sm:text-right">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;