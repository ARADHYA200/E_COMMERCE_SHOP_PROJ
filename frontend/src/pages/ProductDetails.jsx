import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import Button from "../components/ui/Button";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState("0.0");
  const user = JSON.parse(localStorage.getItem("user"));

  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        const [productRes, reviewsRes, recommendationRes] =
        await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/${id}`),
          API.get(`/products/${id}/recommendations`)
        ]);

        setProduct(productRes.data);
        setRecommendedProducts(recommendationRes.data);

        const fetchedReviews = reviewsRes.data.reviews || [];
        setReviews(fetchedReviews);

        calculateAverage(fetchedReviews);

      } catch {
        toast.error("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const calculateAverage = (reviewList) => {
    if (reviewList.length > 0) {
      const avg =
        reviewList.reduce((sum, r) => sum + r.rating, 0) /
        reviewList.length;
      setAverageRating(avg.toFixed(1));
    } else {
      setAverageRating("0.0");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to leave a review");
      return;
    }

    try {
      setSubmittingReview(true);

      if (editingReviewId) {
        await API.put(`/reviews/${editingReviewId}`, {
          rating,
          title,
          comment,
        });
        toast.success("Review updated!");
        setEditingReviewId(null);
      } else {
        await API.post(`/reviews/${id}`, {
          rating,
          title,
          comment,
        });
        toast.success("Review submitted!");
      }

      const { data } = await API.get(`/reviews/${id}`);
      const updatedReviews = data.reviews || [];
      setReviews(updatedReviews);
      calculateAverage(updatedReviews);

      setRating(5);
      setTitle("");
      setComment("");

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await API.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted");

      const { data } = await API.get(`/reviews/${id}`);
      const updatedReviews = data.reviews || [];
      setReviews(updatedReviews);
      calculateAverage(updatedReviews);

    } catch {
      toast.error("Failed to delete review");
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20 text-red-500">Product not found.</div>;

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-12">

      {/* PRODUCT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm">

        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 flex justify-center items-center h-80">
          <img
            src={product.image || "https://via.placeholder.com/400"}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <span className="text-sm text-gray-500 uppercase">
              {product.category}
            </span>

            <h1 className="text-3xl font-bold mt-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <span className="text-2xl font-bold text-primary">
                ₹{Number(product.price).toFixed(2)}
              </span>

              <div className="flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{averageRating}</span>
                <span className="text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {product.description}
          </p>

          <div className="flex items-center gap-4 pt-4">
            {isOutOfStock ? (
              <div className="flex-1 bg-red-100 text-red-700 text-center py-3 rounded-xl font-bold">
                Out of Stock
              </div>
            ) : (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() =>
                  (!user || user.role === "admin")
                    ? toast.info("Login as customer to add to cart")
                    : addToCart(product)
                }
              >
                Add to Cart
              </Button>
            )}

            <button
              onClick={() => {
                if (!user) return toast.info("Login to wishlist");
                isLiked
                  ? removeFromWishlist(product._id)
                  : addToWishlist(product);
              }}
              className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              {isLiked ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">
          Customer Reviews ({reviews.length})
        </h2>

        {/* WRITE REVIEW */}
        {user && user.role !== "admin" && (
          <form onSubmit={submitReview} className="space-y-4 bg-gray-50 dark:bg-gray-800 p-5 rounded-xl mb-8">

            <div className="flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`cursor-pointer transition ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-500 scale-110"
                      : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review Title"
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-900"
              required
            />

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review"
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-900 min-h-[100px]"
              required
            />

            <Button 
                type="submit"
                variant="primary" 
                className="w-full"
                disabled={submittingReview}
              >
                {submittingReview
                  ? "Submitting..."
                  : editingReviewId
                  ? "Update Review"
                  : "Submit Review"}
              </Button>

          </form>
        )}

        {/* REVIEW LIST */}
        {reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No reviews yet.
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="border p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">

              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-sm">
                  {r.userName || "Verified Customer"}
                </div>

                <div className="text-yellow-500 text-sm">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
              </div>

              <h4 className="font-bold mt-2">{r.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {r.comment}
              </p>

              {user && r.user === user._id && (
                <div className="flex gap-4 mt-3 text-sm">
                  <button
                    onClick={() => {
                      setEditingReviewId(r._id);
                      setRating(r.rating);
                      setTitle(r.title);
                      setComment(r.comment);
                      window.scrollTo({ top: 500, behavior: "smooth" });
                    }}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteReview(r._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>
      {/* RECOMMENDED PRODUCTS */}

    {recommendedProducts.length > 0 && (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            You May Also Like
          </h2>

          <p className="text-gray-500 mt-1">
            Similar products from the same category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((item) => (
            <ProductCard
              key={item._id}
              product={item}
            />
          ))}
        </div>
      </div>
    )}
    </div>
  );
};

export default ProductDetails;