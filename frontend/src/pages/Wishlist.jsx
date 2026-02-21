import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { CartContext } from "../context/CartContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } =
    useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    toast.success(`${product.name} moved to cart!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❤️</div>
        <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Add items to your wishlist to save them for later!
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold">My Wishlist</h1>
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm("Clear all items from wishlist?")) {
              clearWishlist();
              toast.success("Wishlist cleared!");
            }
          }}
          className="w-full sm:w-auto"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {wishlistItems.map((product) => (
          <Card key={product._id} className="flex flex-col">
            <div className="relative mb-4">
              <img
                src={product.image || "https://via.placeholder.com/300"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  removeFromWishlist(product._id);
                  toast.success("Removed from wishlist");
                }}
                className="absolute top-2 right-2 bg-danger text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                ❌
              </button>
            </div>

            <h3 className="font-bold text-lg mb-2">{product.name}</h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
              {product.description?.substring(0, 100)}...
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 line-through">
                    ${product.price * 1.2}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ${product.price}
                  </p>
                </div>
                <div className="text-yellow-400">{product.rating || 0} ★</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleMoveToCart(product)}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
