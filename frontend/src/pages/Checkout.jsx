import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useCourses } from "../context/CourseContext";
import { getDisplayCourseDuration } from "../utils/courseDuration";

const SAVED_CARD_KEY = "checkoutSavedCardDetails";

/* ── helpers ── */
function fmtCard(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits;
}
function fmtCVV(val) {
  return val.replace(/\D/g, "").slice(0, 3);
}

function validate(form) {
  const e = {};
  const digits = form.card.replace(/\s/g, "");
  if (!digits)           e.card   = "Card number is required.";
  else if (digits.length < 16) e.card = "Enter a valid 16-digit card number.";
  if (!form.name.trim()) e.name   = "Cardholder name is required.";
  if (!form.expiry)      e.expiry = "Expiry date is required.";
  else {
    const [mm] = form.expiry.split("/");
    if (form.expiry.length < 5 || parseInt(mm) > 12 || parseInt(mm) < 1)
      e.expiry = "Enter a valid expiry (MM/YY).";
  }
  if (!form.cvv)         e.cvv    = "CVV is required.";
  else if (form.cvv.length < 3) e.cvv = "CVV must be 3 digits.";
  return e;
}

/* ── Step indicators ── */
function Steps({ current }) {
  const steps = ["Course", "Payment", "Confirm"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => {
        const idx    = i + 1;
        const active = idx === current;
        const done   = idx < current;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", border: `2px solid ${done || active ? "var(--amber)" : "var(--border)"}`,
                background: done ? "var(--amber)" : active ? "rgba(245,166,35,0.15)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 700,
                color: done ? "var(--navy)" : active ? "var(--amber)" : "var(--muted)",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : idx}
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                color: active ? "var(--amber)" : done ? "var(--text)" : "var(--muted)" }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "var(--amber)" : "var(--border)", margin: "0 12px", marginBottom: 22, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { enrollCourse, isEnrolled } = useUser();
  const { courses }  = useCourses();

  const course = courses.find((c) => c.id === parseInt(id));

  const [step,    setStep]    = useState(1); // 1=review, 2=payment, 3=success
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ card: "", name: "", expiry: "", cvv: "" });
  const [rememberCard, setRememberCard] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CARD_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setForm({
        card: parsed.card || "",
        name: parsed.name || "",
        expiry: parsed.expiry || "",
      });
      setRememberCard(true);
    } catch {
      localStorage.removeItem(SAVED_CARD_KEY);
    }
  }, []);

  // Course not found
  if (!course) {
    return (
      <div className="checkout-page">
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--white)", marginBottom: 12 }}>Course not found</h2>
          <Link to="/courses"><button className="btn btn-primary">Browse Courses →</button></Link>
        </div>
      </div>
    );
  }

  // Already enrolled — redirect them
  if (isEnrolled(course.id) && step !== 3) {
    return (
      <div className="checkout-page">
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--white)", marginBottom: 12 }}>
            You're already enrolled!
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 28 }}>You already have access to <strong style={{ color: "var(--text)" }}>{course.title}</strong>.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Go to Dashboard →</button>
            <button className="btn btn-secondary" onClick={() => navigate("/courses")}>Browse Courses</button>
          </div>
        </div>
      </div>
    );
  }

  const isFree       = course.price === 0;
  const priceDisplay = `₹${course.price.toLocaleString("en-IN")}`;
  const initials     = course.instructor.split(" ").map((n) => n[0]).join("");
  const displayDuration = getDisplayCourseDuration(course);

  /* ── field helpers ── */
  const update = (key, raw) => {
    let val = raw;
    if (key === "card")   val = fmtCard(raw);
    if (key === "expiry") val = fmtExpiry(raw);
    if (key === "cvv")    val = fmtCVV(raw);
    const next = { ...form, [key]: val };
    setForm(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key) => {
    setTouched((p) => ({ ...p, [key]: true }));
    setErrors(validate(form));
  };

  const inputStyle = (key) => {
    if (!touched[key]) return {};
    return errors[key]
      ? { borderColor: "#e55353", boxShadow: "0 0 0 3px rgba(229,83,83,0.12)" }
      : { borderColor: "#4caf82", boxShadow: "0 0 0 3px rgba(76,175,130,0.12)" };
  };

  /* ── submit payment ── */
  const handlePay = () => {
    if (isFree) {
      // Free course — no form needed, just enroll
      setLoading(true);
      setTimeout(() => { enrollCourse(course.id); setLoading(false); setStep(3); }, 900);
      return;
    }
    setTouched({ card: true, name: true, expiry: true, cvv: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (rememberCard) {
      localStorage.setItem(
        SAVED_CARD_KEY,
        JSON.stringify({
          card: form.card,
          name: form.name,
          expiry: form.expiry,
        })
      );
    } else {
      localStorage.removeItem(SAVED_CARD_KEY);
    }

    setLoading(true);
    setTimeout(() => { enrollCourse(course.id); setLoading(false); setStep(3); }, 1500);
  };

  /* ── STEP 3: Success ── */
  if (step === 3) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div style={{ fontSize: "3.5rem", marginBottom: 16, animation: "fadeUp 0.4s ease both" }}>🎓</div>
          <Steps current={3} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, color: "var(--white)", letterSpacing: "-1px", marginBottom: 12 }}>
            {isFree ? "You're enrolled!" : "Payment Successful!"}
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 8, fontSize: "0.95rem" }}>
            {isFree
              ? "Your free course is ready to start."
              : `₹${course.price.toLocaleString("en-IN")} was charged. Your receipt has been sent to your email.`}
          </p>
          <div style={{
            background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "20px 24px", margin: "28px 0", textAlign: "left",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--navy-light),rgba(245,166,35,0.2))", border: "2px solid var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--amber)", flexShrink: 0 }}>{initials}</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--white)", fontSize: "1rem" }}>{course.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{course.instructor} · {displayDuration}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Go to Dashboard →</button>
            <button className="btn btn-secondary" onClick={() => navigate("/courses")}>Browse More Courses</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-grid">

        {/* ── LEFT: steps + form ── */}
        <div className="checkout-left">
          <Steps current={step} />

          {/* STEP 1: Review */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.35s ease both" }}>
              <div className="page-eyebrow">Step 1</div>
              <h2 className="checkout-heading">Review Your Order</h2>

              <div className="checkout-course-card">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="instructor-avatar-lg">{initials}</div>
                  <div style={{ flex: 1 }}>
                    <span className="card-badge">{course.category}</span>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--white)", fontSize: "1.15rem", marginTop: 8, lineHeight: 1.3 }}>{course.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>by {course.instructor}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>⏱ {displayDuration}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>⭐ {course.rating}</span>
                  <span className={`card-difficulty card-difficulty-${course.difficulty?.toLowerCase()}`}>{course.difficulty}</span>
                </div>
              </div>

              <div className="checkout-summary">
                <div className="checkout-summary-row">
                  <span>Course Price</span>
                  <span>{isFree ? <span style={{ color: "#4caf82", fontWeight: 700 }}>FREE</span> : priceDisplay}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Tax</span>
                  <span>{isFree ? "—" : "Included"}</span>
                </div>
                <div className="checkout-summary-divider" />
                <div className="checkout-summary-row checkout-summary-total">
                  <span>Total</span>
                  <span>{isFree ? <span style={{ color: "#4caf82" }}>₹0</span> : priceDisplay}</span>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 8 }}
                onClick={() => setStep(2)}>
                {isFree ? "Enroll for Free →" : "Proceed to Payment →"}
              </button>
              <Link to={`/course/${course.id}`}>
                <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 10 }}>
                  ← Back to Course
                </button>
              </Link>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.35s ease both" }}>
              <div className="page-eyebrow">Step 2</div>
              <h2 className="checkout-heading">
                {isFree ? "Confirm Enrollment" : "Payment Details"}
              </h2>

              {isFree ? (
                <div style={{ padding: "24px", background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: 24 }}>
                  <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    This course is <strong style={{ color: "#4caf82" }}>completely free</strong>. Click below to get instant access.
                  </p>
                </div>
              ) : (
                <>
                  {/* Card number */}
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" value={form.card}
                      onChange={(e) => update("card", e.target.value)} onBlur={() => blur("card")} style={inputStyle("card")} />
                    {touched.card && errors.card && <span className="field-error">⚠ {errors.card}</span>}
                    {touched.card && !errors.card && form.card && <span className="field-success">✓ Valid card number</span>}
                  </div>

                  {/* Cardholder name */}
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="Jane Doe" value={form.name}
                      onChange={(e) => update("name", e.target.value)} onBlur={() => blur("name")} style={inputStyle("name")} />
                    {touched.name && errors.name && <span className="field-error">⚠ {errors.name}</span>}
                    {touched.name && !errors.name && form.name && <span className="field-success">✓ Looks good</span>}
                  </div>

                  {/* Expiry + CVV */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" value={form.expiry}
                        onChange={(e) => update("expiry", e.target.value)} onBlur={() => blur("expiry")} style={inputStyle("expiry")} />
                      {touched.expiry && errors.expiry && <span className="field-error">⚠ {errors.expiry}</span>}
                      {touched.expiry && !errors.expiry && form.expiry && <span className="field-success">✓</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>CVV</label>
                      <input type="password" placeholder="•••" value={form.cvv}
                        onChange={(e) => update("cvv", e.target.value)} onBlur={() => blur("cvv")} style={inputStyle("cvv")} />
                      {touched.cvv && errors.cvv && <span className="field-error">⚠ {errors.cvv}</span>}
                      {touched.cvv && !errors.cvv && form.cvv && <span className="field-success">✓</span>}
                    </div>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "var(--muted)", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={rememberCard}
                      onChange={(e) => setRememberCard(e.target.checked)}
                      style={{ accentColor: "var(--amber)", cursor: "pointer" }}
                    />
                    Remember card details for future purchases
                  </label>

                  {/* Security note */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 14px", background: "rgba(76,175,130,0.08)", border: "1px solid rgba(76,175,130,0.2)", borderRadius: 8 }}>
                    <span style={{ fontSize: "1rem" }}>🔒</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Your payment info is encrypted and secure. This is a mock checkout. CVV is never saved.</span>
                  </div>
                </>
              )}

              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 20, opacity: loading ? 0.7 : 1 }}
                onClick={handlePay} disabled={loading}>
                {loading ? "Processing…" : isFree ? "Confirm & Enroll →" : `Pay ${priceDisplay} →`}
              </button>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 10 }}
                onClick={() => setStep(1)}>
                ← Back to Review
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: order summary sidebar ── */}
        <div className="checkout-sidebar">
          <div className="enroll-card">
            <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
              Order Summary
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--white)", fontSize: "1.1rem", lineHeight: 1.3, marginBottom: 8 }}>
              {course.title}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 16 }}>by {course.instructor}</div>

            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span>Price</span>
                <span>{isFree ? <span style={{ color: "#4caf82", fontWeight: 700 }}>FREE</span> : priceDisplay}</span>
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span style={{ color: isFree ? "#4caf82" : "var(--amber)" }}>
                  {isFree ? "₹0" : priceDisplay}
                </span>
              </div>
            </div>

            <ul className="enroll-features" style={{ marginTop: 8 }}>
              <li>{displayDuration} on-demand video</li>
              <li>Certificate of completion</li>
              <li>Full lifetime access</li>
              <li>Mobile & desktop access</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}