import { useState, useMemo } from "react";
import { useCourses } from "../context/CourseContext";
import CourseCard from "../components/CourseCard";

const CATEGORIES   = ["All", "Frontend", "JavaScript", "Full Stack", "Backend", "Database", "DevOps", "DSA"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const PRICING      = ["All", "Free", "Paid"];
const SORT_OPTIONS = ["Most Popular", "Highest Rated", "Price: Low to High", "Price: High to Low"];

export default function Courses() {
  const { courses } = useCourses();
  const [query,      setQuery]      = useState("");
  const [category,   setCategory]   = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [pricing,    setPricing]    = useState("All");
  const [sort,       setSort]       = useState("Most Popular");

  const parseStudents = (s = "") => {
    if (!s) return 0;
    const str = String(s);
    const n   = parseFloat(str.replace(/k/i, ""));
    return isNaN(n) ? 0 : n * (str.toLowerCase().includes("k") ? 1000 : 1);
  };

  const filtered = useMemo(() => {
    let list = courses.filter((c) => {
      const matchQuery   = c.title.toLowerCase().includes(query.toLowerCase()) ||
                           c.instructor.toLowerCase().includes(query.toLowerCase());
      const matchCat     = category   === "All" || c.category   === category;
      const matchDiff    = difficulty === "All" || c.difficulty === difficulty;
      const matchPricing = pricing    === "All" ||
                           (pricing   === "Free" && c.price === 0) ||
                           (pricing   === "Paid" && c.price > 0);
      return matchQuery && matchCat && matchDiff && matchPricing;
    });

    if (sort === "Highest Rated")       list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    if (sort === "Most Popular")        list = [...list].sort((a, b) => parseStudents(b.students) - parseStudents(a.students));
    if (sort === "Price: Low to High")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low")  list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [query, category, difficulty, pricing, sort, courses]);

  const clearAll = () => {
    setQuery("");
    setCategory("All");
    setDifficulty("All");
    setPricing("All");
    setSort("Most Popular");
  };

  const hasFilters = query || category !== "All" || difficulty !== "All" || pricing !== "All";

  return (
    <div className="courses-page">
      <div className="page-header">
        <div className="page-eyebrow">Search</div>
        <h2>Find Your Course</h2>
        <p>Browse {courses.length} courses across categories and skill levels.</p>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by course name or instructor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery("")}>✕</button>
        )}
      </div>

      {/* Filters row */}
      <div className="filter-row">

        {/* Category */}
        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="filter-chips">
            {CATEGORIES.map((c) => (
              <button key={c} className={`chip ${category === c ? "chip-active" : ""}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="filter-group">
          <span className="filter-label">Level</span>
          <div className="filter-chips">
            {DIFFICULTIES.map((d) => (
              <button key={d} className={`chip ${difficulty === d ? "chip-active" : ""}`} onClick={() => setDifficulty(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Free / Paid */}
        <div className="filter-group">
          <span className="filter-label">Pricing</span>
          <div className="filter-chips">
            {PRICING.map((p) => (
              <button
                key={p}
                className={`chip ${pricing === p ? "chip-active" : ""} ${p === "Free" ? "chip-free" : ""} ${p === "Paid" ? "chip-paid" : ""}`}
                onClick={() => setPricing(p)}
              >
                {p === "Free" ? "🎁 Free" : p === "Paid" ? "💳 Paid" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="filter-group" style={{ marginLeft: "auto" }}>
          <span className="filter-label">Sort by</span>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

      </div>

      {/* Results bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          {filtered.length === 0
            ? "No courses found."
            : `Showing ${filtered.length} of ${courses.length} courses`}
        </p>
        {hasFilters && (
          <button className="btn btn-secondary" style={{ fontSize: "0.78rem", padding: "6px 14px" }} onClick={clearAll}>
            Clear all filters ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid">
          {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔎</div>
          <h3 style={{ color: "var(--white)", fontFamily: "'Playfair Display', serif" }}>No results found</h3>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>Try adjusting your search or filters.</p>
          <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={clearAll}>Clear Filters</button>
        </div>
      )}
    </div>
  );
}