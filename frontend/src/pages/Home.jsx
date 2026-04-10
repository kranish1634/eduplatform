import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useCourses } from "../context/CourseContext";
import { useState, useEffect, useCallback, useMemo } from "react";

const INTERVAL = 3200; // ms between slides

function HeroSlider({ slides }) {
  const navigate             = useNavigate();
  const { recordActivity }   = useUser();
  const [active,  setActive] = useState(0);
  const [paused,  setPaused] = useState(false);
  const [animDir, setAnimDir] = useState("next"); // "next" | "prev"

  const goTo = useCallback((idx, dir = "next") => {
    setAnimDir(dir);
    setActive(idx);
  }, []);

  const next = useCallback(() => goTo((active + 1) % slides.length, "next"), [active, goTo, slides.length]);
  const prev = useCallback(() => goTo((active - 1 + slides.length) % slides.length, "prev"), [active, goTo, slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [paused, next]);

  if (slides.length === 0) return <div style={{ color: "var(--muted)" }}>Loading courses...</div>;

  const slide    = slides[active];
  const course   = slide.course;
  const isFree   = course.price === 0;
  const initials = course.instructor.split(" ").map((n) => n[0]).join("");

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main card */}
      <div
        className={`hero-slide-card hero-slide-${animDir}`}
        key={active}
        style={{ "--slide-accent": slide.accent }}
      >
        {/* Top row */}
        <div className="hsc-top">
          <span className="hsc-tag" style={{ background: `${slide.accent}22`, color: slide.accent, border: `1px solid ${slide.accent}44` }}>
            {slide.icon} {slide.tag}
          </span>
          <span className={`card-price-tag ${isFree ? "card-price-free" : "card-price-paid"}`}>
            {isFree ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
          </span>
        </div>

        {/* Category badge */}
        <span className="card-badge" style={{ marginTop: 4 }}>{course.category}</span>

        {/* Title */}
        <h3 className="hsc-title">{course.title}</h3>

        {/* Instructor */}
        <div className="hsc-instructor">
          <div className="hsc-avatar" style={{ borderColor: slide.accent, color: slide.accent }}>{initials}</div>
          <div>
            <div style={{ color: "var(--text)", fontWeight: 500, fontSize: "0.875rem" }}>{course.instructor}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>Lead Instructor</div>
          </div>
        </div>

        {/* Meta row */}
        <div className="hsc-meta">
          <span>⏱ {course.duration}</span>
          <span>⭐ {course.rating}</span>
          <span>👥 {course.students}</span>
          <span className={`card-difficulty card-difficulty-${course.difficulty?.toLowerCase()}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Decorative accent bar */}
        <div className="hsc-accent-bar" style={{ background: `linear-gradient(90deg, ${slide.accent}, transparent)` }} />

        {/* CTA */}
        <button
          className="btn btn-primary hsc-cta"
          style={{ background: slide.accent, color: "#0d1117" }}
          onClick={() => {
            const activityPromise = recordActivity?.({
              type: "viewed",
              courseId: course.id,
              title: course.title,
              detail: "Opened from the featured course slider.",
            });
            activityPromise?.catch(() => {});
            navigate(`/course/${course.id}`);
          }}
        >
          View Course →
        </button>
      </div>

      {/* Navigation arrows */}
      <button className="hsc-arrow hsc-arrow-prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="hsc-arrow hsc-arrow-next" onClick={next} aria-label="Next">›</button>

      {/* Dot indicators */}
      <div className="hsc-dots">
        {slides.map((s, i) => (
          <button
            key={i}
            className={`hsc-dot ${i === active ? "hsc-dot-active" : ""}`}
            style={{ background: i === active ? s.accent : undefined }}
            onClick={() => goTo(i, i > active ? "next" : "prev")}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="hsc-progress">
        <div
          className="hsc-progress-fill"
          key={`${active}-${paused}`}
          style={{
            background: slide.accent,
            animationDuration: `${INTERVAL}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}

function Home() {
  const { user } = useUser();
  const { courses } = useCourses();

  // Derive stats from real data
  const TOTAL_COURSES = courses.length;
  const TOTAL_STUDENTS = "3K+";
  const TOTAL_INSTRUCTORS = "5+";

  // Pick 6 visually diverse slides from the course catalog
  const slides = useMemo(() => {
    const slidesConfig = [
      { id: 1,  accent: "#f5a623", icon: "⚛",  tag: "Most Popular"  },
      { id: 9,  accent: "#4caf82", icon: "🔥",  tag: "Top Rated"     },
      { id: 18, accent: "#e55353", icon: "🧠",  tag: "Advanced"      },
      { id: 16, accent: "#4caf82", icon: "🎁",  tag: "Free"          },
      { id: 10, accent: "#a78bfa", icon: "⚡",  tag: "New"           },
      { id: 17, accent: "#f5a623", icon: "🐳",  tag: "Trending"      },
    ];
    return slidesConfig
      .map((s) => ({ ...s, course: courses.find((c) => c.id === s.id) }))
      .filter((s) => s.course);
  }, [courses]);

  return (
    <section className="home-hero home-hero-split">
      {/* ── LEFT: existing hero content ── */}
      <div className="hero-left">
        <div className="hero-eyebrow">Online Learning Platform</div>
        <h1>
          Expand your <em>skills,</em>
          <br /> shape your future.
        </h1>
        <p>
          Join thousands of learners mastering in-demand skills with expert-led
          courses — at your own pace.
        </p>
        <div className="hero-actions">
          <Link to="/courses">
            <button className="btn btn-primary">Browse Courses →</button>
          </Link>
          {user ? (
            <Link to="/dashboard">
              <button className="btn btn-secondary">Go to Dashboard →</button>
            </Link>
          ) : (
            <Link to="/login">
              <button className="btn btn-secondary">Sign In</button>
            </Link>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">{TOTAL_STUDENTS}</span>
            <span className="stat-label">Students Enrolled</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{TOTAL_INSTRUCTORS}</span>
            <span className="stat-label">Expert Instructors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{TOTAL_COURSES}+</span>
            <span className="stat-label">Courses Available</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: auto-sliding course showcase ── */}
      <div className="hero-right">
        <HeroSlider slides={slides} />
      </div>
    </section>
  );
}

export default Home;
