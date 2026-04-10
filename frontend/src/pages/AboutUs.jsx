import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext";

const TEAM = [
  { name: "Aarav Shah",    role: "CEO & Co-founder",      initials: "AS", avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "Priya Mehta",   role: "Head of Curriculum",    initials: "PM", avatar: "https://i.pravatar.cc/150?img=44" },
  { name: "David Lee",     role: "Lead Instructor",       initials: "DL", avatar: "https://i.pravatar.cc/150?img=15" },
  { name: "Alice Smith",   role: "Product & Engineering", initials: "AS", avatar: "https://i.pravatar.cc/150?img=32" },
];

const VALUES = [
  { icon: "🎯", title: "Learn by Doing",    desc: "Every course is built around real projects, not just theory." },
  { icon: "🌍", title: "Learn Anywhere",    desc: "Mobile-first, offline-ready, no excuses to stop learning." },
  { icon: "🤝", title: "Community First",   desc: "Learning is better together — forums, live sessions, peer reviews." },
  { icon: "🏆", title: "Quality Obsessed",  desc: "Every instructor is vetted. Every course is reviewed." },
];

export default function AboutUs() {
  const { siteName } = useSiteSettings();

  return (
    <div className="about-page">

      {/* Hero */}
      <div className="about-hero">
        <div className="hero-eyebrow">Our Story</div>
        <h1>
          We believe <em>everyone</em><br />deserves world-class education.
        </h1>
        <p>
          {siteName} was founded in 2024 with a single mission: make high-quality
          tech education accessible to anyone, anywhere. No excuses.
        </p>
        <Link to="/courses"><button className="btn btn-primary">Explore Courses →</button></Link>
      </div>

      {/* Stats */}
      <div className="about-stats">
        {[
          { number: "3K+",  label: "Students"     },
          { number: "5+",   label: "Instructors"  },
          { number: "15+",  label: "Courses"      },
          { number: "4.8★", label: "Avg. Rating"  },
        ].map((s) => (
          <div className="about-stat" key={s.label}>
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="about-section">
        <div className="page-eyebrow">What We Stand For</div>
        <h2 className="about-section-title">Our Values</h2>
        <div className="values-grid">
          {VALUES.map((v) => (
            <div className="value-card" key={v.title}>
              <span className="value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="about-section">
        <div className="page-eyebrow">The People</div>
        <h2 className="about-section-title">Meet the Team</h2>
        <div className="team-grid">
          {TEAM.map((m) => (
            <div className="team-card" key={m.name}>
              {m.avatar ? (
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="team-avatar team-avatar-img"
                />
              ) : (
                <div className="team-avatar">{m.initials}</div>
              )}
              <h4>{m.name}</h4>
              <p>{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta">
        <h2>Ready to start learning?</h2>
        <p>Join thousands of learners building careers they love.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register"><button className="btn btn-primary">Get Started Free →</button></Link>
          <Link to="/courses"><button className="btn btn-secondary">Browse Courses</button></Link>
        </div>
      </div>

    </div>
  );
}