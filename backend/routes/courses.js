const router       = require("express").Router();
const Course       = require("../models/Course");
const auth         = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const requireAdmin = requireRoles("admin", "superadmin");

function normalizeCoursePayload(body) {
  let sections = [];

  if (Array.isArray(body.sections)) {
    sections = body.sections;
  } else if (typeof body.sections === "string" && body.sections.trim()) {
    try {
      sections = JSON.parse(body.sections);
    } catch (error) {
      sections = [];
    }
  }

  return {
    id:               Number.parseInt(body.id, 10),
    title:            body.title?.trim(),
    description:      body.description?.trim() || "",
    instructor:       body.instructor?.trim(),
    instructorAvatar: body.instructorAvatar?.trim() || "",
    category:         body.category,
    difficulty:       body.difficulty,
    duration:         body.duration?.trim(),
    rating:           body.rating?.trim() || "",
    students:         body.students?.trim() || "",
    price:            Number(body.price ?? 0),
    thumbnail:        body.thumbnail?.trim() || "",
    sections,
  };
}

// GET /api/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ id: 1 });
    res.json(courses);
  } catch (err) {
    console.error("Get courses error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/courses/:id
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findOne({ id: parseInt(req.params.id) });
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.json(course);
  } catch (err) {
    console.error("Get course error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /api/courses
router.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body);

    if (!payload.title || !payload.instructor || !payload.category || !payload.difficulty || !payload.duration) {
      return res.status(400).json({ message: "Title, instructor, category, difficulty, and duration are required." });
    }

    if (!Number.isInteger(payload.id) || payload.id <= 0) {
      const lastCourse = await Course.findOne().sort({ id: -1 });
      payload.id = lastCourse ? lastCourse.id + 1 : 1;
    }

    const existing = await Course.findOne({ id: payload.id });
    if (existing) {
      return res.status(409).json({ message: "A course with this ID already exists." });
    }

    const course = await Course.create(payload);
    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// PUT /api/courses/:id
router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const updates = normalizeCoursePayload(req.body);
    delete updates.id;

    const course = await Course.findOneAndUpdate(
      { id: courseId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json(course);
  } catch (err) {
    console.error("Update course error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE /api/courses/:id
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const course = await Course.findOneAndDelete({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json({ success: true, message: "Course deleted successfully." });
  } catch (err) {
    console.error("Delete course error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;