import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // IMPORTANT:
    // Password ko manually hash nahi karna
    // User model ka pre("save") hook hash karega
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const message = `
      <h1>Account Verification</h1>
      <p>Thank you for registering!</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" clicktracking="off">${verifyUrl}</a>
    `;

    try {
      await sendEmail(
        user.email,
        "Verify Your E-Commerce Shop Account",
        message
      );
    } catch (error) {
      console.error("Email sending failed:", error);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("FULL REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {

      if (!user.isVerified) {
        return res.status(401).json({
          message:
            "Please verify your email before login.",
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({
      message: "Invalid credentials",
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    res.status(500).json({
      message: "Server error during verification.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;

    await user.save();

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `
      <h2>Password Reset</h2>

      <p>
        Click below link to reset password
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>
      `
    );

    res.json({
      message:
        "Password reset email sent",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {

  try {

    const user = await User.findOne({
      resetPasswordToken:
        req.params.token,
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid reset token",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        message: "Password required",
      });
    }

    if (req.body.password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;

    await user.save();

    res.json({
      message:
        "Password updated successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};