/**
 * Strips password and internal Mongoose fields from a User document.
 * Shared by auth.js, admin.js and users.js routes.
 */
module.exports = function safeUser(user) {
  const obj = user.toObject();
  return {
    id:              obj._id,
    name:            obj.name,
    email:           obj.email,
    initials:        obj.initials,
    bio:             obj.bio,
    location:        obj.location,
    website:         obj.website,
    joined:          obj.joined,
    courses:         obj.courses,         // [{courseId, progress, enrolledAt}]
    enrolledCourses: obj.enrolledCourses, // virtual — flat [1,2,3]
    recentActivity:  obj.recentActivity,
    createdAt:       obj.createdAt,
  };
};
