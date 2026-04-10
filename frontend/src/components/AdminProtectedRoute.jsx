import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
