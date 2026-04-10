const router       = require("express").Router();
const bcrypt       = require("bcryptjs");
const Admin        = require("../models/Admin");
const User         = require("../models/User");
const auth         = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const requireAdmin = requireRoles("admin", "superadmin");
const safeUser     = require("../utils/safeUser");
const { signAdminToken } = require("../utils/jwt");

// ── Safe admin payload sent to frontend (no password field) ────────
function safeAdmin(admin) {
  const obj = admin.toObject();
  return {
    id:    obj._id,
    name:  obj.name,
    email: obj.email,
    role:  obj.role,
  };
}

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return res.status(401).json({ message: "Invalid credentials." });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = signAdminToken(admin._id, admin.role);
    res.json({ token, admin: safeAdmin(admin) });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/me  — restore session from JWT
// ─────────────────────────────────────────────────────────────────
router.get("/me", auth, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    res.json(safeAdmin(admin));
  } catch (err) {
    console.error("Admin me error:", err.message);
    res.status(401).json({ message: "Unauthorized." });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/users  — list users for the admin dashboard
// ─────────────────────────────────────────────────────────────────
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(safeUser));
  } catch (err) {
    console.error("Admin users error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
