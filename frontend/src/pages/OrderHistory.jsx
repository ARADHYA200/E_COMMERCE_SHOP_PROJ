import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import { useLocation } from "react-router-dom";

const OrderHistory = () => {
  const location = useLocation(); // ✅ moved inside component
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    shippingAddress: { address: "", phone: "", name: "" },
    orderItems: []
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // ✅ fixed endpoint
      const { data } = await API.get("/orders/my");

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

  useEffect(() => {
    if (user?.token) {
      fetchOrders();
    }
  }, []);

  // ✅ success toast after redirect
  useEffect(() => {
    if (location.state?.justOrdered) {
      toast.success("🎉 Order placed successfully!");
    }
  }, [location.state]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.put(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this order history?")) return;
    try {
      await API.delete(`/orders/${orderId}`);
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const startEditing = (order) => {
    setEditingOrderId(order._id);
    setEditFormData({
      shippingAddress: { ...order.shippingAddress },
      orderItems: order.orderItems.map(item => ({ ...item }))
    });
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditFormData({ shippingAddress: { address: "", phone: "", name: "" }, orderItems: [] });
  };

  const handleEditChange = (field, value, itemIndex = null) => {
    if (itemIndex !== null) {
      const newItems = [...editFormData.orderItems];
      newItems[itemIndex][field] = value;
      setEditFormData({ ...editFormData, orderItems: newItems });
    } else {
      setEditFormData({
        ...editFormData,
        shippingAddress: { ...editFormData.shippingAddress, [field]: value }
      });
    }
  };

  const submitEdit = async (orderId) => {
    try {
      const sanitizedItems = editFormData.orderItems.map(item => ({
        ...item,
        product: item.product?._id || item.product
      }));

      await API.put(`/orders/${orderId}`, {
        shippingAddress: editFormData.shippingAddress,
        orderItems: sanitizedItems
      });

      toast.success("Order updated successfully");
      setEditingOrderId(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

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

      {orders.map((order) => {
        const isEditing = editingOrderId === order._id;

        const timelineStatuses = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered"];
        const currentStatusIndex = timelineStatuses.indexOf(order.orderStatus);
        const isCancelled = order.orderStatus === "Cancelled";

        return (
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

            {/* Editing UI vs Normal UI */}
            {isEditing ? (
              <div className="space-y-4 border border-blue-200 dark:border-blue-900 p-4 rounded-lg bg-blue-50 dark:bg-gray-800">
                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300">Edit Order</h3>
                
                {/* Edit Items */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Order Items (Quantities)</p>
                  {editFormData.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-900 p-2 rounded">
                      <span className="text-sm truncate flex-1">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">₹{item.price} x</span>
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity} 
                          onChange={(e) => handleEditChange('quantity', parseInt(e.target.value) || 1, idx)}
                          className="w-16 p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Address */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Shipping Address</p>
                  <input 
                    type="text"
                    value={editFormData.shippingAddress.address}
                    onChange={(e) => handleEditChange('address', e.target.value)}
                    className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Address"
                  />
                  <input 
                    type="text"
                    value={editFormData.shippingAddress.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                    className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Phone Number"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
                  <Button variant="primary" onClick={() => submitEdit(order._id)}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <>
                {/* Order Tracking Timeline */}
                <div className="py-2 sm:py-4 border-b border-gray-100 dark:border-gray-800 mb-2">
                  <div className="relative flex justify-between items-center text-xs sm:text-sm font-medium">
                    {/* Background Progress Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded z-0 px-2 sm:px-6"></div>

                    {/* Active Progress Bar */}
                    {!isCancelled && (
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded z-0 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStatusIndex) / (timelineStatuses.length - 1)) * 100}%`,
                          marginLeft: '1%',
                          marginRight: '1%'
                        }}
                      ></div>
                    )}

                    {/* Timeline Nodes */}
                    {timelineStatuses.map((status, index) => {
                      const isCompleted = currentStatusIndex >= index;
                      const isCurrent = currentStatusIndex === index;
                      const nodeColor = isCancelled
                        ? "bg-red-500 border-red-500 text-white"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400";

                      return (
                        <div key={status} className="relative z-10 flex flex-col items-center flex-1">
                          <div
                            className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${nodeColor} ${
                              isCurrent && !isCancelled ? "ring-4 ring-green-100 dark:ring-green-900" : ""
                            }`}
                          >
                            {isCompleted && !isCancelled && (
                              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {isCancelled && index === currentStatusIndex && (
                              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className={`mt-2 text-[10px] sm:text-xs text-center hidden sm:block ${
                            (isCompleted || (isCancelled && index === currentStatusIndex)) ? "text-gray-900 dark:text-white font-bold" : "text-gray-500"
                          }`}>
                            {isCancelled && index === currentStatusIndex ? "Cancelled" : status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-center sm:hidden block text-xs font-bold text-gray-700 dark:text-gray-200">
                    Current Status: <span className={isCancelled ? "text-red-500" : "text-green-600"}>{order.orderStatus}</span>
                  </div>
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
                
                <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">Payment Method:</span>
                    {order.paymentMethod}
                  </p>

                  <p className="text-sm">
                    <span className="font-semibold">Payment Status:</span>
                    {order.paymentStatus}
                  </p>

                  {order.transactionId && (
                    <p className="text-sm">
                      <span className="font-semibold">Transaction ID:</span>
                      {order.transactionId}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    Status: 
                    <span className={`font-semibold px-2 py-0.5 rounded-full ${
                      order.orderStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.orderStatus === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : order.orderStatus === "Shipped"
                        ? "bg-indigo-100 text-indigo-800"
                        : order.orderStatus === "Out for Delivery"
                        ? "bg-purple-100 text-purple-800"
                        : order.orderStatus === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions for Pending Orders */}
                {order.orderStatus === "Pending" && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="secondary" onClick={() => startEditing(order)}>
                      Edit Order
                    </Button>
                    <Button variant="danger" onClick={() => handleCancelOrder(order._id)}>
                      Cancel Order
                    </Button>
                  </div>
                )}
                {/* Actions for Non-Pending Orders */}
                {order.orderStatus !== "Pending" && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="secondary" onClick={() => handleDeleteOrder(order._id)}>
                      Delete Order History
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistory;