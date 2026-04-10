import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useCourses } from "../context/CourseContext";
import { useState } from "react";
import { getDisplayCourseDuration, parseDurationToMinutes } from "../utils/courseDuration";

function fmtHours(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ProgressBar({ value }) {
  const color = value >= 70 ? "#4caf82" : value >= 35 ? "var(--amber)" : "var(--muted)";
  return (
    <div className="dashboard-progress-track">
      <div
        className="dashboard-progress-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user, getProgress, updateProgress, recordActivity } = useUser();
  const { courses } = useCourses();
  const navigate = useNavigate();
  const [savingCourseId, setSavingCourseId] = useState(null);

  const displayName = user?.name     || "Learner";
  const initials    = user?.initials || displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Build enrolled courses list from user.courses (live from server)
  const userCourses     = user?.courses || [];  // [{courseId, progress, enrolledAt}]
  const enrolledCourses = userCourses
    .map((uc) => {
      const course = courses.find((c) => c.id === uc.courseId);
      if (!course) return null;
      return { ...course, progress: uc.progress };
    })
    .filter(Boolean);

  // Stats
  const totalCourses     = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter((c) => c.progress === 100).length;
  const totalLearnedMins = enrolledCourses.reduce((sum, c) => {
    return sum + Math.round(parseDurationToMinutes(getDisplayCourseDuration(c)) * (c.progress / 100));
  }, 0);

  // Compute streak: count consecutive calendar days with activity going backwards from today
  const computeStreak = () => {
    const activities = user?.recentActivity || [];
    if (!activities.length) return "0d";
    const activityDays = new Set(
      activities.map((a) => {
        const d = new Date(a.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.toDateString();
      })
    );
    let streak = 0;
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    while (activityDays.has(day.toDateString())) {
      streak++;
      day.setDate(day.getDate() - 1);
    }
    return streak > 0 ? `${streak}d` : "0d";
  };

  const stats = [
    { label: "Courses Enrolled", value: String(totalCourses) },
    { label: "Hours Learned",    value: totalLearnedMins > 0 ? fmtHours(totalLearnedMins) : "0h" },
    { label: "Certificates",     value: String(completedCourses) },
    { label: "Streak",           value: computeStreak() },
  ];

  const formatActivityTime = (value) => {
    if (!value) return "Recent";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recent";

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatActivityText = (activity, fallbackText) => {
    const base = activity.detail || fallbackText || activity.title;
    const title = activity.title || "this course";
    if (!title) return base;

    const normalizedBase = String(base).toLowerCase();
    const normalizedTitle = String(title).toLowerCase();
    if (normalizedBase.includes(normalizedTitle)) return base;
    return `${base} (${title})`;
  };

  const activityFeed = (user?.recentActivity || []).map((activity) => {
    const iconMap = {
      viewed: "▶",
      enrolled: "🎓",
      progress: "⏳",
      completed: "🏅",
    };

    const textMap = {
      viewed: `Viewed "${activity.title}"`,
      enrolled: `Enrolled in "${activity.title}"`,
      progress: `Updated progress for "${activity.title}"`,
      completed: `Completed "${activity.title}"`,
    };

    return {
      icon: iconMap[activity.type] || "•",
      text: formatActivityText(activity, textMap[activity.type]),
      time: formatActivityTime(activity.createdAt),
      highlight: activity.type === "enrolled" || activity.type === "completed",
      courseTitle: activity.title,
      progress: activity.progress,
    };
  });

  const commitProgress = async (course, nextProgress) => {
    const currentProgress = course.progress ?? 0;
    const safeProgress = Math.max(0, Math.min(100, Math.round(nextProgress)));

    if (safeProgress === currentProgress) return;

    setSavingCourseId(course.id);
    try {
      await updateProgress(course.id, safeProgress);
      await recordActivity({
        type: safeProgress === 100 ? "completed" : "progress",
        courseId: course.id,
        title: course.title,
        detail: safeProgress === 100
          ? "Marked course as completed from the dashboard."
          : `Updated dashboard progress to ${safeProgress}%.`,
        progress: safeProgress,
      });
    } finally {
      setSavingCourseId(null);
    }
  };

  const handleProgressBarClick = (event, course) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const nextProgress = Math.round(ratio * 100 / 5) * 5;
    commitProgress(course, nextProgress);
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="page-eyebrow">Dashboard</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "var(--white)", letterSpacing: "-1px", marginTop: 8 }}>
            Welcome back, <em style={{ fontStyle: "italic", color: "var(--amber)" }}>{displayName.split(" ")[0]}</em>
          </h2>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: "0.95rem" }}>
            {totalCourses === 0 ? "Start learning — browse our courses." : "Continue where you left off."}
          </p>
        </div>
        <div className="avatar-circle-lg">{initials}</div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        {stats.map((s) => (
          <div className="dashboard-stat-card" key={s.label}>
            <span className="stat-number">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 className="section-title">My Courses</h3>
          <Link to="/courses" className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "8px 16px" }}>
            Browse More →
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📚</div>
            <h4 style={{ fontFamily: "'Playfair Display',serif", color: "var(--white)", marginBottom: 8 }}>No courses yet</h4>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 20 }}>Enroll in a course to start tracking your progress here.</p>
            <button className="btn btn-primary" onClick={() => navigate("/courses")}>Browse Courses →</button>
          </div>
        ) : (
          <div className="dashboard-courses">
            {enrolledCourses.map((c) => {
              const prog = c.progress;
              const courseDuration = getDisplayCourseDuration(c);
              return (
                <div className="dashboard-course-card" key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="card-badge">{c.category}</span>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: "var(--white)", margin: "10px 0 4px", lineHeight: 1.3 }}>{c.title}</h4>
                      <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{c.instructor}</p>
                    </div>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: prog >= 70 ? "#4caf82" : prog > 0 ? "var(--amber)" : "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {prog}%
                    </span>
                  </div>

                  <button
                    type="button"
                    className="dashboard-progress-button"
                    onClick={(event) => handleProgressBarClick(event, c)}
                    title="Click to update progress"
                    disabled={savingCourseId === c.id}
                  >
                    <ProgressBar value={prog} />
                  </button>

                  <div className="dashboard-progress-hint">
                    {savingCourseId === c.id ? "Saving progress..." : "Click the bar to update progress"}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>⏱ {courseDuration}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>⭐ {c.rating}</span>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "10px" }}
                      onClick={() => navigate(`/course/${c.id}`)}
                    >
                      {prog === 100 ? "Review Course" : prog === 0 ? "Start Course →" : "Continue →"}
                    </button>
                    {prog === 100 && (
                      <button
                        className="btn btn-secondary"
                        style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: 10 }}
                        onClick={() => navigate(`/certificate/${c.id}`)}
                      >
                        View Certificate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h3 className="section-title" style={{ marginBottom: 20 }}>Recent Activity</h3>
        {activityFeed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 24px", background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--muted)" }}>
            Start opening courses or enroll in one to see your recent activity here.
          </div>
        ) : (
          <div className="activity-list">
            {activityFeed.map((a, i) => (
              <div className="activity-item" key={`${a.courseTitle}-${a.time}-${i}`}
                style={{ background: a.highlight ? "rgba(245,166,35,0.05)" : undefined, borderRadius: 8, border: a.highlight ? "1px solid rgba(245,166,35,0.15)" : "1px solid transparent" }}>
                <span className="activity-icon" style={{ background: a.highlight ? "rgba(245,166,35,0.15)" : undefined, borderColor: a.highlight ? "rgba(245,166,35,0.3)" : undefined }}>
                  {a.icon}
                </span>
                <span style={{ flex: 1, fontSize: "0.9rem", color: "var(--text)" }}>{a.text}</span>
                <span style={{ fontSize: "0.78rem", color: a.highlight ? "var(--amber)" : "var(--muted)", fontWeight: a.highlight ? 600 : 400 }}>
                  {a.progress != null ? `${a.progress}% · ` : ""}{a.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}