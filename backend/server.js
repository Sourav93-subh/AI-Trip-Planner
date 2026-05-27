// ============================================================
// server.js — The entry point of the entire backend
// This file: sets up Express, connects to MongoDB, registers routes
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config(); // Loads .env file into process.env

const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const aiRoutes = require("./routes/ai");

const app = express();

// ── Middleware ──────────────────────────────────────────────
// CORS: allows our frontend (localhost:3000) to talk to this backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Parse JSON bodies (so we can read req.body)
app.use(express.json());

// HTTP request logger (shows requests in terminal during dev)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting: max 100 requests per 15 minutes per IP
// Protects against abuse/brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);   // /api/auth/register, /api/auth/login
app.use("/api/trips", tripRoutes);  // /api/trips/ (CRUD for trips)
app.use("/api/ai", aiRoutes);       // /api/ai/generate, /api/ai/hotels

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI Trip Planner API is running 🚀" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Connect to MongoDB then start server ────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });