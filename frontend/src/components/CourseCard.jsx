import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getDisplayCourseDuration } from "../utils/courseDuration";

function CourseCard({ course }) {
  const navigate = useNavigate();
  const { recordActivity } = useUser();

  const initials = course.instructor
    .split(" ")
    .map((n) => n[0])
    .join("");

  const isFree = course.price === 0;
  const courseDuration = getDisplayCourseDuration(course);

  return (
    <div className="card">
      {/* Thumbnail */}
      {course.thumbnail && (
        <div className="card-thumbnail">
          <img src={course.thumbnail} alt={course.title} />
          <div className="card-thumbnail-overlay" />
          <span className={`card-price-tag card-price-tag-overlay ${isFree ? "card-price-free" : "card-price-paid"}`}>
            {isFree ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
          </span>
        </div>
      )}

      <div className="card-body">
        <div className="card-top-row">
          <span className="card-badge">{course.category || "Development"}</span>
          {!course.thumbnail && (
            <span className={`card-price-tag ${isFree ? "card-price-free" : "card-price-paid"}`}>
              {isFree ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
            </span>
          )}
        </div>

        <h3>{course.title}</h3>

        {course.description && (
          <p className="card-description">{course.description}</p>
        )}

        <div className="card-instructor">
          {course.instructorAvatar ? (
            <img
              src={course.instructorAvatar}
              alt={course.instructor}
              className="instructor-avatar instructor-avatar-img"
            />
          ) : (
            <div className="instructor-avatar">{initials}</div>
          )}
          <span>{course.instructor}</span>
        </div>

        <div className="card-meta">
          <span>⏱ {courseDuration || "8h 30m"}</span>
          <span>⭐ {course.rating || "4.8"}</span>
          <span>👥 {course.students || "1.2k"}</span>
        </div>

        {course.difficulty && (
          <span className={`card-difficulty card-difficulty-${course.difficulty?.toLowerCase()}`}>
            {course.difficulty}
          </span>
        )}

        <button
          className="btn btn-primary"
          onClick={() => {
            const activityPromise = recordActivity?.({
              type: "viewed",
              courseId: course.id,
              title: course.title,
              detail: `Opened course from catalog: ${course.title}.`,
            });
            activityPromise?.catch(() => {});
            navigate(`/course/${course.id}`);
          }}
          style={{ marginTop: "auto", justifyContent: "center", width: "100%" }}
        >
          View Course →
        </button>
      </div>
    </div>
  );
}

export default CourseCard;