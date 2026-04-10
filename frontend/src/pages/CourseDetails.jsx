import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { useCourses } from "../context/CourseContext";
import { getDisplayCourseDuration, parseDurationToMinutes } from "../utils/courseDuration";

const FALLBACK_CURRICULUM = [
  {
    title: "Introduction & Setup",
    lectures: [
      {
        title: "Course Overview",
        type: "video",
        duration: "12 min",
        content: "Intro to the course and outcomes.",
        materials: [
          { title: "Overview Video", type: "video", url: "https://www.youtube.com/watch?v=8mAITcNt710", note: "Watch this first." },
          { title: "Course Notes PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Downloadable notes." },
        ],
      },
      {
        title: "Environment Setup",
        type: "article",
        duration: "8 min",
        content: "Install tools and prepare your workspace.",
        materials: [
          { title: "Setup Slides PPT", type: "ppt", url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx", note: "Use with the setup lesson." },
          { title: "Setup Checklist PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Checklist for installation." },
        ],
      },
    ],
  },
  {
    title: "Core Concepts Deep Dive",
    lectures: [
      {
        title: "Main Concepts",
        type: "video",
        duration: "18 min",
        content: "Learn the core concepts step by step.",
        materials: [
          { title: "Concept Lecture Video", type: "video", url: "https://www.youtube.com/watch?v=4MZN7b4Hj10", note: "Replay for revision." },
          { title: "Concept Diagram PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Printable summary." },
        ],
      },
      {
        title: "Quick Quiz",
        type: "quiz",
        duration: "5 min",
        content: "Test your understanding before practice.",
        materials: [
          { title: "Quiz Review Slides", type: "ppt", url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx", note: "Review the key points." },
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
        content: "Follow a practical project walkthrough.",
        materials: [
          { title: "Project Walkthrough Video", type: "video", url: "https://www.youtube.com/watch?v=8mAITcNt710", note: "Build as you watch." },
          { title: "Project Handout PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Keep this open while coding." },
        ],
      },
      {
        title: "Project Notes",
        type: "file",
        duration: "3 min",
        content: "Downloadable notes and reference material.",
        materials: [
          { title: "Download Slides PPT", type: "ppt", url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx", note: "Slide deck for revision." },
          { title: "Notes PDF", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", note: "Printable lecture notes." },
        ],
      },
    ],
  },
  {
    title: "Advanced Techniques",
    lectures: [
      { title: "Advanced Patterns", type: "video", duration: "16 min", content: "Learn the techniques used in larger projects." },
    ],
  },
  {
    title: "Testing & Best Practices",
    lectures: [
      { title: "Testing Workflow", type: "article", duration: "10 min", content: "How to test and review your work properly." },
    ],
  },
  {
    title: "Deployment & Beyond",
    lectures: [
      { title: "Deployment Guide", type: "video", duration: "14 min", content: "Deploy the project and plan your next steps." },
    ],
  },
];

const COURSE_VIDEO_LIBRARY = {
  "React Basics": "https://www.youtube.com/watch?v=bMknfKXIFA8",
  "Advanced React & Redux": "https://www.youtube.com/watch?v=CVpUuw9XSjY",
  "CSS Mastery": "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
  "Tailwind CSS from Scratch": "https://www.youtube.com/watch?v=ft30zcMlFao",
  "JavaScript Advanced": "https://www.youtube.com/watch?v=Mus_vwhTCq0",
  "TypeScript in Depth": "https://www.youtube.com/watch?v=30LWjhZzg50",
  "JavaScript for Beginners": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
  "Web Development Bootcamp": "https://www.youtube.com/watch?v=zJSY8tbf_ys",
  "MERN Stack Masterclass": "https://www.youtube.com/watch?v=7CqJlxBYj-M",
  "Next.js & Full Stack Dev": "https://www.youtube.com/watch?v=wm5gMKuwSYk",
  "Node.js Fundamentals": "https://www.youtube.com/watch?v=TlB_eWDSMt4",
  "REST APIs with Express": "https://www.youtube.com/watch?v=-MTSQjw5DrM",
  "Django for Python Developers": "https://www.youtube.com/watch?v=F5mRW0jo-U4",
  "SQL & PostgreSQL Essentials": "https://www.youtube.com/watch?v=qw--VYLpxG4",
  "MongoDB Complete Guide": "https://www.youtube.com/watch?v=ofme2o29ngU",
  "Git & GitHub for Developers": "https://www.youtube.com/watch?v=RGOj5yH7evk",
  "Docker & Kubernetes Essentials": "https://www.youtube.com/watch?v=3c-iBn73dDE",
  "Data Structures & Algorithms": "https://www.youtube.com/watch?v=8hly31xKli0",
};

const GENERIC_VIDEO_URLS = new Set([
  "https://www.youtube.com/watch?v=8mAITcNt710",
  "https://www.youtube.com/watch?v=4MZN7b4Hj10",
]);

const DEFAULT_PDF_URL   = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const DEFAULT_PPT_URL   = "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx";
const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=8mAITcNt710";

function resolveMaterialUrl(courseTitle, material) {
  if (material?.type !== "video") return material?.url;
  const currentUrl = material?.url || "";
  if (currentUrl && !GENERIC_VIDEO_URLS.has(currentUrl)) return currentUrl;
  return COURSE_VIDEO_LIBRARY[courseTitle] || currentUrl;
}

function buildMissingMaterials(courseTitle, sectionTitle, lecture) {
  const videoUrl     = COURSE_VIDEO_LIBRARY[courseTitle] || DEFAULT_VIDEO_URL;
  const lectureTitle = lecture?.title || "Lecture";
  const lectureType  = String(lecture?.type || "file").toLowerCase();

  if (lectureType === "video") {
    return [
      { title: `${lectureTitle} Video`,  type: "video", url: videoUrl,        note: `Watch this lesson from ${sectionTitle}.` },
      { title: `${lectureTitle} Notes`,  type: "pdf",   url: DEFAULT_PDF_URL, note: "Reference notes for this lecture." },
    ];
  }
  if (lectureType === "article") {
    return [
      { title: `${lectureTitle} Reading PDF`,      type: "pdf",  url: DEFAULT_PDF_URL,               note: "Read this before moving to the next lecture." },
      { title: `${lectureTitle} Quick Reference`,  type: "link", url: "https://developer.mozilla.org/", note: "Additional reference documentation." },
    ];
  }
  if (lectureType === "quiz") {
    return [
      { title: `${lectureTitle} Revision Slides`, type: "ppt", url: DEFAULT_PPT_URL,   note: "Revise key points before retrying." },
      { title: `${lectureTitle} Summary Sheet`,   type: "pdf", url: DEFAULT_PDF_URL,   note: "Short summary for quick revision." },
    ];
  }
  return [
    { title: `${lectureTitle} Notes`,  type: "pdf", url: DEFAULT_PDF_URL, note: "Downloadable notes for this lecture." },
    { title: `${lectureTitle} Slides`, type: "ppt", url: DEFAULT_PPT_URL, note: "Slide deck for revision." },
  ];
}

function hydrateCourseMaterialLinks(course, sections) {
  const courseTitle = course?.title || "";
  return sections.map((section) => {
    const lectures = Array.isArray(section.lectures) ? section.lectures : [];
    return {
      ...section,
      lectures: lectures.map((lecture) => {
        const hasMaterials = Array.isArray(lecture.materials) && lecture.materials.length > 0;
        const materials    = hasMaterials
          ? lecture.materials
          : buildMissingMaterials(courseTitle, section?.title || "this section", lecture);
        return {
          ...lecture,
          materials: materials.map((material) => ({
            ...material,
            url: resolveMaterialUrl(courseTitle, material),
          })),
        };
      }),
    };
  });
}

function getCourseSections(course) {
  if (Array.isArray(course.sections) && course.sections.length > 0) {
    return course.sections;
  }
  return FALLBACK_CURRICULUM;
}

function getTotalMaterials(sections) {
  return sections.reduce((total, section) => {
    const lectures = Array.isArray(section.lectures) ? section.lectures : [];
    return total + lectures.reduce((lectureTotal, lecture) => {
      return lectureTotal + (Array.isArray(lecture.materials) ? lecture.materials.length : 0);
    }, 0);
  }, 0);
}

function getEmbedUrl(url = "") {
  if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("youtu.be/"))            return url.replace("youtu.be/", "youtube.com/embed/");
  return url;
}

function estimateWatchSeconds(duration = "") {
  const totalSeconds = parseDurationToMinutes(duration) * 60;
  if (totalSeconds <= 0) return 20;
  return Math.min(90, Math.max(15, Math.round(totalSeconds * 0.2)));
}

// ── localStorage key helper (module-scope, takes explicit args) ───
function buildStorageKey(userId, courseId) {
  if (!userId || !courseId) return null;
  return `materialProgress:${userId}:${courseId}`;
}

function readOpenedMaterials(userId, courseId) {
  const key = buildStorageKey(userId, courseId);
  if (!key) return [];
  try {
    const raw    = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
function CourseDetails() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user, isEnrolled, recordActivity, updateProgress } = useUser();
  const { courses } = useCourses();

  const [openSection,           setOpenSection]           = useState(0);
  const [activeVideo,           setActiveVideo]           = useState(null);
  const [completedMaterialKeys, setCompletedMaterialKeys] = useState(new Set());
  const trackedViewRef = useRef(null);

  const course = courses.find((c) => c.id === parseInt(id));

  // ── Values needed by effects — safe when course is null ──────────
  const alreadyEnrolled    = course ? isEnrolled(course.id) : false;
  const curriculumSections = course
    ? hydrateCourseMaterialLinks(course, getCourseSections(course))
    : [];
  const totalMaterials = getTotalMaterials(curriculumSections);

  // ── persistMaterialCompletion — defined before effects that call it ──
  const persistMaterialCompletion = (materialTitle, materialKey, partDetail) => {
    if (!alreadyEnrolled || !user || totalMaterials === 0 || !course) return;

    const key = buildStorageKey(user.id, course.id);
    if (!key) return;

    const opened = readOpenedMaterials(user?.id, course?.id);
    if (opened.includes(materialKey)) return;

    const nextOpened = [...opened, materialKey];
    localStorage.setItem(key, JSON.stringify(nextOpened));
    setCompletedMaterialKeys(new Set(nextOpened));

    const currentProgress    = user.courses?.find((c) => c.courseId === course.id)?.progress ?? 0;
    const calculatedProgress = Math.round((nextOpened.length / totalMaterials) * 100);
    const nextProgress       = Math.max(currentProgress, Math.min(100, calculatedProgress));

    updateProgress(course.id, nextProgress).catch(() => {});
    recordActivity?.({
      type:     nextProgress === 100 ? "completed" : "progress",
      courseId: course.id,
      title:    course.title,
      detail:   `Completed ${partDetail || materialTitle} in ${course.title}.`,
      progress: nextProgress,
    }).catch(() => {});
  };

  // ── Effect 1: Load opened materials from localStorage ────────────
  useEffect(() => {
    if (!course) return;
    const opened = readOpenedMaterials(user?.id, course.id);
    setCompletedMaterialKeys(new Set(opened));
  }, [user?.id, course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Sync server progress when completedMaterialKeys changes ──
  useEffect(() => {
    if (!alreadyEnrolled || !user || !course) return;
    if (totalMaterials <= 0) return;

    const openedCount        = completedMaterialKeys.size;
    const currentProgress    = user.courses?.find((c) => c.courseId === course.id)?.progress ?? 0;
    const calculatedProgress = openedCount >= totalMaterials
      ? 100
      : Math.round((openedCount / totalMaterials) * 100);
    const nextProgress = Math.max(currentProgress, Math.min(100, calculatedProgress));

    if (nextProgress > currentProgress) {
      updateProgress(course.id, nextProgress).catch(() => {});
    }
  }, [alreadyEnrolled, completedMaterialKeys, totalMaterials, updateProgress, user, course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 3: Video watch timer ──────────────────────────────────
  useEffect(() => {
    if (!activeVideo || activeVideo.completed) return;

    const intervalId = setInterval(() => {
      setActiveVideo((prev) => {
        if (!prev || prev.completed) return prev;
        const now            = Date.now();
        const isActiveWindow = document.visibilityState === "visible" && document.hasFocus();
        if (!isActiveWindow) return { ...prev, lastTickAt: now };

        const elapsedSeconds = Math.max(1, Math.round((now - (prev.lastTickAt || now)) / 1000));
        return { ...prev, watchedSeconds: prev.watchedSeconds + elapsedSeconds, lastTickAt: now };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeVideo]);

  // ── Effect 4: Mark video as completed when watch time is met ─────
  useEffect(() => {
    if (!activeVideo || activeVideo.completed) return;
    if (activeVideo.watchedSeconds < activeVideo.requiredSeconds) return;

    persistMaterialCompletion(activeVideo.title, activeVideo.materialKey, activeVideo.partDetail);
    setActiveVideo((prev) => (prev ? { ...prev, completed: true } : prev));
  }, [activeVideo, alreadyEnrolled, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 5: Record "viewed course" activity ────────────────────
  useEffect(() => {
    if (!user || !course || !recordActivity) return;
    if (trackedViewRef.current === course.id) return;

    trackedViewRef.current = course.id;
    recordActivity({
      type:     alreadyEnrolled ? "progress" : "viewed",
      courseId: course.id,
      title:    course.title,
      detail:   alreadyEnrolled
        ? `Opened course page: ${course.title}.`
        : `Viewed course page: ${course.title}.`,
      progress: alreadyEnrolled
        ? (user.courses?.find((c) => c.courseId === course.id)?.progress ?? 0)
        : undefined,
    })?.catch(() => {});
  }, [alreadyEnrolled, course?.id, recordActivity, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Safe early return — ALL hooks have already been called ───────
  if (!course) {
    return (
      <div className="course-details-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/courses">Courses</Link>
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: "var(--text)" }}>Not Found</span>
        </div>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--white)" }}>Course not found</h2>
          <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 28 }}>This course doesn't exist or may have been removed.</p>
          <Link to="/courses"><button className="btn btn-primary">Browse All Courses →</button></Link>
        </div>
      </div>
    );
  }

  // ── Post-guard computations (course is definitely non-null here) ──
  const initials        = course.instructor.split(" ").map((n) => n[0]).join("");
  const isFree          = course.price === 0;
  const priceDisplay    = isFree ? "Free" : `₹${course.price.toLocaleString("en-IN")}`;
  const currentProgress = user?.courses?.find((c) => c.courseId === course.id)?.progress ?? 0;
  const displayDuration = getDisplayCourseDuration(course, FALLBACK_CURRICULUM);

  const handleMaterialOpen = (event, material, sectionIndex, lectureIndex, materialIndex, lectureDuration, sectionTitle, lectureTitle) => {
    const materialKey = `${sectionIndex}-${lectureIndex}-${materialIndex}`;
    const partDetail  = `${sectionTitle} > ${lectureTitle} > ${material.title}`;

    recordActivity?.({
      type:     "viewed",
      courseId: course.id,
      title:    course.title,
      detail:   `Opened ${partDetail} (${material.type.toUpperCase()}) in ${course.title}.`,
      progress: user?.courses?.find((c) => c.courseId === course.id)?.progress ?? 0,
    }).catch(() => {});

    if (material.type === "video") {
      event.preventDefault();
      setActiveVideo({
        title:           material.title,
        url:             material.url,
        sourceUrl:       material.url,
        materialKey,
        partDetail,
        watchedSeconds:  0,
        requiredSeconds: estimateWatchSeconds(lectureDuration),
        lastTickAt:      0,
        completed:       readOpenedMaterials(user?.id, course.id).includes(materialKey),
      });
      return;
    }

    persistMaterialCompletion(material.title, materialKey, partDetail);
  };

  const getMaterialIcon = (type) => {
    if (type === "video") return "▶";
    if (type === "pdf")   return "PDF";
    if (type === "ppt")   return "PPT";
    return "↗";
  };

  const handleEnrollClick = () => {
    if (alreadyEnrolled) { navigate("/dashboard"); return; }
    navigate(`/checkout/${course.id}`);
  };

  const btnLabel = alreadyEnrolled
    ? "Go to Dashboard →"
    : isFree
    ? "Enroll Now — It's Free"
    : `Buy Now · ${priceDisplay}`;

  return (
    <div className="course-details-page">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/courses">Courses</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--text)" }}>{course.title}</span>
      </div>

      {/* Course hero thumbnail */}
      {course.thumbnail && (
        <div className="course-thumbnail-hero">
          <img src={course.thumbnail} alt={course.title} />
          <div className="course-thumbnail-hero-overlay" />
        </div>
      )}

      <div className="course-header">

        {/* Left */}
        <div className="course-header-left">
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="card-badge">{course.category}</span>
            <span className={`card-difficulty card-difficulty-${course.difficulty?.toLowerCase()}`}>
              {course.difficulty}
            </span>
            <span className={`card-price-tag ${isFree ? "card-price-free" : "card-price-paid"}`}>
              {isFree ? "🎁 Free" : `₹${course.price.toLocaleString("en-IN")}`}
            </span>
          </div>

          <h2 style={{ marginTop: "16px" }}>{course.title}</h2>
          <p>
            {course.description ||
              "Master the fundamentals and advanced concepts of this course through project-based learning. Build real-world skills you can apply immediately."}
          </p>

          <div className="course-instructor-info">
            {course.instructorAvatar ? (
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="instructor-avatar-lg instructor-avatar-lg-img"
              />
            ) : (
              <div className="instructor-avatar-lg">{initials}</div>
            )}
            <div>
              <div style={{ color: "var(--text)", fontWeight: 500 }}>{course.instructor}</div>
              <div style={{ fontSize: "0.8rem" }}>Lead Instructor</div>
            </div>
          </div>

          <div className="card-meta" style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <span>⏱ {displayDuration}</span>
            <span>⭐ {course.rating} rating</span>
            <span>👥 {course.students} students</span>
          </div>
        </div>

        {/* Right: enroll card */}
        <div className="enroll-card">
          <div className="enroll-card-price">
            {isFree ? (
              <>Free <span>/ lifetime access</span></>
            ) : (
              <>
                {priceDisplay}
                <span style={{ fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, color: "var(--muted)", display: "block", marginTop: 4 }}>
                  One-time payment · lifetime access
                </span>
              </>
            )}
          </div>

          {alreadyEnrolled && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(76,175,130,0.1)", border: "1px solid rgba(76,175,130,0.3)",
              color: "#4caf82", fontSize: "0.875rem", fontWeight: 500,
            }}>
              ✓ You're enrolled in this course
            </div>
          )}

          <button className="btn btn-enroll" onClick={handleEnrollClick}
            style={{ background: alreadyEnrolled ? "var(--navy-light)" : undefined,
                     color: alreadyEnrolled ? "var(--text)" : undefined }}>
            {btnLabel}
          </button>

          {alreadyEnrolled && currentProgress === 100 && (
            <button
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => navigate(`/certificate/${course.id}`)}
            >
              View Certificate
            </button>
          )}

          <ul className="enroll-features">
            <li>{displayDuration} of on-demand video</li>
            <li>Certificate of completion</li>
            <li>Full lifetime access</li>
            <li>Access on mobile & desktop</li>
            <li>Downloadable resources</li>
          </ul>
        </div>
      </div>

      {/* Curriculum */}
      <div className="course-section">
        <h3>Course Curriculum</h3>
        <div className="curriculum-list">
          {curriculumSections.map((section, sectionIndex) => {
            const lectures     = Array.isArray(section.lectures) ? section.lectures : [];
            const lectureCount = lectures.length;

            return (
              <section
                key={section._id || `${section.title}-${sectionIndex}`}
                className={`curriculum-item ${openSection === sectionIndex ? "curriculum-item-open" : ""}`}
              >
                <button
                  type="button"
                  className="curriculum-toggle"
                  onClick={() => setOpenSection((current) => (current === sectionIndex ? -1 : sectionIndex))}
                >
                  <span className="curriculum-num">{String(sectionIndex + 1).padStart(2, "0")}</span>
                  <span className="curriculum-title">{section.title}</span>
                  <span className="curriculum-meta">{lectureCount} lectures</span>
                </button>

                <div className="curriculum-body" style={{ display: openSection === sectionIndex ? "block" : "none" }}>
                  <ul className="curriculum-lectures">
                    {lectures.map((lecture, lectureIndex) => (
                      <li key={lecture._id || `${sectionIndex}-${lectureIndex}-${lecture.title}`} className="curriculum-lecture">
                        <div className="curriculum-lecture-top">
                          <span className={`curriculum-lecture-type curriculum-lecture-type-${lecture.type}`}>{lecture.type}</span>
                          <span className="curriculum-lecture-duration">{lecture.duration || "15 min"}</span>
                        </div>
                        <h4>{lecture.title}</h4>
                        <p>{lecture.content || (alreadyEnrolled ? "Available for enrolled learners." : "Enroll to unlock this lecture.")}</p>

                        {Array.isArray(lecture.materials) && lecture.materials.length > 0 && (
                          <div className="curriculum-materials">
                            {lecture.materials.map((material, materialIndex) => {
                              const materialRenderKey = `${sectionIndex}-${lectureIndex}-${materialIndex}`;
                              const completed         = completedMaterialKeys.has(materialRenderKey);

                              return (
                                <a
                                  key={material._id || `${sectionIndex}-${lectureIndex}-${materialIndex}-${material.title}`}
                                  className={`curriculum-material curriculum-material-${material.type} ${completed ? "curriculum-material-completed" : ""}`}
                                  href={material.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => handleMaterialOpen(
                                    event,
                                    material,
                                    sectionIndex,
                                    lectureIndex,
                                    materialIndex,
                                    lecture.duration,
                                    section.title,
                                    lecture.title,
                                  )}
                                >
                                  <span className="curriculum-material-icon">{getMaterialIcon(material.type)}</span>
                                  <span className="curriculum-material-text">
                                    <strong>{material.title}</strong>
                                    <small>{material.note || material.type.toUpperCase()}</small>
                                  </span>
                                  {completed && <span className="curriculum-material-done">✓✓</span>}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {activeVideo && (
        <div className="video-modal-overlay" role="dialog" aria-modal="true">
          <div className="video-modal">
            <div className="video-modal-header">
              <h4>{activeVideo.title}</h4>
              <button
                type="button"
                className="video-modal-close"
                onClick={() => setActiveVideo(null)}
              >
                ×
              </button>
            </div>

            <div className="video-modal-player-wrap">
              <iframe
                src={getEmbedUrl(activeVideo.url)}
                title={activeVideo.title}
                className="video-modal-player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="video-modal-footer">
              <div className="video-watch-progress">
                <div className="video-watch-track">
                  <div
                    className="video-watch-fill"
                    style={{ width: `${Math.min(100, Math.round((activeVideo.watchedSeconds / activeVideo.requiredSeconds) * 100))}%` }}
                  />
                </div>
                <span>
                  {activeVideo.completed
                    ? "Completed"
                    : `Watch ${Math.max(0, activeVideo.requiredSeconds - activeVideo.watchedSeconds)}s more to count progress (keep this tab active)`}
                </span>
              </div>

              <a href={activeVideo.sourceUrl} target="_blank" rel="noreferrer" className="video-source-link">
                Open source video ↗
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CourseDetails;