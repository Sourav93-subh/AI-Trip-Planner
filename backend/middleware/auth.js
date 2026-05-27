// ============================================================
// middleware/auth.js — JWT Authentication Middleware
//
// What is middleware? It's a function that runs BETWEEN the
// HTTP request arriving and your route handler running.
//
// This middleware checks: "Is this user logged in?"
// If yes → attaches user info to req.user and continues
// If no  → returns 401 Unauthorized immediately
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    // Format: "Authorization: Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Not authorized. Please log in.",
      });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // 2. Verify the token hasn't been tampered with or expired
    // jwt.verify throws an error if token is invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user from the token's payload
    // decoded.id = the userId we put in the token when they logged in
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "User no longer exists.",
      });
    }

    // 4. Attach user to request so route handlers can use it
    // e.g. in a route: const userId = req.user._id
    req.user = user;

    next(); // Move to the actual route handler
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed." });
  }
};

module.exports = { protect };