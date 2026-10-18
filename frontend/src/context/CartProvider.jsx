import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify";

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (!storedCart) return [];

      const parsedCart = JSON.parse(storedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Unable to read cart from localStorage:", error);
      return [];
    }
  });

  // Persist the current cart whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Unable to save cart to localStorage:", error);
    }
  }, [cartItems]);

  // Clear the personal cart after a successful checkout.
  // Checkout.jsx dispatches this event only after the order is created.
  useEffect(() => {
    const handleCheckoutComplete = () => {
      setCartItems([]);
      try {
        localStorage.setItem("cart", JSON.stringify([]));
      } catch (error) {
        console.error("Unable to clear cart from localStorage:", error);
      }
    };

    window.addEventListener("cart:checkout-complete", handleCheckoutComplete);

    return () => {
      window.removeEventListener(
        "cart:checkout-complete",
        handleCheckoutComplete
      );
    };
  }, []);

  // ADD TO CART
  const addToCart = (product) => {
    if (!product?._id) {
      toast.error("Unable to add this product to cart");
      return;
    }

    const stock = Number(product.stock ?? 0);
    const existing = cartItems.find(
      (item) => item._id === product._id
    );

    if (existing) {
      if (existing.quantity + 1 > stock) {
        toast.error(`Cannot add more than available stock (${stock})`);
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.info("Product quantity updated");
    } else {
      if (stock < 1) {
        toast.error("This product is out of stock");
        return;
      }

      setCartItems((currentItems) => [
        ...currentItems,
        { ...product, quantity: 1 },
      ]);
      toast.success("Product added to cart");
    }
  };

  // REMOVE FROM CART
  const removeFromCart = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== id)
    );
    toast.info("Product removed from cart");
  };

  // UPDATE QUANTITY
  const updateQuantity = (id, qty) => {
    const requestedQuantity = Number(qty);
    if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) return;

    const existing = cartItems.find((item) => item._id === id);
    if (!existing) return;

    const stock = Number(existing.stock ?? 0);
    const safeQuantity = Math.min(Math.floor(requestedQuantity), stock);

    if (safeQuantity < 1) {
      toast.error("This product is currently out of stock");
      return;
    }

    if (requestedQuantity > stock) {
      toast.error(`Only ${stock} units available in stock`);
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === id
          ? { ...item, quantity: safeQuantity }
          : item
      )
    );
  };

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
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
