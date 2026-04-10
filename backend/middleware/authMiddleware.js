const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = {
      id: decoded.id,
      role: decoded.role || (decoded.isAdmin ? "admin" : "user"),
      isAdmin: Boolean(decoded.isAdmin),
    };
    req.user = req.auth; // backwards compatibility for existing routes
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};