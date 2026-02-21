import { useState } from "react";
import { toast } from "react-toastify";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";

const ProductReviews = ({ productId }) => {
  const [reviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.title || !newReview.comment) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      // TODO: Connect to backend API
      const token = localStorage.getItem('token');
      const _response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newReview),
      });

      toast.success("Review submitted successfully!");
      setNewReview({ rating: 5, title: "", comment: "" });
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Customer Reviews</h2>

        {/* Rating Summary */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="text-3xl sm:text-4xl font-bold">{averageRating}</div>
              <div className="flex gap-1 text-lg sm:text-xl">{renderStars(Math.round(averageRating))}</div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Based on {reviews.length} reviews
              </p>
            </div>
            <div className="lg:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-10 sm:w-12 text-xs sm:text-sm">{star} ★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Write Review Form */}
        <Card className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Rating</label>
              <select
                name="rating"
                value={newReview.rating}
                onChange={handleReviewChange}
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base"
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} ★ - {["Excellent", "Good", "Average", "Poor", "Very Poor"][5 - num]}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Review Title"
              name="title"
              value={newReview.title}
              onChange={handleReviewChange}
              placeholder="Summarize your review"
            />

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Your Review</label>
              <textarea
                name="comment"
                value={newReview.comment}
                onChange={handleReviewChange}
                placeholder="Share your detailed thoughts about this product..."
                rows="5"
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Card>

        {/* Reviews List */}
        <div className="space-y-3 sm:space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
                No reviews yet. Be the first to review this product!
              </p>
            </Card>
          ) : (
            reviews.map((review, index) => (
              <Card key={index}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm sm:text-base">{review.title}</h4>
                    <div className="flex gap-1 text-lg sm:text-xl text-yellow-400">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{review.comment}</p>
                <p className="text-xs sm:text-sm font-medium mt-2">by {review.userName || "Anonymous"}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
