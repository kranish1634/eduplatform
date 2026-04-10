import { createContext, useState, useContext, useEffect } from "react";
import { isTokenExpired } from "../utils/jwt";
import { authFetch } from "../utils/authFetch";
import { API_BASE_URL } from "../config/api";

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenKey = "adminToken";

  // ── Restore session from localStorage token on page reload ───────
  useEffect(() => {
    localStorage.removeItem(tokenKey);
    const savedToken = sessionStorage.getItem(tokenKey);

    // No token or already expired — start logged out immediately
    if (!savedToken || isTokenExpired(savedToken)) {
      sessionStorage.removeItem(tokenKey);
      setLoading(false);
      return;
    }

    setToken(savedToken);

    authFetch(`${API_BASE_URL}/admin/me`, {
      token: savedToken,
      onUnauthorized: () => {
        sessionStorage.removeItem(tokenKey);
        setToken(null);
        setAdmin(null);
      },
    })
      .then(({ response, data }) => {
        if (response.ok && data) {
          setAdmin(data);
          return;
        }

        sessionStorage.removeItem(tokenKey);
        setToken(null);
        setAdmin(null);
      })
      .catch(() => {
        sessionStorage.removeItem(tokenKey);
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Admin Login ────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    sessionStorage.setItem(tokenKey, data.token);
    setToken(data.token);
    setAdmin(data.admin);
  };

  // ── Admin Logout ───────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.removeItem(tokenKey);
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
