import { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      { q: "Is EduPlatform free to use?",             a: "Yes! All courses on EduPlatform are completely free. Create an account and start learning immediately — no credit card required." },
      { q: "Do I need any prior experience?",       a: "Not at all. We have courses for every skill level — from absolute beginners to seasoned developers looking to level up." },
      { q: "How do I create an account?",           a: "Click 'Get Started' on the homepage or visit /register. Fill in your name, email, and a password and you're good to go." },
    ],
  },
  {
    category: "Courses",
    items: [
      { q: "How long do I have access to a course?",    a: "Lifetime access. Once enrolled, the course is yours forever — including any future updates to the content." },
      { q: "Can I download course materials?",          a: "Yes. Most courses include downloadable resources such as code files, cheat sheets, and project templates." },
      { q: "What if I don't like a course?",            a: "We're constantly improving. Use the feedback form on any course page to let us know and we'll make it right." },
    ],
  },
  {
    category: "Certificates",
    items: [
      { q: "Do I get a certificate on completion?",     a: "Absolutely. Every course awards a verifiable certificate of completion that you can share on LinkedIn or attach to your CV." },
      { q: "Are the certificates recognised by employers?", a: "Our certificates are valued by a growing list of partner companies. More importantly, the skills you build speak for themselves." },
    ],
  },
  {
    category: "Technical",
    items: [
      { q: "What devices are supported?",            a: "EduPlatform works on any modern browser — desktop, tablet, and mobile. Our platform is fully responsive." },
      { q: "I'm having trouble logging in. Help?",   a: "Try resetting your password via the login page. If the issue persists, contact us at hello@EduPlatform.dev." },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{q}</span>
        <span className="faq-chevron">{open ? "−" : "+"}</span>
      </div>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

export default function FAQ() {
  const { siteName, supportEmail } = useSiteSettings();

  return (
    <div className="faq-page">
      <div className="page-header" style={{ textAlign: "center", marginBottom: 60 }}>
        <div className="page-eyebrow" style={{ justifyContent: "center" }}>Support</div>
        <h2>Frequently Asked Questions</h2>
        <p style={{ maxWidth: 500, margin: "12px auto 0" }}>
          Can't find your answer on {siteName}? <Link to="/contact" style={{ color: "var(--amber)", fontWeight: 500 }}>Reach out to us →</Link>
        </p>
      </div>

      <div className="faq-content">
        {FAQS.map((section) => (
          <div className="faq-section" key={section.category}>
            <h3 className="faq-category">{section.category}</h3>
            <div className="faq-list">
              {section.items.map((item) => <FAQItem key={item.q} {...item} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help CTA */}
      <div className="about-cta" style={{ marginTop: 60 }}>
        <h2>Still have questions?</h2>
        <p>Our team is happy to help at {supportEmail} — we usually reply within a few hours.</p>
        <Link to="/contact"><button className="btn btn-primary">Contact Us →</button></Link>
      </div>
    </div>
  );
}