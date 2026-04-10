const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const TARGET_EMAIL = "admin@eduplatform.com";
const NEW_PASSWORD = "Anish1234";
const ADMIN_NAME = "Admin User";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hash = await bcrypt.hash(NEW_PASSWORD, 12);
    const result = await Admin.updateOne(
      { email: TARGET_EMAIL },
      {
        $set: {
          name: ADMIN_NAME,
          email: TARGET_EMAIL,
          password: hash,
          role: "superadmin",
        },
      },
      { upsert: true }
    );

    console.log(`matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);

    if (result.matchedCount === 0) {
      console.log("No admin found with that email, so a new admin was created.");
    } else {
      console.log("Admin password updated successfully.");
    }

    console.log(`Admin login ready: ${TARGET_EMAIL} / ${NEW_PASSWORD}`);
  } catch (error) {
    console.error("Failed to update admin password:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
