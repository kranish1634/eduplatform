import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, admin, loading: adminLoading } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminLoading || !admin) return;
    navigate("/admin/dashboard", { replace: true });
  }, [admin, adminLoading, navigate]);

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Sign in to manage your platform</p>

          {error && (
            <div className="admin-alert admin-alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-group">
              <label className="admin-label">Email</label>
              <input
                type="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduplatform.com"
                required
                disabled={loading}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Password</label>
              <input
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary admin-btn-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="admin-footer">
            <p>Not an admin? <Link to="/">Back to Home</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
