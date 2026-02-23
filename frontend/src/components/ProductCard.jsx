import Card from "./ui/Card";
import Button from "./ui/Button";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useContext(WishlistContext);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const isLiked = isInWishlist(product._id);
  const showActions = !user || user.role !== "admin";

  const handleCartClick = () => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(product);
  };

  const handleWishlistClick = () => {
    if (!user) {
      toast.info("Please login to add items to wishlist");
      navigate("/login");
      return;
    }
    isLiked
      ? removeFromWishlist(product._id)
      : addToWishlist(product);
  };

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <Card className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col p-4 relative">

      {showActions && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {isLiked ? (
            <span className="text-red-500 text-xl">❤️</span>
          ) : (
            <span className="text-gray-400 hover:text-red-400 text-xl">🤍</span>
          )}
        </button>
      )}

      <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
        <img
          src={product.image || "https://via.placeholder.com/300"}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex gap-2 items-center mb-2">
        <span className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
          {product.category || "General"}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center mb-2">
        {product.rating && product.rating > 0 ? (
          <>
            <div className="flex text-yellow-500 text-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.round(product.rating) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {product.rating.toFixed(1)} ({product.reviews || 0} reviews)
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            No Reviews Yet
          </span>
        )}
      </div>

      <p className="text-indigo-600 text-xl font-bold mb-4">
        ₹{product.price}
      </p>

      <p className="text-sm text-gray-500 mb-4">
        Stock: {product.stock}
      </p>

      {showActions && (
        <div className="flex gap-2 mt-auto">
          {product.stock <= 0 ? (
            <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-center py-2 rounded-lg font-semibold border border-gray-200 dark:border-gray-700">
              Out of Stock
            </div>
          ) : (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCartClick}
            >
              Add to Cart
            </Button>
          )}

          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      )}

      {!showActions && (
        <div className="mt-auto pt-4 text-center text-sm text-gray-500">
          Admin Preview
        </div>
      )}
    </Card>
  );
};

export default ProductCard;