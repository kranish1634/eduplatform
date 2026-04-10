import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Component } from "react";
import ScrollToTop    from "./components/ScrollToTop";
import Navbar         from "./components/Navbar";
import Footer         from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Home           from "./pages/Home";
import Courses        from "./pages/Courses";
import CourseDetails  from "./pages/CourseDetails";
import Checkout       from "./pages/Checkout";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import Certificate    from "./pages/Certificate";
import Profile        from "./pages/Profile";
import AboutUs        from "./pages/AboutUs";
import ContactUs      from "./pages/ContactUs";
import FAQ            from "./pages/FAQ";
import NotFound       from "./pages/NotFound";
import AdminLogin     from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

/* ── Error Boundary — prevents a single page crash from white-screening the app ── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "60vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "60px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--white)", marginBottom: 12 }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 28, maxWidth: 400 }}>
            An unexpected error occurred on this page. Try refreshing or navigating home.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
            >
              Go Home →
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/"           element={<Home />} />
          <Route path="/courses"    element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/about"      element={<AboutUs />} />
          <Route path="/contact"    element={<ContactUs />} />
          <Route path="/faq"        element={<FAQ />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
          } />

          {/* Protected routes — require login */}
          <Route path="/checkout/:id" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/certificate/:id" element={
            <ProtectedRoute><Certificate /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;