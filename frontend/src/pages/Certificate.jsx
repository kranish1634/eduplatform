import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useUser } from "../context/UserContext";
import { useCourses } from "../context/CourseContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

function formatDate(dateValue) {
  const date = new Date(dateValue || Date.now());
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, recordActivity } = useUser();
  const { courses } = useCourses();
  const { siteName } = useSiteSettings();
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const courseId = Number.parseInt(id, 10);
  const course = courses.find((c) => c.id === courseId);
  const enrollment = user?.courses?.find((c) => c.courseId === courseId);
  const progress = enrollment?.progress ?? 0;
  const canViewCertificate = !!user && !!course && progress === 100;

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageProps = pdf.getImageProperties(imageData);
      const ratio = Math.min(pageWidth / imageProps.width, pageHeight / imageProps.height);
      const imageWidth = imageProps.width * ratio;
      const imageHeight = imageProps.height * ratio;
      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

      pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

      const safeCourseName = (course?.title || "course")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      pdf.save(`${safeCourseName || "course"}-certificate.pdf`);
    } catch {
      window.alert("Unable to download PDF right now. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!canViewCertificate || !recordActivity || !course) return;
    const activityPromise = recordActivity({
      type: "completed",
      courseId: course.id,
      title: course.title,
      detail: "Viewed completion certificate.",
      progress: 100,
    });
    activityPromise?.catch(() => {});
  }, [canViewCertificate, course, recordActivity]);

  if (!course) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: "center", padding: "72px 24px" }}>
          <h2 className="section-title" style={{ marginBottom: 10 }}>Course not found</h2>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>This certificate does not match any existing course.</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!canViewCertificate) {
    return (
      <div className="dashboard-page">
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
          <div className="dashboard-stat-card" style={{ padding: 28 }}>
            <h2 className="section-title" style={{ marginBottom: 10 }}>Certificate Locked</h2>
            <p style={{ color: "var(--muted)", marginBottom: 18 }}>
              Complete the course to 100% progress to unlock your certificate.
            </p>
            <div style={{ marginBottom: 18, color: "var(--text)", fontWeight: 600 }}>
              Current progress: {progress}%
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => navigate(`/course/${course.id}`)}>
                Continue Course →
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page certificate-page">
      <div className="certificate-page-shell" style={{ maxWidth: 980, margin: "0 auto", width: "100%" }}>
        <div className="certificate-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="page-eyebrow">Certificate</div>
            <h2 className="section-title">Course Completion Certificate</h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? "Preparing PDF..." : "Download PDF"}
            </button>
            <Link to="/dashboard" className="btn btn-primary">Done</Link>
          </div>
        </div>

        <div ref={certificateRef} className="dashboard-stat-card certificate-sheet" style={{ padding: 0, overflow: "hidden" }}>
          <div className="certificate-sheet-header" style={{
            padding: "36px 30px",
            borderBottom: "1px solid var(--border)",
            background: "linear-gradient(130deg, rgba(245,166,35,0.14), rgba(22,28,39,0.9) 52%, rgba(13,17,23,1))",
          }}>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", fontWeight: 700 }}>
              {siteName}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", marginTop: 10, color: "var(--white)" }}>
              Certificate of Achievement
            </h3>
            <p style={{ color: "var(--muted)", marginTop: 10 }}>
              This certifies that the learner below has successfully completed the course requirements.
            </p>
          </div>

          <div className="certificate-sheet-body" style={{ padding: "34px 30px" }}>
            <p style={{ color: "var(--muted)", marginBottom: 10 }}>Awarded to</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--white)", fontSize: "2.2rem", lineHeight: 1.2, marginBottom: 20 }}>
              {user?.name || "Learner"}
            </h1>

            <p style={{ color: "var(--muted)", marginBottom: 10 }}>For completing</p>
            <h2 style={{ color: "var(--amber)", fontSize: "1.35rem", marginBottom: 24 }}>{course.title}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <div>
                <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Completion Date</div>
                <div style={{ color: "var(--text)", marginTop: 4 }}>{formatDate(Date.now())}</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Enrollment Date</div>
                <div style={{ color: "var(--text)", marginTop: 4 }}>{formatDate(enrollment?.enrolledAt)}</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Final Progress</div>
                <div style={{ color: "#4caf82", marginTop: 4, fontWeight: 700 }}>100%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
