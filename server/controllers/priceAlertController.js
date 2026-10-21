
import mongoose from "mongoose";
import PriceAlert from "../models/PriceAlert.js";
import Product from "../models/Product.js";
import Wishlist from "../models/Wishlist.js";

// GET: Logged-in user's alert settings for products in their wishlist
export const getMyPriceAlerts = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist || wishlist.products.length === 0) {
      return res.status(200).json([]);
    }

    const alerts = await PriceAlert.find({
      user: req.user._id,
      product: { $in: wishlist.products },
    }).populate("product", "name price image stock");

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Get price alerts error:", error);
    res.status(500).json({ message: "Failed to fetch price alerts" });
  }
};

// PUT: Create or update alert preferences for a wishlist product
export const updatePriceAlert = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      priceDropEnabled,
      targetPrice,
      backInStockEnabled,
    } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    const isInWishlist = wishlist?.products.some(
      (id) => id.toString() === productId
    );

    if (!isInWishlist) {
      return res.status(403).json({
        message: "You can set alerts only for products in your wishlist",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate optional target price
    let normalizedTargetPrice;

    if (targetPrice === null || targetPrice === "" || targetPrice === undefined) {
      normalizedTargetPrice = null;
    } else {
      normalizedTargetPrice = Number(targetPrice);

      if (
        !Number.isFinite(normalizedTargetPrice) ||
        normalizedTargetPrice < 0
      ) {
        return res.status(400).json({
          message: "Target price must be a valid non-negative number",
        });
      }
    }

    // Only update fields explicitly supplied by the client.
    const updates = {};

    if (typeof priceDropEnabled === "boolean") {
      updates.priceDropEnabled = priceDropEnabled;
    }

    if (targetPrice !== undefined) {
      updates.targetPrice = normalizedTargetPrice;
    }

    if (typeof backInStockEnabled === "boolean") {
      updates.backInStockEnabled = backInStockEnabled;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid alert settings were provided",
      });
    }

    const alert = await PriceAlert.findOneAndUpdate(
      { user: req.user._id, product: productId },
      {
        $set: updates,
        $setOnInsert: {
          user: req.user._id,
          product: productId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate("product", "name price image stock");

    return res.status(200).json({
      message: "Alert preferences saved successfully",
      alert,
    });
  } catch (error) {
    console.error("Update price alert error:", error);
    res.status(500).json({ message: "Failed to update price alert" });
  }
};
