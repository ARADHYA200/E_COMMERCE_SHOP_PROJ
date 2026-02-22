import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const message = `
      <h1>Account Verification</h1>
      <p>Thank you for registering! Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" clicktracking="off">${verifyUrl}</a>
    `;

    try {
      await sendEmail(user.email, "Verify Your E-Commerce Shop Account", message);
    } catch (error) {
      console.error("Email sending failed:", error);
      // We still return success but maybe user will have to retry verification
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: "Registration successful. Please check your email to verify your account."
    });
  } catch (error) {
    console.error("FULL REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
};