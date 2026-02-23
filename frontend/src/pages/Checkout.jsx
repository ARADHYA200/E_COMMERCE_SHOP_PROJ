import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { toast } from "react-toastify";
import API from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, totalPrice } = useContext(CartContext);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("Enter a coupon code");
    try {
      const { data } = await API.post("/coupons/apply", {
        code: couponCode,
        orderAmount: totalPrice,
      });
      setDiscount(data.coupon.discount);
      setAppliedCoupon(data.coupon);
      toast.success("Coupon applied successfully!");
    } catch (error) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || "Invalid coupon");
    }
  };

const handleOrder = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error("Please fill all details");
      return;
    }

    if (!cartItems.length) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: formData,
        totalAmount: totalPrice - discount,
      };

      await API.post("/orders", orderData);

      toast.success("Order placed successfully 🎉");

      // Clear cart
      localStorage.removeItem("cart");

      // ✅ Redirect to Order History instead of Home
      navigate("/orders", { state: { justOrdered: true } });

    } catch (error) {
      console.error(error);
      toast.error("Order failed");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6">

      {/* Shipping Form */}
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <Button variant="primary" onClick={handleOrder} className="w-full">
          Place Order
        </Button>
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold">Order Summary</h2>

        {cartItems.map((item) => (
          <div key={item._id} className="flex justify-between text-sm sm:text-base">
            <span className="truncate">
              {item.name} x {item.quantity}
            </span>
            <span className="ml-2 flex-shrink-0">
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}

        <hr className="border-gray-300 dark:border-gray-700" />
        
        {/* Coupon Section */}
        <div className="flex gap-2">
          <Input 
            label=""
            name="couponCode"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setDiscount(0);
              setAppliedCoupon(null);
            }}
            placeholder="Enter coupon code"
          />
          <Button variant="secondary" onClick={handleApplyCoupon} className="whitespace-nowrap h-[42px] mt-[2px]">
            Apply
          </Button>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-semibold text-sm sm:text-base">
            <span>Discount ({appliedCoupon?.code})</span>
            <span>- ₹{discount}</span>
          </div>
        )}

        <hr className="border-gray-300 dark:border-gray-700" />

        <div className="flex justify-between font-bold text-base sm:text-lg">
          <span>Total</span>
          <span>₹{totalPrice - discount}</span>
        </div>
      </div>

    </div>
  );
};

export default Checkout;