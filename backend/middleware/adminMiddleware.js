const { requireRoles } = require("./roleMiddleware");

module.exports = requireRoles("admin", "superadmin");
