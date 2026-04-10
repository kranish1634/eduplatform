import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email, password) {
  const errors = {};
  if (!email.trim())               errors.email    = "Email is required.";
  else if (!EMAIL_REGEX.test(email)) errors.email  = "Enter a valid email address.";
  if (!password)                   errors.password = "Password is required.";
  else if (password.length < 8)    errors.password = "Password must be at least 8 characters.";
  else if (!/[A-Z]/.test(password)) errors.password = "Must contain at least one uppercase letter.";
  else if (!/[0-9]/.test(password)) errors.password = "Must contain at least one number.";
  return errors;
}

export default function Login() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { login, user, loading: userLoading } = useUser();
  const { siteName }    = useSiteSettings();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [serverError, setServerError] = useState("");

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleBlur = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validate(email, password));
  };

  const handleChange = (field, value) => {
    const nextEmail    = field === "email"    ? value : email;
    const nextPassword = field === "password" ? value : password;
    if (field === "email")    setEmail(value);
    if (field === "password") setPassword(value);
    if (touched[field]) setErrors(validate(nextEmail, nextPassword));
    setServerError(""); // clear server error on any change
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      await login(email, password);
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => {
    if (!touched[field]) return {};
    return errors[field]
      ? { borderColor: "#e55353", boxShadow: "0 0 0 3px rgba(229,83,83,0.12)" }
      : { borderColor: "#4caf82", boxShadow: "0 0 0 3px rgba(76,175,130,0.12)" };
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate(redirectTo, { replace: true }), 1500);
    return () => clearTimeout(t);
  }, [success, navigate, redirectTo]);

  useEffect(() => {
    if (userLoading || !user) return;
    navigate(redirectTo, { replace: true });
  }, [user, userLoading, navigate, redirectTo]);

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "16px" }}>🎉</div>
          <h2>You're in!</h2>
          <p className="subtitle" style={{ marginBottom: "28px" }}>Welcome back to {siteName}.</p>
          <button className="btn btn-primary btn-full" onClick={() => navigate(redirectTo, { replace: true })}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">{siteName}</div>
        <h2>Welcome back</h2>
        {redirectTo.startsWith("/checkout") ? (
          <p className="subtitle">Sign in to complete your purchase.</p>
        ) : (
          <p className="subtitle">Sign in to continue learning.</p>
        )}

        {/* Server-level error */}
        {serverError && (
          <div style={{
            padding: "12px 16px", borderRadius: 8, marginBottom: 16,
            background: "rgba(229,83,83,0.1)", border: "1px solid rgba(229,83,83,0.3)",
            color: "#e55353", fontSize: "0.875rem",
          }}>
            ⚠ {serverError}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" placeholder="you@example.com"
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            style={inputStyle("email")}
          />
          {touched.email && errors.email  && <span className="field-error">⚠ {errors.email}</span>}
          {touched.email && !errors.email && email && <span className="field-success">✓ Looks good</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" placeholder="Min. 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            style={inputStyle("password")}
          />
          {touched.password && errors.password  && <span className="field-error">⚠ {errors.password}</span>}
          {touched.password && !errors.password && password && <span className="field-success">✓ Strong password</span>}
        </div>

        <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "8px" }}>
          <Link to="/contact" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Forgot password?</Link>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: "12px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: 16, padding: "10px 14px", borderRadius: 8,
          background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
          fontSize: "0.8rem", color: "var(--muted)", textAlign: "center",
        }}>
          Demo: <strong style={{ color: "var(--amber)" }}>demo@eduplatform.dev</strong> / <strong style={{ color: "var(--amber)" }}>Demo@1234</strong>
        </div>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}