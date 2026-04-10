const router         = require("express").Router();
const auth           = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const requireAdmin   = requireRoles("admin", "superadmin");
const ContactMessage = require("../models/ContactMessage");

// POST /api/messages/contact
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const contactMessage = await ContactMessage.create({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({ success: true, message: contactMessage });
  } catch (err) {
    console.error("Create contact message error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/messages/admin
router.get("/admin", auth, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("List contact messages error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;