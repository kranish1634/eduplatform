import { createContext, useState, useContext, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

export const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();
      setCourses(data);
      setError(null);
      return data;
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
      throw err;
    }
  };

  // ── Fetch all courses on mount ───────────────────
  useEffect(() => {
    refreshCourses()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CourseContext.Provider value={{ courses, setCourses, loading, error, refreshCourses }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}
