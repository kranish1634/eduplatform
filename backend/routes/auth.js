const router   = require("express").Router();
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const auth     = require("../middleware/authMiddleware");
const safeUser = require("../utils/safeUser");
const { signUserToken } = require("../utils/jwt");

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ message: "An account with this email already exists." });

    const hashed   = await bcrypt.hash(password, 12);
    const initials = name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const user  = await User.create({ name: name.trim(), email, password: hashed, initials });
    const token = signUserToken(user._id);

    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = signUserToken(user._id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/auth/me  — restore session from JWT
// ─────────────────────────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(safeUser(user));
  } catch (err) {
    console.error("Me error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/auth/profile  — update name / email / bio / location / website
// ─────────────────────────────────────────────────────────────────
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, bio, location, website } = req.body;
    const fields = {};

    if (name) {
      fields.name     = name.trim();
      fields.initials = name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email)    fields.email    = email.toLowerCase().trim();
    if (bio      !== undefined) fields.bio      = bio;
    if (location !== undefined) fields.location = location;
    if (website  !== undefined) fields.website  = website;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fields },
      { new: true, runValidators: true }
    );

    res.json(safeUser(user));
  } catch (err) {
    // Duplicate key — another account already uses this email
    if (err.code === 11000) {
      return res.status(400).json({ message: "This email address is already in use by another account." });
    }
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;