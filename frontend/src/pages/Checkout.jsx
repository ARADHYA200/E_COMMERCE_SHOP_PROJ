import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { toast } from "react-toastify";
import API from "../services/api";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems } = useContext(CartContext);

  const coShopRoomId = searchParams.get("coShopRoom");
  const isCoShopCheckout = Boolean(coShopRoomId);

  const [sharedRoom, setSharedRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!coShopRoomId) {
      setSharedRoom(null);
      return undefined;
    }

    let cancelled = false;

    const fetchSharedRoom = async () => {
      setLoadingRoom(true);
      try {
        const { data } = await API.get(`/co-shop/${coShopRoomId}`);
        if (!cancelled) setSharedRoom(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load the Co-Shop shared cart."
          );
          setSharedRoom(null);
        }
      } finally {
        if (!cancelled) setLoadingRoom(false);
      }
    };

    fetchSharedRoom();
    return () => {
      cancelled = true;
    };
  }, [coShopRoomId]);

  const checkoutItems = useMemo(() => {
    if (!isCoShopCheckout) return cartItems;

    return (sharedRoom?.sharedCart || [])
      .filter((item) => item.product)
      .map((item) => ({
        _id: item.product._id,
        name: item.product.name,
        price: Number(item.product.price || 0),
        quantity: Number(item.quantity || 1),
        stock: item.product.stock,
        cartItemId: item._id,
        image: item.product.image,
      }));
  }, [isCoShopCheckout, cartItems, sharedRoom]);

  const checkoutTotal = useMemo(
    () =>
      checkoutItems.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [checkoutItems]
  );

  const finalTotal = Math.max(0, checkoutTotal - discount);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    if (!checkoutItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const { data } = await API.post("/coupons/apply", {
        code,
        orderAmount: checkoutTotal,
      });
      setDiscount(Number(data.coupon?.discount || 0));
      setAppliedCoupon(data.coupon || { code });
      setCouponCode(code);
      toast.success("Coupon applied. It will be revalidated when placing the order.");
    } catch (error) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || "Invalid coupon");
    }
  };

  const handleOrder = async () => {
    if (placingOrder) return;

    const name = formData.name.trim();
    const address = formData.address.trim();
    const phone = formData.phone.trim();

    if (!name || !address || !phone) {
      toast.error("Please fill all shipping details");
      return;
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (loadingRoom) {
      toast.error("Please wait while the shared cart loads");
      return;
    }
    if (isCoShopCheckout && !sharedRoom) {
      toast.error("Unable to load the shared room");
      return;
    }
    if (!checkoutItems.length) {
      toast.error("Cart is empty");
      return;
    }
    if (isCoShopCheckout && sharedRoom.status !== "active") {
      toast.error("This Co-Shop room is closed");
      return;
    }
    if (couponCode.trim() && !appliedCoupon) {
      toast.error("Please apply the coupon or clear the coupon code");
      return;
    }

    setPlacingOrder(true);
    try {
      const orderData = {
        orderItems: checkoutItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: { name, address, phone },
        // Backend recalculates prices and discount; these values are display-only.
        totalAmount: finalTotal,
        paymentMethod,
        // Demo payment is not verified by a gateway. Backend should keep it Pending.
        paymentStatus: "Pending",
        transactionId: null,
        ...(appliedCoupon?.code
          ? { couponCode: appliedCoupon.code }
          : {}),
        ...(isCoShopCheckout ? { coShopRoom: coShopRoomId } : {}),
      };

      await API.post("/orders", orderData);

      if (isCoShopCheckout) {
        const cartItemsToRemove = [...(sharedRoom?.sharedCart || [])];
        const results = await Promise.allSettled(
          cartItemsToRemove.map((item) =>
            API.delete(`/co-shop/${coShopRoomId}/cart/${item._id}`)
          )
        );
        if (results.some((result) => result.status === "rejected")) {
          toast.warning(
            "Order placed, but some shared-cart items could not be cleared."
          );
        }
      } else {
        // CartProvider must handle this event to clear its in-memory state too.
        window.dispatchEvent(new Event("cart:checkout-complete"));
      }

      toast.success("Order placed successfully 🎉");
      navigate("/orders", {
        state: { justOrdered: true, fromCoShop: isCoShopCheckout },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>
            {isCoShopCheckout && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Co-Shop shared cart{sharedRoom?.name ? ` · ${sharedRoom.name}` : ""}
              </p>
            )}
          </div>

          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
          <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
          <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />

          <div className="space-y-2">
            <label htmlFor="paymentMethod" className="font-semibold">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="UPI">UPI (Demo)</option>
              <option value="CARD">Card (Demo)</option>
            </select>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              if (paymentMethod === "COD") handleOrder();
              else {
                if (!checkoutItems.length) {
                  toast.error("Cart is empty");
                  return;
                }
                setShowPaymentModal(true);
              }
            }}
            disabled={placingOrder || loadingRoom || (isCoShopCheckout && !sharedRoom)}
          >
            {placingOrder ? "Placing Order..." : loadingRoom ? "Loading Shared Cart..." : "Place Order"}
          </Button>

          {isCoShopCheckout && (
            <Button variant="secondary" className="w-full" onClick={() => navigate("/co-shop")} disabled={placingOrder}>
              Back to Co-Shop
            </Button>
          )}
        </div>

        <div className="space-y-4 rounded-xl bg-white p-4 shadow-md dark:bg-gray-900 sm:space-y-6 sm:p-6 lg:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">Order Summary</h2>
          {loadingRoom ? (
            <p className="text-sm text-gray-500">Loading cart items...</p>
          ) : checkoutItems.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            checkoutItems.map((item) => (
              <div key={item.cartItemId || item._id} className="flex items-start justify-between gap-3 text-sm sm:text-base">
                <span className="min-w-0 break-words">{item.name} × {item.quantity}</span>
                <span className="shrink-0 font-medium">{formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</span>
              </div>
            ))
          )}

          <hr className="border-gray-300 dark:border-gray-700" />

          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input
                label=""
                name="couponCode"
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value);
                  setDiscount(0);
                  setAppliedCoupon(null);
                }}
                placeholder="Enter coupon code"
              />
            </div>
            <Button variant="secondary" onClick={handleApplyCoupon} className="mb-0.5 h-[42px] shrink-0 whitespace-nowrap" disabled={placingOrder || loadingRoom}>
              Apply
            </Button>
          </div>

          {discount > 0 && (
            <div className="flex justify-between gap-3 text-sm font-semibold text-green-600 sm:text-base">
              <span>Discount ({appliedCoupon?.code})</span>
              <span>- {formatPrice(discount)}</span>
            </div>
          )}

          <hr className="border-gray-300 dark:border-gray-700" />
          <div className="flex justify-between gap-3 text-base font-bold sm:text-lg">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>

          {isCoShopCheckout && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your personal cart remains separate from the Co-Shop shared cart.
            </p>
          )}
          {appliedCoupon && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Coupon is revalidated on the server when the order is placed. The final total may change if the coupon is not eligible for every item.
            </p>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-bold">{paymentMethod} Payment (Demo)</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Amount: {formatPrice(finalTotal)}</p>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                disabled={placingOrder}
                onClick={async () => {
                  setShowPaymentModal(false);
                  await handleOrder();
                }}
              >
                {placingOrder ? "Processing..." : "Continue with Demo Order"}
              </Button>
              <Button variant="danger" disabled={placingOrder} onClick={() => {
                setShowPaymentModal(false);
                toast.error("Demo payment cancelled. No order was placed.");
              }}>
                ❌ Cancel Payment
              </Button>
              <Button variant="secondary" disabled={placingOrder} onClick={() => setShowPaymentModal(false)}>
                Close
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              This is a demo flow, not a real payment gateway. Payment status remains Pending.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;

// import { useContext, useEffect, useMemo, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { CartContext } from "../context/CartContext";
// import Button from "../components/ui/Button";
// import Input from "../components/ui/Input";
// import { toast } from "react-toastify";
// import API from "../services/api";

// const formatPrice = (price) =>
//   `₹${Number(price || 0).toLocaleString("en-IN", {
//     maximumFractionDigits: 2,
//   })}`;

// const Checkout = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const { cartItems } = useContext(CartContext);

//   // Co-Shop checkout is enabled using /checkout?coShopRoom=ROOM_ID
//   const coShopRoomId = searchParams.get("coShopRoom");
//   const isCoShopCheckout = Boolean(coShopRoomId);

//   const [sharedRoom, setSharedRoom] = useState(null);
//   const [loadingRoom, setLoadingRoom] = useState(false);
//   const [placingOrder, setPlacingOrder] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     address: "",
//     phone: "",
//   });

//   const [couponCode, setCouponCode] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [showPaymentModal, setShowPaymentModal] = useState(false);

//   // Load the shared room only when the checkout URL contains its ID.
//   useEffect(() => {
//     if (!coShopRoomId) {
//       setSharedRoom(null);
//       return;
//     }

//     let cancelled = false;

//     const fetchSharedRoom = async () => {
//       setLoadingRoom(true);

//       try {
//         const { data } = await API.get(`/co-shop/${coShopRoomId}`);

//         if (!cancelled) {
//           setSharedRoom(data);
//         }
//       } catch (error) {
//         if (!cancelled) {
//           toast.error(
//             error.response?.data?.message ||
//               "Unable to load the Co-Shop shared cart."
//           );
//           setSharedRoom(null);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoadingRoom(false);
//         }
//       }
//     };

//     fetchSharedRoom();

//     return () => {
//       cancelled = true;
//     };
//   }, [coShopRoomId]);

//   // Keep the two carts separate.
//   const checkoutItems = useMemo(() => {
//     if (!isCoShopCheckout) {
//       return cartItems;
//     }

//     return (sharedRoom?.sharedCart || [])
//       .filter((item) => item.product)
//       .map((item) => ({
//         _id: item.product._id,
//         name: item.product.name,
//         price: Number(item.product.price || 0),
//         quantity: Number(item.quantity || 1),
//         stock: item.product.stock,
//         cartItemId: item._id,
//         image: item.product.image,
//       }));
//   }, [isCoShopCheckout, cartItems, sharedRoom]);

//   const checkoutTotal = useMemo(
//     () =>
//       checkoutItems.reduce(
//         (total, item) =>
//           total + Number(item.price || 0) * Number(item.quantity || 0),
//         0
//       ),
//     [checkoutItems]
//   );

//   const finalTotal = Math.max(0, checkoutTotal - discount);

//   const handleChange = (e) => {
//     setFormData((previous) => ({
//       ...previous,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleApplyCoupon = async () => {
//     const code = couponCode.trim();

//     if (!code) {
//       toast.error("Enter a coupon code");
//       return;
//     }

//     if (!checkoutItems.length) {
//       toast.error("Your cart is empty");
//       return;
//     }

//     try {
//       const { data } = await API.post("/coupons/apply", {
//         code,
//         orderAmount: checkoutTotal,
//       });

//       setDiscount(Number(data.coupon.discount || 0));
//       setAppliedCoupon(data.coupon);
//       toast.success("Coupon applied successfully!");
//     } catch (error) {
//       setDiscount(0);
//       setAppliedCoupon(null);
//       toast.error(
//         error.response?.data?.message || "Invalid coupon"
//       );
//     }
//   };

//   const handleOrder = async () => {
//     if (placingOrder) return;

//     const name = formData.name.trim();
//     const address = formData.address.trim();
//     const phone = formData.phone.trim();

//     if (!name || !address || !phone) {
//       toast.error("Please fill all shipping details");
//       return;
//     }

//     if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
//       toast.error("Please enter a valid phone number");
//       return;
//     }

//     if (loadingRoom) {
//       toast.error("Please wait while the shared cart loads");
//       return;
//     }

//     if (isCoShopCheckout && !sharedRoom) {
//       toast.error("Unable to load the shared room");
//       return;
//     }

//     if (!checkoutItems.length) {
//       toast.error("Cart is empty");
//       return;
//     }

//     if (isCoShopCheckout && sharedRoom.status !== "active") {
//       toast.error("This Co-Shop room is closed");
//       return;
//     }

//     setPlacingOrder(true);

//     try {
//       const transactionId =
//         paymentMethod === "COD" ? null : `TXN_${Date.now()}`;

//       const orderData = {
//         orderItems: checkoutItems.map((item) => ({
//           product: item._id,
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//         shippingAddress: {
//           name,
//           address,
//           phone,
//         },
//         totalAmount: finalTotal,
//         paymentMethod,
//         paymentStatus:
//           paymentMethod === "COD" ? "Pending" : "Paid",
//         transactionId,

//         // Additional metadata for future order tracking.
//         // Existing backend may ignore this field.
//         coShopRoom: isCoShopCheckout ? coShopRoomId : undefined,
//       };

//       await API.post("/orders", orderData);

//       // Clear only the cart used for this checkout.
//       if (isCoShopCheckout) {
//         // The order has already been created. Remove purchased items
//         // from the shared cart without touching the personal cart.
//         const cartItemsToRemove = [
//           ...(sharedRoom?.sharedCart || []),
//         ];

//         const results = await Promise.allSettled(
//           cartItemsToRemove.map((item) =>
//             API.delete(
//               `/co-shop/${coShopRoomId}/cart/${item._id}`
//             )
//           )
//         );

//         const failedRemovals = results.some(
//           (result) => result.status === "rejected"
//         );

//         if (failedRemovals) {
//           toast.warning(
//             "Order placed, but some shared-cart items could not be cleared."
//           );
//         }
//       } else {
//         // CartProvider persists its state to localStorage.
//         // Clearing localStorage alone is insufficient because its
//         // in-memory state could write the old cart back.
//         localStorage.removeItem("cart");
//         window.dispatchEvent(new Event("cart:checkout-complete"));
//       }

//       toast.success("Order placed successfully 🎉");

//       navigate("/orders", {
//         state: {
//           justOrdered: true,
//           fromCoShop: isCoShopCheckout,
//         },
//       });
//     } catch (error) {
//       console.error("Checkout error:", error);

//       toast.error(
//         error.response?.data?.message || "Order failed"
//       );
//     } finally {
//       setPlacingOrder(false);
//     }
//   };

//   return (
//     <>
//       <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
//         {/* Shipping Form */}
//         <div className="space-y-4 sm:space-y-6">
//           <div>
//             <h1 className="text-2xl font-bold sm:text-3xl">
//               Checkout
//             </h1>

//             {isCoShopCheckout && (
//               <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
//                 Co-Shop shared cart
//                 {sharedRoom?.name
//                   ? ` · ${sharedRoom.name}`
//                   : ""}
//               </p>
//             )}
//           </div>

//           <Input
//             label="Full Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//           />

//           <Input
//             label="Address"
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//           />

//           <Input
//             label="Phone Number"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//           />

//           <div className="space-y-2">
//             <label
//               htmlFor="paymentMethod"
//               className="font-semibold"
//             >
//               Payment Method
//             </label>

//             <select
//               id="paymentMethod"
//               value={paymentMethod}
//               onChange={(e) => setPaymentMethod(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
//             >
//               <option value="COD">Cash on Delivery</option>
//               <option value="UPI">UPI (Demo)</option>
//               <option value="CARD">Card (Demo)</option>
//             </select>
//           </div>

//           <Button
//             variant="primary"
//             className="w-full"
//             onClick={() => {
//               if (paymentMethod === "COD") {
//                 handleOrder();
//               } else {
//                 if (!checkoutItems.length) {
//                   toast.error("Cart is empty");
//                   return;
//                 }

//                 setShowPaymentModal(true);
//               }
//             }}
//             disabled={
//               placingOrder ||
//               loadingRoom ||
//               (isCoShopCheckout && !sharedRoom)
//             }
//           >
//             {placingOrder
//               ? "Placing Order..."
//               : loadingRoom
//               ? "Loading Shared Cart..."
//               : "Place Order"}
//           </Button>

//           {isCoShopCheckout && (
//             <Button
//               variant="secondary"
//               className="w-full"
//               onClick={() => navigate("/co-shop")}
//               disabled={placingOrder}
//             >
//               Back to Co-Shop
//             </Button>
//           )}
//         </div>

//         {/* Order Summary */}
//         <div className="space-y-4 rounded-xl bg-white p-4 shadow-md dark:bg-gray-900 sm:space-y-6 sm:p-6 lg:p-8">
//           <h2 className="text-lg font-semibold sm:text-xl">
//             Order Summary
//           </h2>

//           {loadingRoom ? (
//             <p className="text-sm text-gray-500">
//               Loading cart items...
//             </p>
//           ) : checkoutItems.length === 0 ? (
//             <p className="text-sm text-gray-500">
//               Your cart is empty.
//             </p>
//           ) : (
//             checkoutItems.map((item) => (
//               <div
//                 key={item.cartItemId || item._id}
//                 className="flex items-start justify-between gap-3 text-sm sm:text-base"
//               >
//                 <span className="min-w-0 break-words">
//                   {item.name} × {item.quantity}
//                 </span>

//                 <span className="shrink-0 font-medium">
//                   {formatPrice(
//                     Number(item.price || 0) *
//                       Number(item.quantity || 0)
//                   )}
//                 </span>
//               </div>
//             ))
//           )}

//           <hr className="border-gray-300 dark:border-gray-700" />

//           {/* Coupon Section */}
//           <div className="flex items-end gap-2">
//             <div className="min-w-0 flex-1">
//               <Input
//                 label=""
//                 name="couponCode"
//                 value={couponCode}
//                 onChange={(e) => {
//                   setCouponCode(e.target.value);
//                   setDiscount(0);
//                   setAppliedCoupon(null);
//                 }}
//                 placeholder="Enter coupon code"
//               />
//             </div>

//             <Button
//               variant="secondary"
//               onClick={handleApplyCoupon}
//               className="mb-0.5 h-[42px] shrink-0 whitespace-nowrap"
//               disabled={placingOrder || loadingRoom}
//             >
//               Apply
//             </Button>
//           </div>

//           {discount > 0 && (
//             <div className="flex justify-between gap-3 text-sm font-semibold text-green-600 sm:text-base">
//               <span>
//                 Discount ({appliedCoupon?.code})
//               </span>
//               <span>- {formatPrice(discount)}</span>
//             </div>
//           )}

//           <hr className="border-gray-300 dark:border-gray-700" />

//           <div className="flex justify-between gap-3 text-base font-bold sm:text-lg">
//             <span>Total</span>
//             <span>{formatPrice(finalTotal)}</span>
//           </div>

//           {isCoShopCheckout && (
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               Placing this order will attempt to remove the purchased
//               items from the shared cart. Your personal cart remains
//               separate.
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Demo Payment Modal */}
//       {showPaymentModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
//             <h2 className="mb-4 text-xl font-bold">
//               {paymentMethod} Payment (Demo)
//             </h2>

//             <p className="mb-6 text-gray-600 dark:text-gray-400">
//               Amount: {formatPrice(finalTotal)}
//             </p>

//             <div className="flex flex-col gap-3">
//               <Button
//                 variant="primary"
//                 disabled={placingOrder}
//                 onClick={async () => {
//                   setShowPaymentModal(false);
//                   await handleOrder();
//                 }}
//               >
//                 {placingOrder
//                   ? "Processing..."
//                   : "✅ Payment Success"}
//               </Button>

//               <Button
//                 variant="danger"
//                 disabled={placingOrder}
//                 onClick={() => {
//                   setShowPaymentModal(false);
//                   toast.error("Payment Failed ❌");
//                 }}
//               >
//                 ❌ Payment Failed
//               </Button>

//               <Button
//                 variant="secondary"
//                 disabled={placingOrder}
//                 onClick={() => setShowPaymentModal(false)}
//               >
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Checkout;
