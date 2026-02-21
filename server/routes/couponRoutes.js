import express from "express";
import {
  applyCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route
router.post("/apply", applyCoupon);

// Admin routes
router.post("/", protect, authorizeRoles("admin"), createCoupon);
router.get("/", protect, authorizeRoles("admin"), getAllCoupons);
router.put("/:id", protect, authorizeRoles("admin"), updateCoupon);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCoupon);

export default router;
