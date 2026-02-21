import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [String],
    usedBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        usedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expiresAt > now &&
    (!this.maxUses || this.currentUses < this.maxUses)
  );
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (!this.isValid() || orderAmount < this.minOrderAmount) {
    return 0;
  }

  if (this.discountType === "percentage") {
    return (orderAmount * this.discountValue) / 100;
  }
  return Math.min(this.discountValue, orderAmount);
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
