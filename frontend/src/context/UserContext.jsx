import { createContext, useState, useContext, useEffect } from "react";
import { isTokenExpired } from "../utils/jwt";
import { authFetch } from "../utils/authFetch";
import { API_BASE_URL } from "../config/api";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenKey = "token";

  // ── Restore session from localStorage token on page reload ───────
  useEffect(() => {
    localStorage.removeItem(tokenKey);
    const token = sessionStorage.getItem(tokenKey);

    // No token or already expired — start logged out immediately
    if (!token || isTokenExpired(token)) {
      sessionStorage.removeItem(tokenKey);
      setLoading(false);
      return;
    }

    authFetch(`${API_BASE_URL}/auth/me`, {
      token,
      onUnauthorized: () => {
        sessionStorage.removeItem(tokenKey);
        setUser(null);
      },
    })
      .then(({ response, data }) => {
        if (response.ok && data) {
          setUser(data);
          return;
        }

        sessionStorage.removeItem(tokenKey);
        setUser(null);
      })
      .catch(() => {
        sessionStorage.removeItem(tokenKey);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ──────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res  = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    sessionStorage.setItem(tokenKey, data.token);
    setUser(data.user);
  };

  // ── Login ─────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res  = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    sessionStorage.setItem(tokenKey, data.token);
    setUser(data.user);
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.removeItem(tokenKey);
    setUser(null);
  };

  // ── Enroll in a course (stored inside users document) ─────────────
  const enrollCourse = async (courseId) => {
    const token = sessionStorage.getItem(tokenKey);
    const { response, data } = await authFetch(`${API_BASE_URL}/users/enroll/${courseId}`, {
      method: "POST",
      token,
      onUnauthorized: () => {
        sessionStorage.removeItem(tokenKey);
        setUser(null);
      },
    });
    if (response.ok && data.user) {
      setUser(data.user); // replace entire user with updated doc from server
    }
  };

  // ── Update course progress ────────────────────────────────────────
  const updateProgress = async (courseId, progress) => {
    const token = sessionStorage.getItem(tokenKey);
    const { response, data } = await authFetch(`${API_BASE_URL}/users/progress/${courseId}`, {
      method: "PUT",
      token,
      onUnauthorized: () => {
        sessionStorage.removeItem(tokenKey);
        setUser(null);
      },
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ progress }),
    });
    if (response.ok) setUser(data);
  };

  // ── Update profile (name, email, bio, location, website) ─────────
  const updateProfile = async (fields) => {
    const token = sessionStorage.getItem(tokenKey);
    const { response, data } = await authFetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      token,
      onUnauthorized: () => {
        sessionStorage.removeItem(tokenKey);
        setUser(null);
      },
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fields),
    });
    if (!response.ok) throw new Error(data?.message || "Request failed.");
    setUser(data);
  };

  const recordActivity = async ({ type, courseId, title, detail, progress }) => {
    const token = sessionStorage.getItem(tokenKey);
    if (!token) return null;

    const { response, data } = await authFetch(`${API_BASE_URL}/users/activity`, {
      method: "POST",
      token,
      onUnauthorized: () => {
        sessionStorage.removeItem(tokenKey);
        setUser(null);
      },
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, courseId, title, detail, progress }),
    });
    if (response.ok && data.user) setUser(data.user);
    return data;
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const isEnrolled = (courseId) =>
    !!user?.courses?.find((c) => c.courseId === courseId);

  const getProgress = (courseId) =>
    user?.courses?.find((c) => c.courseId === courseId)?.progress ?? 0;

  // enrolledCourses — flat array of courseIds, kept for backward compat
  const enrolledCourses = user?.courses?.map((c) => c.courseId) ?? [];

  return (
    <UserContext.Provider value={{
      user,
      loading,
      enrolledCourses,
      login,
      register,
      logout,
      enrollCourse,
      updateProgress,
      updateProfile,
      recordActivity,
      isEnrolled,
      getProgress,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}