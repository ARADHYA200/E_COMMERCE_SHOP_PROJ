import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      reviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || !title || !comment) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create review
    const review = new Review({
      product: productId,
      user: userId,
      userName: req.user.name,
      rating,
      title,
      comment,
      verified: true,
    });

    await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.rating = parseFloat(avgRating.toFixed(1));
    product.reviews = allReviews.length;
    await product.save();

    res
      .status(201)
      .json({ message: "Review created successfully", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    const allReviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    if (allReviews.length > 0) {
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      product.rating = parseFloat(avgRating.toFixed(1));
    } else {
      product.rating = 0;
    }
    product.reviews = allReviews.length;
    await product.save();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review marked as helpful", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error marking review", error: error.message });
  }
};
