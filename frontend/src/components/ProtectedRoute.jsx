import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * Wrap any route that requires login.
 * - While session is restoring (loading = true) → show a spinner
 * - If logged out → redirect to /login?redirect=<current path>
 * - If logged in  → render children normally
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  const location          = useLocation();

  // Still checking token — don't flash the login page
  if (loading) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--amber)",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}