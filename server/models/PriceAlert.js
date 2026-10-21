
import mongoose from "mongoose";

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Product ki price kam hone par email
    priceDropEnabled: {
      type: Boolean,
      default: true,
    },

    // Optional target price; null means any price drop
    targetPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // Product dobara stock mein aane par email
    backInStockEnabled: {
      type: Boolean,
      default: true,
    },

    // Last successfully notified price
    lastNotifiedPrice: {
      type: Number,
      default: null,
    },

    // Last restock event notified
    lastRestockNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Har user ke ek product ke liye sirf ek preference document
priceAlertSchema.index(
  { user: 1, product: 1 },
  { unique: true }
);

const PriceAlert = mongoose.model("PriceAlert", priceAlertSchema);

export default PriceAlert;
