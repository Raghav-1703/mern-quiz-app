import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email address already exists." });
    }

    // Role assignment: Allow any user to choose 'user' or 'admin'. Default is 'user'.
    let role = "user";
    if (req.body.role === "admin" || adminSecret) {
      role = "admin";
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCodes: user.enrolledCodes,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message || "Failed to register user." });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Logged in successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Failed to log in." });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully." });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/become-admin
export const becomeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.role = "admin";
    await user.save();

    const token = generateToken(user);
    res.json({
      message: "You are now an administrator.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCodes: user.enrolledCodes,
      },
    });
  } catch (err) {
    console.error("Become admin error:", err);
    res.status(500).json({ message: "Failed to upgrade to administrator." });
  }
};
