const router   = require("express").Router();
const auth     = require("../middleware/authMiddleware");
const User     = require("../models/User");
const Course   = require("../models/Course");
const safeUser = require("../utils/safeUser");

function addRecentActivity(user, activity) {
  const nextEntry = {
    type:      activity.type,
    courseId:  activity.courseId,
    title:     activity.title,
    detail:    activity.detail || "",
    progress:  activity.progress,
    createdAt: new Date(),
  };

  const fingerprint = `${nextEntry.type}|${nextEntry.courseId ?? ""}|${nextEntry.title}|${nextEntry.detail}|${nextEntry.progress ?? ""}`;
  const filtered = (user.recentActivity || []).filter((entry) => {
    const entryFingerprint = `${entry.type}|${entry.courseId ?? ""}|${entry.title}|${entry.detail}|${entry.progress ?? ""}`;
    return entryFingerprint !== fingerprint;
  });

  user.recentActivity = [nextEntry, ...filtered].slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────
// POST /api/users/enroll/:courseId
// Enroll the logged-in user in a course (stored inside users document)
// ─────────────────────────────────────────────────────────────────
router.post("/enroll/:courseId", auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId))
      return res.status(400).json({ message: "Invalid course ID." });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const course = await Course.findOne({ id: courseId });
    const courseTitle = course?.title || `Course ${courseId}`;

    // Already enrolled? — return current state without duplicate
    const already = user.courses.find((c) => c.courseId === courseId);
    if (already) {
      addRecentActivity(user, {
        type:     already.progress >= 100 ? "completed" : "enrolled",
        courseId,
        title:    courseTitle,
        detail:   already.progress >= 100 ? "Course already completed." : "Opened an enrolled course.",
        progress: already.progress,
      });
      await user.save();
      return res.json({ success: true, alreadyEnrolled: true, user: safeUser(user) });
    }

    // Push new course entry into the user's courses array
    user.courses.push({ courseId, progress: 0, enrolledAt: new Date() });
    addRecentActivity(user, {
      type:     "enrolled",
      courseId,
      title:    courseTitle,
      detail:   "Started enrollment.",
      progress: 0,
    });
    await user.save();

    res.json({ success: true, alreadyEnrolled: false, user: safeUser(user) });
  } catch (err) {
    console.error("Enroll error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/users/me/courses
// Get all course entries (with progress) for the logged-in user
// ─────────────────────────────────────────────────────────────────
router.get("/me/courses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user.courses); // [{courseId, progress, enrolledAt}]
  } catch (err) {
    console.error("Get courses error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/users/progress/:courseId
// Update progress % for a specific enrolled course
// ─────────────────────────────────────────────────────────────────
router.put("/progress/:courseId", auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const { progress } = req.body;

    if (isNaN(courseId))
      return res.status(400).json({ message: "Invalid course ID." });
    if (progress === undefined || progress < 0 || progress > 100)
      return res.status(400).json({ message: "Progress must be 0–100." });

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found." });

    const enrollment = user.courses.find((c) => c.courseId === courseId);
    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found." });

    enrollment.progress = progress;

    const course = await Course.findOne({ id: courseId });
    const courseTitle = course?.title || `Course ${courseId}`;
    addRecentActivity(user, {
      type:   progress >= 100 ? "completed" : "progress",
      courseId,
      title:  courseTitle,
      detail: progress >= 100 ? "Completed the course." : `Progress updated to ${progress}%.`,
      progress,
    });

    await user.save();

    res.json(safeUser(user));
  } catch (err) {
    console.error("Progress update error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/users/activity
// Record a recent activity item for the logged-in user
// ─────────────────────────────────────────────────────────────────
router.post("/activity", auth, async (req, res) => {
  try {
    const { type, courseId, title, detail, progress } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: "Activity type and title are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    addRecentActivity(user, { type, courseId, title, detail, progress });

    await user.save();

    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    console.error("Activity record error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;