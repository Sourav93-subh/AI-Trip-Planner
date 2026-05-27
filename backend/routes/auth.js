// ============================================================
// routes/auth.js — Authentication Routes
// POST /api/auth/register  — Create new account
// POST /api/auth/login     — Log in
// GET  /api/auth/me        — Get current user (requires token)
// ============================================================

const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ── Helper: generate JWT token ──────────────────────────────
// A JWT token is like a "signed ticket" — it proves who you are
// without needing to check the database on every request
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload: what we store in the token
    process.env.JWT_SECRET,   // secret key used to sign it
    { expiresIn: "7d" }       // token expires after 7 days
  );
};

// ── POST /api/auth/register ─────────────────────────────────
router.post(
  "/register",
  // Validation rules (checked before handler runs)
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    // Check if validation failed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg, // Return first error message
      });
    }

    const { name, email, password } = req.body;

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered." });
      }

      // Create user (password is hashed automatically via pre-save hook)
      const user = await User.create({ name, email, password });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: "Account created successfully!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  }
);

// ── POST /api/auth/login ────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      // Find user and include password (it's hidden by default with select: false)
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Compare entered password with hashed password in DB
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = generateToken(user._id);

      res.json({
        message: "Login successful!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed. Please try again." });
    }
  }
);

// ── GET /api/auth/me ────────────────────────────────────────
// Protected route: requires valid JWT token
router.get("/me", protect, async (req, res) => {
  // req.user was attached by the protect middleware
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;