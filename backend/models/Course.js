const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["video", "article", "quiz", "file"], default: "video" },
    duration: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    content: { type: String, trim: true },
    materials: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          type: { type: String, required: true, enum: ["video", "pdf", "ppt", "link"], default: "link" },
          url: { type: String, required: true, trim: true },
          note: { type: String, trim: true },
        },
      ],
      default: [],
    },
  },
  { _id: true }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    lectures: { type: [lectureSchema], default: [] },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    instructorAvatar: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: ["Frontend", "JavaScript", "Full Stack", "Backend", "Database", "DevOps", "DSA"],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
    },
    students: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    thumbnail: {
      type: String,
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);