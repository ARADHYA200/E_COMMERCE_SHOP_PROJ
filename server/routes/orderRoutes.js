import express from "express";
import { createOrder, getOrders, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Order (protected)
router.post("/", protect, createOrder);

// Get All Orders (protected) - admin sees all, users see their own
router.get("/", protect, getOrders);

// Get My Orders specifically (protected) - for backward compatibility
router.get("/my", protect, getMyOrders);

export default router;