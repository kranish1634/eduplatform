const mongoose = require("mongoose");

// ── Sub-schema: one enrolled course + its progress ────────────────
const courseProgressSchema = new mongoose.Schema(
  {
    courseId:   { type: Number, required: true },
    progress:   { type: Number, default: 0, min: 0, max: 100 },
    enrolledAt: { type: Date,   default: Date.now },
  },
  { _id: false }
);

const recentActivitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["viewed", "enrolled", "progress", "completed"], trim: true },
    courseId: { type: Number },
    title: { type: String, required: true, trim: true },
    detail: { type: String, default: "", trim: true },
    progress: { type: Number, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Main User schema ──────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // Auth
    name:     { type: String, required: [true, "Name is required"],     trim: true },
    email:    { type: String, required: [true, "Email is required"],    unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 8 },
    initials: { type: String, trim: true },

    // Profile
    bio:      { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    website:  { type: String, default: "", trim: true },
    joined:   {
      type: String,
      default: () =>
        new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    },

    // Courses — each entry has courseId + progress + enrolledAt
    courses: { type: [courseProgressSchema], default: [] },

    // Recent dashboard activity
    recentActivity: { type: [recentActivitySchema], default: [] },
  },
  { timestamps: true }
);

// Virtual: flat array of courseIds — keeps frontend compatible
userSchema.virtual("enrolledCourses").get(function () {
  return this.courses.map((c) => c.courseId);
});

userSchema.set("toJSON",   { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);