import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/stats", protect, admin, getDashboardStats);
router.get("/orders", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
export default router;