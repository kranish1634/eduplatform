require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/admin",   require("./routes/admin"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/users",   require("./routes/users"));
app.use("/api/messages", require("./routes/messages"));

// ── Health check ─────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "✓ EduPlatform API running", time: new Date().toISOString() })
);

// ── 404 fallback ─────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` })
);

// ── Connect MongoDB → start server ───────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✓ MongoDB connected —", process.env.MONGO_URI);
    app.listen(process.env.PORT, () => {
      console.log(`✓ Server running  — http://localhost:${process.env.PORT}`);
      console.log("");
      console.log("  API Routes:");
      console.log("  POST  /api/auth/register");
      console.log("  POST  /api/auth/login");
      console.log("  GET   /api/auth/me");
      console.log("  PUT   /api/auth/profile");
      console.log("  GET   /api/courses");
      console.log("  GET   /api/courses/:id");
      console.log("  POST  /api/users/enroll/:courseId");
      console.log("  GET   /api/users/me/courses");
      console.log("  PUT   /api/users/progress/:courseId");
      console.log("  POST  /api/messages/contact");
      console.log("  GET   /api/messages/admin");
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection failed:", err.message);
    process.exit(1);
  });