const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Name is required"],     trim: true },
    email:    { type: String, required: [true, "Email is required"],    unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 8 },
    role:     { type: String, default: "admin", enum: ["admin", "superadmin"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
