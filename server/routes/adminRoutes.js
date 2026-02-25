import express from "express";
import { getDashboardStats, getUsers } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();


// ---------------- Dashboard Stats ----------------
router.get("/stats", protect, admin, getDashboardStats);


// ---------------- Get All Orders ----------------
router.get("/orders", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


// ---------------- Get All Users ----------------
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


// ---------------- DELETE USER ----------------
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});


// ---------------- MAKE USER ADMIN ----------------
router.put("/users/:id/make-admin", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "admin";
    await user.save();

    res.json({ message: "User promoted to admin" });

  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" });
  }
});


// ---------------- REMOVE ADMIN (OPTIONAL) ----------------
router.put("/users/:id/remove-admin", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "user";
    await user.save();

    res.json({ message: "Admin removed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" });
  }
});

export default router;