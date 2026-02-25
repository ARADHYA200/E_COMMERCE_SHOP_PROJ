import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


/* =========================================
   UPDATE PROFILE (WITH IMAGE SUPPORT)
========================================= */
router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      // If new image uploaded
      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        createdAt: updatedUser.createdAt,
      });

    } catch (error) {
      console.error("Profile Update Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);


/* =========================================
   CHANGE PASSWORD
========================================= */
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;   // Will hash automatically via pre-save
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Password Change Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================================
   DELETE OWN ACCOUNT
========================================= */
router.delete("/profile", protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET CURRENT USER PROFILE
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;