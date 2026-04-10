import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useCourses } from "../context/CourseContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { authFetch } from "../utils/authFetch";
import { API_BASE_URL } from "../config/api";

const COURSE_OPTIONS = {
  category: ["Frontend", "JavaScript", "Full Stack", "Backend", "Database", "DevOps", "DSA"],
  difficulty: ["Beginner", "Intermediate", "Advanced"],
};

const DEFAULT_CURRICULUM = [
  {
    title: "Introduction & Setup",
    lectures: [
      {
        title: "Course Overview",
        type: "video",
        duration: "12 min",
        content: "Course outline and goals.",
        materials: [
          { title: "Overview Video", type: "video", url: "https://www.youtube.com/watch?v=8mAITcNt710", note: "Watch before starting." },
          { title: "Course Notes PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Downloadable notes." },
        ],
      },
      {
        title: "Environment Setup",
        type: "article",
        duration: "8 min",
        content: "Install the tools you need to begin.",
        materials: [
          { title: "Setup Slides PPT", type: "ppt", url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx", note: "Use while setting up." },
          { title: "Setup Checklist PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Checklist for installation." },
        ],
      },
    ],
  },
  {
    title: "Hands-on Projects",
    lectures: [
      {
        title: "Build Along Project",
        type: "video",
        duration: "22 min",
        content: "Follow along with a guided build of a real project.",
        materials: [
          { title: "Project Walkthrough Video", type: "video", url: "https://www.youtube.com/watch?v=4MZN7b4Hj10", note: "Follow along step by step." },
          { title: "Project Handout PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Keep this as a reference." },
        ],
      },
      {
        title: "Project Notes",
        type: "file",
        duration: "4 min",
        content: "Reference material and handouts.",
        materials: [
          { title: "Download Slides PPT", type: "ppt", url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx", note: "Slides for revision." },
          { title: "Project Notes PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Printable notes." },
        ],
      },
    ],
  },
];

function getNextCourseId(courses) {
  if (!courses.length) return 1;
  return Math.max(...courses.map((course) => Number(course.id) || 0)) + 1;
}

function createEmptyCourse(nextId) {
  return {
    id: String(nextId),
    title: "",
    description: "",
    instructor: "",
    instructorAvatar: "",
    category: "Frontend",
    difficulty: "Beginner",
    duration: "",
    rating: "",
    students: "",
    price: "0",
    thumbnail: "",
    sectionsJson: JSON.stringify(DEFAULT_CURRICULUM, null, 2),
  };
}

function stringifySections(sections) {
  const data = Array.isArray(sections) && sections.length > 0 ? sections : DEFAULT_CURRICULUM;
  return JSON.stringify(data, null, 2);
}

function parseSectionsJson(value) {
  if (!value || !value.trim()) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Invalid JSON in Curriculum Sections. Please check your syntax (missing commas, brackets, or quotes).");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Curriculum Sections must be a JSON array — e.g. [{\"title\":\"Section 1\", \"lectures\":[...]}].");
  }

  return parsed;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, token, logout } = useAdmin();
  const { courses, refreshCourses } = useCourses();
  const { settings: siteSettings, updateSettings } = useSiteSettings();

  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [settings, setSettings] = useState(siteSettings);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseMode, setCourseMode] = useState("create");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(() => createEmptyCourse(1));
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const authToken = token || sessionStorage.getItem("adminToken");

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
    if (activeTab === "messages") {
      fetchMessages();
    }
  }, [activeTab]);

  useEffect(() => {
    setSettings(siteSettings);
  }, [siteSettings]);

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openCreateCourseModal = () => {
    setCourseMode("create");
    setEditingCourseId(null);
    setCourseForm(createEmptyCourse(getNextCourseId(courses)));
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course) => {
    setCourseMode("edit");
    setEditingCourseId(course.id);
    setCourseForm({
      id: String(course.id ?? ""),
      title: course.title ?? "",
      description: course.description ?? "",
      instructor: course.instructor ?? "",
      instructorAvatar: course.instructorAvatar ?? "",
      category: course.category ?? "Frontend",
      difficulty: course.difficulty ?? "Beginner",
      duration: course.duration ?? "",
      rating: course.rating ?? "",
      students: course.students ?? "",
      price: String(course.price ?? 0),
      thumbnail: course.thumbnail ?? "",
      sectionsJson: stringifySections(course.sections),
    });
    setIsCourseModalOpen(true);
  };

  const closeCourseModal = () => {
    setIsCourseModalOpen(false);
    setEditingCourseId(null);
  };

  const handleCourseChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((current) => ({ ...current, [name]: value }));
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const { response, data } = await authFetch(`${API_BASE_URL}/admin/users`, {
        token: authToken,
        onUnauthorized: () => {
          logout();
          navigate("/admin/login", { replace: true });
        },
      });

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load users.");
      }

      setUsers(data);
    } catch (error) {
      setUsersError(error.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    setMessagesError("");

    try {
      const { response, data } = await authFetch(`${API_BASE_URL}/messages/admin`, {
        token: authToken,
        onUnauthorized: () => {
          logout();
          navigate("/admin/login", { replace: true });
        },
      });

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load messages.");
      }

      setMessages(data);
    } catch (error) {
      setMessagesError(error.message || "Unable to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSaveCourse = async (event) => {
    event.preventDefault();
    setSavingCourse(true);

    try {
      const method = courseMode === "edit" ? "PUT" : "POST";
      const endpoint = courseMode === "edit" ? `${API_BASE_URL}/courses/${editingCourseId}` : `${API_BASE_URL}/courses`;
      const payload = {
        ...courseForm,
        id: courseForm.id ? Number(courseForm.id) : undefined,
        price: Number(courseForm.price || 0),
        sections: parseSectionsJson(courseForm.sectionsJson),
      };

      const { response, data } = await authFetch(endpoint, {
        method,
        token: authToken,
        onUnauthorized: () => {
          logout();
          navigate("/admin/login", { replace: true });
        },
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(data?.message || "Could not save the course.");
      }

      await refreshCourses();
      closeCourseModal();
      showNotice(
        courseMode === "edit" ? "Course updated successfully." : "Course created successfully.",
        "success"
      );
    } catch (error) {
      showNotice(error.message || "Could not save the course.", "error");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmed = window.confirm(`Delete ${course.title}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const { response, data } = await authFetch(`${API_BASE_URL}/courses/${course.id}`, {
        method: "DELETE",
        token: authToken,
        onUnauthorized: () => {
          logout();
          navigate("/admin/login", { replace: true });
        },
      });

      if (!response.ok) {
        throw new Error(data?.message || "Could not delete the course.");
      }

      await refreshCourses();
      showNotice("Course deleted successfully.", "success");
    } catch (error) {
      showNotice(error.message || "Could not delete the course.", "error");
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    setSavingSettings(true);

    try {
      updateSettings(settings);
      showNotice("Settings saved successfully.", "success");
    } catch (error) {
      showNotice("Could not save settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  if (!admin) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const totalCourses = courses.length;
  const totalPrice = courses.reduce((sum, course) => sum + (course.price || 0), 0);
  const freeCourses = courses.filter((course) => course.price === 0).length;
  const paidCourses = courses.filter((course) => course.price > 0).length;

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage courses, users, and platform settings</p>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-info">
            <div className="admin-avatar">{admin.name[0].toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{admin.name}</div>
              <div className="admin-user-role">{admin.role}</div>
            </div>
          </div>
          <div className="admin-header-actions">
            <Link to="/" className="btn btn-secondary">Go to Website</Link>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={`admin-nav-item ${activeTab === "overview" ? "admin-nav-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`admin-nav-item ${activeTab === "courses" ? "admin-nav-active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          📚 Courses
        </button>
        <button
          className={`admin-nav-item ${activeTab === "users" ? "admin-nav-active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button
          className={`admin-nav-item ${activeTab === "messages" ? "admin-nav-active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          ✉️ Messages
        </button>
        <button
          className={`admin-nav-item ${activeTab === "settings" ? "admin-nav-active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Settings
        </button>
      </nav>

      <div className="admin-content">
        {notice && (
          <div className={`admin-notice admin-notice-${noticeType}`}>
            {notice}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="admin-section">
            <h2 className="admin-section-title">Platform Overview</h2>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📚</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{totalCourses}</div>
                  <div className="admin-stat-label">Total Courses</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">🎁</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{freeCourses}</div>
                  <div className="admin-stat-label">Free Courses</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">💳</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{paidCourses}</div>
                  <div className="admin-stat-label">Paid Courses</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">💰</div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">₹{totalPrice.toLocaleString("en-IN")}</div>
                  <div className="admin-stat-label">Total Revenue</div>
                </div>
              </div>
            </div>

            <div className="admin-actions-panel">
              <h3 className="admin-actions-title">Quick Actions</h3>
              <div className="admin-actions-row">
                <button className="btn btn-primary" onClick={openCreateCourseModal}>
                  ✨ Add New Course
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab("users")}>
                  👥 View Users
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab("courses") }>
                  📊 View Courses
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Courses Management</h2>
              <button className="btn btn-primary" onClick={openCreateCourseModal}>
                + Add New Course
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Instructor</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.id}</td>
                        <td>{course.title}</td>
                        <td>{course.instructor}</td>
                        <td>{course.category}</td>
                        <td>{course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}</td>
                        <td>{course.students}</td>
                        <td>
                          <button className="admin-action-btn admin-btn-edit" onClick={() => openEditCourseModal(course)}>
                            Edit
                          </button>
                          <button className="admin-action-btn admin-btn-delete" onClick={() => handleDeleteCourse(course)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", color: "var(--muted)" }}>
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Users</h2>
              <button className="btn btn-secondary" onClick={fetchUsers} disabled={usersLoading}>
                {usersLoading ? "Refreshing..." : "Refresh Users"}
              </button>
            </div>

            {usersError && <div className="admin-notice admin-notice-error">{usersError}</div>}

            <div className="admin-users-grid">
              {usersLoading ? (
                <div className="admin-empty-state">Loading users...</div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <div className="admin-user-card" key={user.id}>
                    <div className="admin-user-card-top">
                      <div className="admin-avatar">{(user.name?.[0] || "U").toUpperCase()}</div>
                      <div>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                      </div>
                    </div>
                    <div className="admin-user-meta">
                      <span>Joined: {user.joined || "Unknown"}</span>
                      <span>Enrolled courses: {user.courses?.length || 0}</span>
                      <span>Location: {user.location || "Not provided"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-empty-state">No users found.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Contact Messages</h2>
              <button className="btn btn-secondary" onClick={fetchMessages} disabled={messagesLoading}>
                {messagesLoading ? "Refreshing..." : "Refresh Messages"}
              </button>
            </div>

            {messagesError && <div className="admin-notice admin-notice-error">{messagesError}</div>}

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {messagesLoading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "var(--muted)" }}>
                        Loading messages...
                      </td>
                    </tr>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <tr key={message._id}>
                        <td>{message.name}</td>
                        <td>{message.email}</td>
                        <td>{message.subject}</td>
                        <td>{message.status}</td>
                        <td>{new Date(message.createdAt).toLocaleString()}</td>
                        <td style={{ maxWidth: 320 }}>{message.message}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "var(--muted)" }}>
                        No contact messages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="admin-section">
            <h2 className="admin-section-title">Settings</h2>

            <form className="admin-settings-group" onSubmit={handleSaveSettings}>
              <h3>Platform Settings</h3>
              <div className="admin-setting-item">
                <label>Platform Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={settings.platformName}
                  onChange={(event) => setSettings((current) => ({ ...current, platformName: event.target.value }))}
                />
              </div>
              <div className="admin-setting-item">
                <label>Support Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={settings.supportEmail}
                  onChange={(event) => setSettings((current) => ({ ...current, supportEmail: event.target.value }))}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingSettings} style={{ marginTop: 16 }}>
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}
      </div>

      {isCourseModalOpen && (
        <div className="admin-modal-overlay" onClick={closeCourseModal}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>{courseMode === "edit" ? "Edit Course" : "Add New Course"}</h3>
                <p>{courseMode === "edit" ? "Update course details and publish changes." : "Create a new course entry."}</p>
              </div>
              <button className="admin-modal-close" onClick={closeCourseModal} type="button">
                ×
              </button>
            </div>

            <form className="admin-form-grid" onSubmit={handleSaveCourse}>
              <label className="admin-setting-item">
                <span>ID</span>
                <input
                  type="number"
                  className="admin-input"
                  name="id"
                  value={courseForm.id}
                  onChange={handleCourseChange}
                  disabled={courseMode === "edit"}
                  required
                />
              </label>

              <label className="admin-setting-item admin-full-width">
                <span>Title</span>
                <input type="text" className="admin-input" name="title" value={courseForm.title} onChange={handleCourseChange} required />
              </label>

              <label className="admin-setting-item admin-full-width">
                <span>Description</span>
                <textarea className="admin-input admin-textarea" name="description" value={courseForm.description} onChange={handleCourseChange} />
              </label>

              <label className="admin-setting-item">
                <span>Instructor</span>
                <input type="text" className="admin-input" name="instructor" value={courseForm.instructor} onChange={handleCourseChange} required />
              </label>

              <label className="admin-setting-item">
                <span>Instructor Avatar</span>
                <input type="url" className="admin-input" name="instructorAvatar" value={courseForm.instructorAvatar} onChange={handleCourseChange} />
              </label>

              <label className="admin-setting-item">
                <span>Category</span>
                <select className="admin-input" name="category" value={courseForm.category} onChange={handleCourseChange} required>
                  {COURSE_OPTIONS.category.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-setting-item">
                <span>Difficulty</span>
                <select className="admin-input" name="difficulty" value={courseForm.difficulty} onChange={handleCourseChange} required>
                  {COURSE_OPTIONS.difficulty.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-setting-item">
                <span>Duration</span>
                <input type="text" className="admin-input" name="duration" value={courseForm.duration} onChange={handleCourseChange} required />
              </label>

              <label className="admin-setting-item">
                <span>Price</span>
                <input type="number" min="0" className="admin-input" name="price" value={courseForm.price} onChange={handleCourseChange} />
              </label>

              <label className="admin-setting-item">
                <span>Rating</span>
                <input type="text" className="admin-input" name="rating" value={courseForm.rating} onChange={handleCourseChange} />
              </label>

              <label className="admin-setting-item">
                <span>Students</span>
                <input type="text" className="admin-input" name="students" value={courseForm.students} onChange={handleCourseChange} />
              </label>

              <label className="admin-setting-item admin-full-width">
                <span>Thumbnail URL</span>
                <input type="url" className="admin-input" name="thumbnail" value={courseForm.thumbnail} onChange={handleCourseChange} />
              </label>

              <label className="admin-setting-item admin-full-width">
                <span>Curriculum Sections (JSON)</span>
                <textarea
                  className="admin-input admin-textarea admin-curriculum-json"
                  name="sectionsJson"
                  value={courseForm.sectionsJson}
                  onChange={handleCourseChange}
                  placeholder='[{"title":"Section","lectures":[{"title":"Lecture","type":"video","duration":"10 min","content":"..."}]}]'
                />
              </label>

              <div className="admin-modal-actions admin-full-width">
                <button type="button" className="btn btn-secondary" onClick={closeCourseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingCourse}>
                  {savingCourse ? "Saving..." : courseMode === "edit" ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
