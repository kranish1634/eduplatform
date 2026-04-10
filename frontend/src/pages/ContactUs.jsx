import { useState } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { API_BASE_URL } from "../config/api";

function validate(f) {
  const e = {};
  if (!f.name.trim())    e.name    = "Name is required.";
  if (!f.email.trim())   e.email   = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email.";
  if (!f.subject.trim()) e.subject = "Subject is required.";
  if (!f.message.trim()) e.message = "Message is required.";
  else if (f.message.trim().length < 20) e.message = "Message must be at least 20 characters.";
  return e;
}

export default function ContactUs() {
  const { siteName, supportEmail } = useSiteSettings();
  const [form,    setForm]    = useState({ name: "", email: "", subject: "", message: "" });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key) => {
    setTouched((p) => ({ ...p, [key]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = () => {
    setTouched({ name: true, email: true, subject: true, message: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setServerError("");

    fetch(`${API_BASE_URL}/messages/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) {
          throw new Error(data.message || "Could not send message.");
        }

        setSent(true);
        setForm({ name: "", email: "", subject: "", message: "" });
        setTouched({});
      })
      .catch((error) => {
        setServerError(error.message || "Could not send message.");
      })
      .finally(() => setLoading(false));
  };

  const inputStyle = (key) => {
    if (!touched[key]) return {};
    return errors[key]
      ? { borderColor: "#e55353", boxShadow: "0 0 0 3px rgba(229,83,83,0.12)" }
      : { borderColor: "#4caf82", boxShadow: "0 0 0 3px rgba(76,175,130,0.12)" };
  };

  if (sent) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>📬</div>
          <h2>Message Sent!</h2>
          <p className="subtitle" style={{ marginBottom: 28 }}>We'll get back to you within 24 hours.</p>
          <button className="btn btn-primary btn-full" onClick={() => { setSent(false); setForm({ name:"",email:"",subject:"",message:"" }); setTouched({}); }}>
            Send Another →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="contact-grid">

        {/* Left info */}
        <div className="contact-info">
          <div className="page-eyebrow">Get in Touch</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "var(--white)", letterSpacing: "-1px", lineHeight: 1.15, margin: "12px 0 20px" }}>
            We'd love to<br /><em style={{ fontStyle: "italic", color: "var(--amber)" }}>hear from you at {siteName}.</em>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 40 }}>
            Have a question about a course, need technical help, or just want to say hello?
            Our team responds within 24 hours.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: "📧", label: "Email",    val: supportEmail  },
              { icon: "💬", label: "Discord",  val: `discord.gg/${siteName}` },
              { icon: "📍", label: "Location", val: "Ahmedabad, India"    },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", marginTop: 2 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 2 }}>{label}</div>
                  <div style={{ color: "var(--text)", fontSize: "0.9rem" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="login-card" style={{ position: "static", animation: "fadeUp 0.5s ease both" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--white)", marginBottom: 24 }}>Send a Message</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { key: "name",  label: "Your Name", type: "text",  placeholder: "Jane Doe",           colSpan: 1 },
              { key: "email", label: "Email",      type: "email", placeholder: "you@example.com",    colSpan: 1 },
            ].map(({ key, label, type, placeholder }) => (
              <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                <label>{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={(e) => update(key, e.target.value)} onBlur={() => blur(key)} style={inputStyle(key)} />
                {touched[key] && errors[key] && <span className="field-error">⚠ {errors[key]}</span>}
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Subject</label>
            <input type="text" placeholder="How can we help?" value={form.subject}
              onChange={(e) => update("subject", e.target.value)} onBlur={() => blur("subject")} style={inputStyle("subject")} />
            {touched.subject && errors.subject && <span className="field-error">⚠ {errors.subject}</span>}
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea rows={5} placeholder="Tell us more…" value={form.message}
              onChange={(e) => update("message", e.target.value)} onBlur={() => blur("message")}
              style={{ width: "100%", padding: "12px 16px", background: "var(--navy-light)", border: `1px solid ${touched.message && errors.message ? "#e55353" : touched.message && !errors.message && form.message ? "#4caf82" : "var(--border)"}`, borderRadius: 8, color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", outline: "none", resize: "vertical", transition: "border-color 0.2s" }}
            />
            {touched.message && errors.message && <span className="field-error">⚠ {errors.message}</span>}
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{form.message.length} / 20 min chars</span>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Sending…" : "Send Message →"}
          </button>
        </div>

        {serverError && (
          <div style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 8,
            background: "rgba(229,83,83,0.1)",
            border: "1px solid rgba(229,83,83,0.3)",
            color: "#e55353",
            fontSize: "0.875rem",
          }}>
            ⚠ {serverError}
          </div>
        )}
      </div>
    </div>
  );
}