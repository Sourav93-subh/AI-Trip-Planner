// ============================================================
// models/Trip.js — MongoDB schema for a Trip
// Each trip belongs to one user (via userId reference)
// ============================================================

const mongoose = require("mongoose");

// Sub-schema for a single activity in a day
const activitySchema = new mongoose.Schema({
  id: { type: String, required: true },   // unique id like "act_1_1"
  time: { type: String, default: "" },     // e.g. "9:00 AM"
  title: { type: String, required: true }, // e.g. "Visit Senso-ji Temple"
  description: { type: String, default: "" },
  category: {
    type: String,
    enum: ["food", "culture", "adventure", "shopping", "transport", "accommodation", "other"],
    default: "other",
  },
  estimatedCost: { type: Number, default: 0 },
});

// Sub-schema for a single day in the itinerary
const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true }, // 1, 2, 3...
  title: { type: String, default: "" },         // e.g. "Day 1 – Temples & Culture"
  activities: [activitySchema],
});

// Sub-schema for budget breakdown
const budgetSchema = new mongoose.Schema({
  flights: { type: Number, default: 0 },
  accommodation: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  activities: { type: Number, default: 0 },
  transport: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  notes: { type: String, default: "" },
});

// Sub-schema for hotel suggestion
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["budget", "mid-range", "luxury"], default: "mid-range" },
  pricePerNight: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 4 },
  highlights: [String],     // e.g. ["Free WiFi", "City Center", "Breakfast included"]
  bookingTip: { type: String, default: "" },
});

// Main Trip schema
const tripSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User collection
      ref: "User",
      required: true,
      index: true, // Index for faster queries by userId
    },

    // ── User inputs ────────────────────────────────────────
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    numberOfDays: {
      type: Number,
      required: [true, "Number of days is required"],
      min: [1, "Trip must be at least 1 day"],
      max: [30, "Trip cannot exceed 30 days"],
    },
    budgetType: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },
    interests: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one interest is required"],
    },
    travelMonth: {
      type: String,
      default: "",
    },
    groupSize: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ── AI Generated content ───────────────────────────────
    itinerary: [daySchema],
    budget: budgetSchema,
    hotels: [hotelSchema],

    // ── Meta ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "generated", "modified"],
      default: "draft",
    },
    title: {
      type: String,
      default: "",
    },
    // User's custom creative feature: trip notes / travel journal
    notes: {
      type: String,
      default: "",
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);