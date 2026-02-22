import express from "express";
import { 
  createOrder, 
  getOrders, 
  getMyOrders,
  updateOrder,
  cancelOrder,
  deleteOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Order (protected)
router.post("/", protect, createOrder);

// Get All Orders (protected) - admin sees all, users see their own
router.get("/", protect, getOrders);

// Get My Orders specifically (protected) - for backward compatibility
router.get("/my", protect, getMyOrders);

// User actions on their orders
router.put("/:id", protect, updateOrder);
router.put("/:id/cancel", protect, cancelOrder);
router.delete("/:id", protect, deleteOrder);

// Admin actions
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;