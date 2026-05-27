// ============================================================
// routes/trips.js — Trip CRUD Routes
// ALL routes here require authentication (protect middleware)
// Users can ONLY access their OWN trips (strict data isolation)
//
// GET    /api/trips          — Get all trips for logged-in user
// POST   /api/trips          — Create a new trip
// GET    /api/trips/:id      — Get a specific trip
// PUT    /api/trips/:id      — Update a trip
// DELETE /api/trips/:id      — Delete a trip
// PATCH  /api/trips/:id/day  — Regenerate a specific day
// PATCH  /api/trips/:id/activity — Add/remove an activity
// PATCH  /api/trips/:id/favorite — Toggle favorite
// ============================================================

const express = require("express");
const { body, validationResult } = require("express-validator");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes below require login
router.use(protect);

// ── GET /api/trips ──────────────────────────────────────────
// Get all trips belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // newest first
      .select("-itinerary -budget -hotels"); // exclude heavy fields for list view

    res.json({ trips });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ error: "Failed to fetch trips." });
  }
});

// ── POST /api/trips ─────────────────────────────────────────
// Create a new trip (initial save before AI generation)
router.post(
  "/",
  [
    body("destination").trim().notEmpty().withMessage("Destination is required"),
    body("numberOfDays").isInt({ min: 1, max: 30 }).withMessage("Days must be between 1-30"),
    body("budgetType").isIn(["low", "medium", "high"]).withMessage("Invalid budget type"),
    body("interests").isArray({ min: 1 }).withMessage("At least one interest required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { destination, numberOfDays, budgetType, interests, travelMonth, groupSize, title } =
      req.body;

    try {
      const trip = await Trip.create({
        userId: req.user._id, // CRITICAL: always tie trip to logged-in user
        destination,
        numberOfDays,
        budgetType,
        interests,
        travelMonth: travelMonth || "",
        groupSize: groupSize || 1,
        title: title || `${destination} Trip`,
        status: "draft",
      });

      res.status(201).json({ trip });
    } catch (error) {
      console.error("Create trip error:", error);
      res.status(500).json({ error: "Failed to create trip." });
    }
  }
);

// ── GET /api/trips/:id ──────────────────────────────────────
// Get a single trip (full details)
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // SECURITY: ensure this trip belongs to the logged-in user
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json({ trip });
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({ error: "Failed to fetch trip." });
  }
});

// ── PUT /api/trips/:id ──────────────────────────────────────
// Update trip (save AI-generated content or user edits)
router.put("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Only allow updating specific fields
    const allowedUpdates = [
      "itinerary", "budget", "hotels", "status", "title", "notes", "isFavorite",
      "travelMonth", "groupSize",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    await trip.save();
    res.json({ trip });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({ error: "Failed to update trip." });
  }
});

// ── DELETE /api/trips/:id ───────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted successfully." });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ error: "Failed to delete trip." });
  }
});

// ── PATCH /api/trips/:id/activity ──────────────────────────
// Add or remove a single activity from a day
router.patch("/:id/activity", async (req, res) => {
  const { action, dayNumber, activity, activityId } = req.body;
  // action = "add" | "remove"

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    const day = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!day) return res.status(404).json({ error: "Day not found in itinerary." });

    if (action === "add") {
      day.activities.push({
        id: `act_${dayNumber}_${Date.now()}`,
        ...activity,
      });
    } else if (action === "remove") {
      day.activities = day.activities.filter((a) => a.id !== activityId);
    }

    trip.status = "modified";
    trip.markModified("itinerary"); // Tell Mongoose nested array changed
    await trip.save();

    res.json({ trip });
  } catch (error) {
    console.error("Activity edit error:", error);
    res.status(500).json({ error: "Failed to update activity." });
  }
});

// ── PATCH /api/trips/:id/favorite ──────────────────────────
router.patch("/:id/favorite", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied." });
    }

    trip.isFavorite = !trip.isFavorite;
    await trip.save();
    res.json({ isFavorite: trip.isFavorite });
  } catch (error) {
    res.status(500).json({ error: "Failed to update favorite." });
  }
});

module.exports = router;