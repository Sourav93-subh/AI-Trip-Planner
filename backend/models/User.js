// ============================================================
// models/User.js — MongoDB schema for a User
// Mongoose "schema" = the shape/rules for data stored in MongoDB
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,           // removes leading/trailing spaces
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,         // no two users can have the same email
      lowercase: true,      // always store as lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,        // IMPORTANT: password is NEVER returned in queries by default
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// ── Pre-save hook: hash password before storing ─────────────
// This runs automatically before every .save() call
userSchema.pre("save", async function (next) {
  // Only hash if password was changed (avoid re-hashing on other updates)
  if (!this.isModified("password")) return next();

  // bcrypt.hash: turns "mypassword" → "$2a$10$xK..." (unreadable hash)
  // 12 = "salt rounds" (higher = more secure but slower)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password at login ──────────────
// Called like: user.comparePassword("enteredPassword")
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);