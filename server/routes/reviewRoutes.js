import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/:productId", getProductReviews);

// Protected routes
router.post("/:productId", protect, createReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.post("/:reviewId/helpful", protect, markHelpful);

export default router;
