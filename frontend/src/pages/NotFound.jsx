import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NotFound() {
  const navigate  = useNavigate();
  const [count, setCount] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(timer); navigate("/"); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h2>Page not found</h2>
        <p>Looks like this page took the day off. Don't worry — the good stuff is still here.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
          <Link to="/"><button className="btn btn-primary">Back to Home →</button></Link>
          <Link to="/courses"><button className="btn btn-secondary">Browse Courses</button></Link>
        </div>
        <p style={{ marginTop: 32, fontSize: "0.82rem", color: "var(--border)" }}>
          Redirecting to home in <span style={{ color: "var(--amber)", fontWeight: 700 }}>{count}s</span>…
        </p>
      </div>
    </div>
  );
}