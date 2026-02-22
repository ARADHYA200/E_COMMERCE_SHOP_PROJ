import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const verifyToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

    // await sendEmail(
    //   user.email,
    //   "Email Verification",
    //   `<h2>Verify your email</h2>
    //   <a href="${verifyUrl}">Click to Verify</a>`
    // );
console.log("Verification URL:", verifyUrl);

    res.status(201).json({
      message: "Registration successful. Please verify your email."
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
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
      if (!user.isVerified) {
        return res.status(401).json({ message: "Please verify your email before logging in" });
      }

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
    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Invalid link" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};