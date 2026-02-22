import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import Button from "../components/ui/Button";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const [productRes, reviewsRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/${id}`)
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data.reviews || []);
      } catch (error) {
        toast.error("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to leave a review");
      return;
    }
    try {
      setSubmittingReview(true);
      await API.post(`/reviews/${id}`, { rating, title, comment });
      toast.success("Review submitted!");
      // Refetch reviews
      const { data } = await API.get(`/reviews/${id}`);
      setReviews(data.reviews || []);
      setRating(5);
      setTitle("");
      setComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20 text-red-500">Product not found.</div>;

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-12">
      {/* Product Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-sm">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 flex justify-center items-center h-80 md:h-[400px]">
          <img src={product.image || "https://via.placeholder.com/400"} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
        
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <span className="text-sm text-gray-500 uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-2xl font-bold text-primary">₹{product.price}</span>
              <div className="flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{product.rating || "0.0"}</span>
                <span className="text-gray-500">({product.reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="flex items-center gap-4 pt-4">
               {isOutOfStock ? (
                  <div className="flex-1 bg-red-100 text-red-700 text-center py-3 rounded-xl font-bold uppercase tracking-wider">
                    Out of Stock 
                  </div>
               ) : (
                <Button 
                  variant="primary" 
                  className="flex-1 text-lg py-4"
                  onClick={() => (!user || user.roles === 'admin') ? toast.info("Login as customer to add to cart") : addToCart(product)}
                >
                  Add to Cart
                </Button>
               )}
            <button 
              onClick={() => {
                if(!user) return toast.info("Login to wishlist items");
                isLiked ? removeFromWishlist(product._id) : addToWishlist(product);
              }}
              className="p-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
            >
              {isLiked ? <span className="text-red-500 text-2xl leading-none">❤️</span> : <span className="text-2xl text-gray-500 leading-none">🤍</span>}
            </button>
          </div>
          {isOutOfStock && <p className="text-sm text-red-500 text-center">This product is currently unavailable.</p>}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          Customer Reviews 
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-base">{reviews.length}</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Review Write Column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-semibold">Write a Review</h3>
            {user ? (
              <form onSubmit={submitReview} className="space-y-4 bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Rating (1 to 5)</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Review Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Summarize your thoughts"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Review Details</label>
                  <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    placeholder="What did you like or dislike?"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" 
                    required 
                  />
                </div>
                <Button variant="primary" className="w-full" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-500 mb-4">You must be logged in to leave a review.</p>
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Review Read Column */}
          <div className="lg:col-span-3 space-y-6">
             {reviews.length === 0 ? (
               <div className="text-center text-gray-500 py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                 No reviews yet. Be the first to share your experience!
               </div>
             ) : (
               <div className="space-y-5">
                 {reviews.map((r) => (
                   <div key={r._id} className="border border-gray-100 dark:border-gray-700 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                         <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex justify-center items-center font-bold">
                           {r.userName ? r.userName.charAt(0).toUpperCase() : "U"}
                         </div>
                         <div>
                           <div className="font-semibold text-sm">{r.userName || "Verified Customer"}</div>
                           <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                         </div>
                       </div>
                       <div className="flex text-yellow-500 text-sm">
                         {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                       </div>
                     </div>
                     <h4 className="font-bold mt-3 text-gray-900 dark:text-gray-100">{r.title}</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.comment}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
