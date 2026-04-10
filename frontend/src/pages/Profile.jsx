import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useCourses } from "../context/CourseContext";
import { useUserPreferences } from "../context/UserPreferencesContext";

export default function Profile() {
  const navigate            = useNavigate();
  const { user, updateProfile } = useUser();
  const { courses } = useCourses();
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form,    setForm]    = useState({
    name:     user?.name     || "",
    email:    user?.email    || "",
    bio:      user?.bio      || "",
    location: user?.location || "",
    website:  user?.website  || "",
  });

  const initials = (form.name || "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Build enrolled courses from user.courses (live from server)
  const userCourses     = user?.courses || [];
  const enrolledCourses = userCourses
    .map((uc) => {
      const course = courses.find((c) => c.id === uc.courseId);
      if (!course) return null;
      return { ...course, progress: uc.progress };
    })
    .filter(Boolean);

  const certificates = enrolledCourses
    .filter((c) => c.progress === 100)
    .map((c) => {
      const uc = userCourses.find((u) => u.courseId === c.id);
      const date = uc?.enrolledAt
        ? new Date(uc.enrolledAt).toLocaleString("en-US", { month: "long", year: "numeric" })
        : "2026";
      return { id: c.id, title: c.title, date };
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Profile save error:", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">

      {/* Banner */}
      <div className="profile-banner">
        <div className="profile-avatar-wrap">
          <div className="avatar-circle-xl">{initials}</div>
        </div>
      </div>

      <div className="profile-body">

        {/* Left: info card + certificates */}
        <div className="profile-left">
          <div className="profile-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, color: "var(--white)" }}>{form.name}</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>{form.email}</p>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "8px 14px" }} onClick={() => setEditing(!editing)}>
                {editing ? "Cancel" : "✎ Edit"}
              </button>
            </div>

            {saved && <div className="profile-saved-toast">✓ Profile saved!</div>}

            {editing ? (
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name", key: "name",     type: "text"  },
                  { label: "Email",     key: "email",    type: "email" },
                  { label: "Location", key: "location", type: "text"  },
                  { label: "Website",  key: "website",  type: "text"  },
                ].map(({ label, key, type }) => (
                  <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                    <label>{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    style={{ width: "100%", padding: "12px 16px", background: "var(--navy-light)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", outline: "none", resize: "vertical" }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ alignSelf: "flex-start", opacity: saving ? 0.7 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes →"}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {form.bio || "No bio yet."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {[
                    { icon: "📍", label: "Location", val: form.location || "—" },
                    { icon: "🌐", label: "Website", val: form.website  || "—" },
                    { icon: "📅", label: "Joined", val: `Joined ${user?.joined || "—"}` },
                  ].map(({ icon, label, val }) => (
                    <span key={label} style={{ fontSize: "0.875rem", color: "var(--muted)", display: "flex", gap: 8 }}>
                      <span>{icon}</span>{val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="profile-card">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Certificates</h3>
            {certificates.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No certificates yet. Complete a course to earn one!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {certificates.map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "var(--navy-light)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.9rem" }}>🏅 {c.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{c.date}</div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                      onClick={() => navigate(`/certificate/${c.id}`)}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-card">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Learning Preferences</h3>

            <div style={{ display: "grid", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => updatePreference("theme", e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="midnight">Midnight</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Text Size</label>
                <select
                  value={preferences.textSize}
                  onChange={(e) => updatePreference("textSize", e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => updatePreference("language", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: "0.9rem" }}>
                <input
                  type="checkbox"
                  checked={preferences.reducedMotion}
                  onChange={(e) => updatePreference("reducedMotion", e.target.checked)}
                />
                Reduce motion
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: "0.9rem" }}>
                <input
                  type="checkbox"
                  checked={preferences.highContrast}
                  onChange={(e) => updatePreference("highContrast", e.target.checked)}
                />
                High contrast
              </label>

              <button
                className="btn btn-secondary"
                style={{ alignSelf: "flex-start", fontSize: "0.82rem", padding: "8px 14px" }}
                onClick={resetPreferences}
              >
                Reset Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Right: enrolled courses */}
        <div className="profile-right">
          <div className="profile-card">
            <h3 className="section-title" style={{ marginBottom: 20 }}>Enrolled Courses</h3>
            {enrolledCourses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>📚</div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 16 }}>No courses enrolled yet.</p>
                <Link to="/courses">
                  <button className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "10px 20px" }}>Browse Courses →</button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {enrolledCourses.map((c) => (
                  <Link to={`/course/${c.id}`} key={c.id} style={{ display: "block" }}>
                    <div
                      style={{ padding: "14px 16px", background: "var(--navy-light)", borderRadius: 8, border: "1px solid var(--border)", transition: "border-color 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span className="card-badge">{c.category}</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: c.progress === 100 ? "#4caf82" : c.progress > 0 ? "var(--amber)" : "var(--muted)" }}>
                          {c.progress}%
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.9rem", marginBottom: 8 }}>{c.title}</div>
                      <div style={{ background: "var(--border)", borderRadius: 4, height: 4 }}>
                        <div style={{ width: `${c.progress}%`, height: "100%", background: c.progress === 100 ? "#4caf82" : "var(--amber)", borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}