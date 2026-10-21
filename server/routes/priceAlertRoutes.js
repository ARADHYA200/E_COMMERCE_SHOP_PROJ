
import express from "express";
import {
  getMyPriceAlerts,
  updatePriceAlert,
} from "../controllers/priceAlertController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyPriceAlerts);
router.put("/:productId", protect, updatePriceAlert);

export default router;
