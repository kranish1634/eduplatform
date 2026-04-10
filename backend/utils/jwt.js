const jwt = require("jsonwebtoken");

function signUserToken(userId) {
  return jwt.sign(
    { id: userId, role: "user", isAdmin: false },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function signAdminToken(adminId, role = "admin") {
  return jwt.sign(
    { id: adminId, role, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { signUserToken, signAdminToken };