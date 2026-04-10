function requireRoles(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    const role = req.user?.role || req.auth?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied." });
    }

    next();
  };
}

module.exports = { requireRoles };