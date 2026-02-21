import Coupon from "../models/Coupon.js";

// Apply coupon code
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: "Coupon is expired or inactive" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of $${coupon.minOrderAmount} required`,
      });
    }

    const discount = coupon.calculateDiscount(orderAmount);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error applying coupon", error: error.message });
  }
};

// Create coupon (admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      minOrderAmount,
      expiresAt,
      applicableProducts,
    } = req.body;

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxUses,
      minOrderAmount,
      expiresAt,
      applicableProducts,
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating coupon", error: error.message });
  }
};

// Get all coupons (admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().select("-usedBy");
    res.json(coupons);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching coupons", error: error.message });
  }
};

// Update coupon (admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating coupon", error: error.message });
  }
};

// Delete coupon (admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting coupon", error: error.message });
  }
};
