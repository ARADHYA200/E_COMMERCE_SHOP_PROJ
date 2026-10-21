
import mongoose from "mongoose";

const priceAlertNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    eventType: {
      type: String,
      enum: ["price_drop", "back_in_stock"],
      required: true,
    },
    eventKey: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      default: "there",
    },
    productName: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: null,
    },
    newPrice: {
      type: Number,
      default: null,
    },
    initialSentAt: {
      type: Date,
      default: Date.now,
    },
    reminderAt: {
      type: Date,
      required: true,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

priceAlertNotificationSchema.index(
  { user: 1, product: 1, eventType: 1, eventKey: 1 },
  { unique: true }
);

const PriceAlertNotification = mongoose.model(
  "PriceAlertNotification",
  priceAlertNotificationSchema
);

export default PriceAlertNotification;
