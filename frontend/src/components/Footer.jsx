import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext";

function Footer() {
  const { siteName, supportEmail } = useSiteSettings();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>{siteName}</h3>
          <p className="footer-tagline">Empowering learners with practical, career-focused education.</p>
        </div>

        <div className="footer-section">
          <h4>Info</h4>
          <div className="footer-links">
            <Link to="/courses">Courses</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <div className="footer-details">
            <span>EduPlatform Learning Pvt. Ltd.</span>
            <span>4th Floor, Innovation Hub, SG Highway, Ahmedabad, Gujarat 380015</span>
            <span>Phone: +91 79 4000 2211</span>
          </div>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <div className="footer-details">
            <span>Email: {supportEmail}</span>
            <span>Support Hours: Mon - Sat, 9:00 AM - 6:00 PM</span>
            <span>Response Time: Within 24 hours</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">© 2026 {siteName}. All rights reserved.</div>
    </footer>
  );
}

export default Footer;