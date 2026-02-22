import { useState, useEffect } from "react";
import { WishlistContext } from "./WishlistContext";
import API from "../services/api";

const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await API.get("/wishlist");
        setWishlistItems(data);
      } catch (error) {
        console.error("Failed to fetch wishlist");
      }
    };
    if (user?.token && user?.role !== "admin") {
      fetchWishlist();
    }
  }, [user?.token]);

  const addToWishlist = async (product) => {
    // Optimistic UI updates could go here, or just fetch
    const previous = [...wishlistItems];
    setWishlistItems((prev) => [...prev, product]);
    try {
      const { data } = await API.post("/wishlist", { productId: product._id });
      setWishlistItems(data);
    } catch (error) {
      setWishlistItems(previous);
    }
  };

  const removeFromWishlist = async (productId) => {
    const previous = [...wishlistItems];
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    try {
      const { data } = await API.delete(`/wishlist/${productId}`);
      setWishlistItems(data);
    } catch (error) {
      setWishlistItems(previous);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const clearWishlist = async () => {
    const previous = [...wishlistItems];
    setWishlistItems([]);
    try {
      await API.delete("/wishlist");
    } catch (error) {
      setWishlistItems(previous);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
