import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields) {
  const errors = {};
  if (!fields.name.trim())  errors.name = "Full name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(fields.email)) errors.email = "Enter a valid email address.";
  if (!fields.password)     errors.password = "Password is required.";
  else if (fields.password.length < 8)   errors.password = "Must be at least 8 characters.";
  else if (!/[A-Z]/.test(fields.password)) errors.password = "Must include an uppercase letter.";
  else if (!/[0-9]/.test(fields.password)) errors.password = "Must include a number.";
  if (!fields.confirm)      errors.confirm = "Please confirm your password.";
  else if (fields.confirm !== fields.password) errors.confirm = "Passwords do not match.";
  return errors;
}

function getStrength(p) {
  let s = 0;
  if (p.length >= 8)          s++;
  if (/[A-Z]/.test(p))        s++;
  if (/[0-9]/.test(p))        s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function Register() {
  const navigate    = useNavigate();
  const { register } = useUser();
  const { siteName } = useSiteSettings();

  const [fields,      setFields]      = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,      setErrors]      = useState({});
  const [touched,     setTouched]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (key, value) => {
    const next = { ...fields, [key]: value };
    setFields(next);
    if (touched[key]) setErrors(validate(next));
    setServerError("");
  };

  const handleBlur = (key) => {
    setTouched((p) => ({ ...p, [key]: true }));
    setErrors(validate(fields));
  };

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, password: true, confirm: true });
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      await register(fields.name, fields.email, fields.password);
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (key) => {
    if (!touched[key]) return {};
    return errors[key]
      ? { borderColor: "#e55353", boxShadow: "0 0 0 3px rgba(229,83,83,0.12)" }
      : { borderColor: "#4caf82", boxShadow: "0 0 0 3px rgba(76,175,130,0.12)" };
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "16px" }}>🎓</div>
          <h2>Account Created!</h2>
          <p className="subtitle" style={{ marginBottom: "28px" }}>Welcome to {siteName}. Start exploring courses.</p>
          <Link to="/dashboard"><button className="btn btn-primary btn-full">Go to Dashboard →</button></Link>
        </div>
      </div>
    );
  }

  const strength = getStrength(fields.password);
  const strengthColors = ["", "#e55353", "#f5a623", "#4caf82", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="login-brand">{siteName}</div>
        <h2>Create account</h2>
        <p className="subtitle">Join thousands of learners today.</p>

        {/* Server error */}
        {serverError && (
          <div style={{
            padding: "12px 16px", borderRadius: 8, marginBottom: 16,
            background: "rgba(229,83,83,0.1)", border: "1px solid rgba(229,83,83,0.3)",
            color: "#e55353", fontSize: "0.875rem",
          }}>
            ⚠ {serverError}
          </div>
        )}

        {[
          { key: "name",     label: "Full Name",        type: "text",     placeholder: "Jane Doe" },
          { key: "email",    label: "Email",            type: "email",    placeholder: "you@example.com" },
          { key: "password", label: "Password",         type: "password", placeholder: "Min. 8 chars, 1 uppercase, 1 number" },
          { key: "confirm",  label: "Confirm Password", type: "password", placeholder: "Re-enter your password" },
        ].map(({ key, label, type, placeholder }) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={fields[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              style={inputStyle(key)}
            />
            {key === "password" && fields.password && (
              <div className="strength-bar-wrap">
                <div className="strength-bar-track">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="strength-segment"
                      style={{ background: i <= strength ? strengthColors[strength] : "var(--border)", transition: "background 0.3s" }} />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
            {touched[key] && errors[key]  && <span className="field-error">⚠ {errors[key]}</span>}
            {touched[key] && !errors[key] && fields[key] && <span className="field-success">✓ Looks good</span>}
          </div>
        ))}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: "12px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating account…" : "Create Account →"}
        </button>
        <p className="form-footer">Already have an account? <Link to="/login">Sign in →</Link></p>
      </div>
    </div>
  );
}