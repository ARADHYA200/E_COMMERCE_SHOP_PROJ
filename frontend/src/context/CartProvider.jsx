import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify";

const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ ADD TO CART
  const addToCart = (product) => {
    const existing = cartItems.find(
      (item) => item._id === product._id
    );

    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.info("Product quantity updated");
    } else {
      setCartItems([
        ...cartItems,
        { ...product, quantity: 1 },
      ]);
      toast.success("Product added to cart");
    }
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = (id) => {
    setCartItems(
      cartItems.filter((item) => item._id !== id)
    );
    toast.error("Product removed from cart");
  };

  // ✅ UPDATE QUANTITY
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;

    setCartItems(
      cartItems.map((item) =>
        item._id === id
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;