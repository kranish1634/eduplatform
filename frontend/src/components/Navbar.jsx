import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

const NAV_LINKS = [
  { label: "Home",    to: "/" },
  { label: "Courses", to: "/courses" },
  {
    label: "Explore",
    children: [
      { label: "About Us", to: "/about",   icon: "✦" },
      { label: "FAQ",      to: "/faq",     icon: "?" },
      { label: "Contact",  to: "/contact", icon: "✉" },
    ],
  },
];

const USER_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: "⊞" },
  { label: "Profile",   to: "/profile",   icon: "◎" },
];

function Dropdown({ trigger, children, alignRight = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div
          className="nav-dropdown"
          style={alignRight ? { left: "auto", right: 0 } : { left: 0 }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useUser();
  const { siteName } = useSiteSettings();

  const [mobileOpen,        setMobileOpen]        = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileExploreOpen(false);
  }, [location.pathname, setMobileOpen, setMobileExploreOpen]);

  const isActive = (to) => location.pathname === to;

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">

        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span>{siteName}</span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links desktop-only">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <Dropdown
                key={link.label}
                trigger={(open) => (
                  <button className={`nav-dropdown-trigger ${open ? "active" : ""}`}>
                    {link.label}
                    <span className="nav-chevron">{open ? "▴" : "▾"}</span>
                  </button>
                )}
              >
                {link.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    className={`nav-dropdown-item ${isActive(child.to) ? "nav-dropdown-item-active" : ""}`}
                  >
                    <span className="nav-dropdown-icon">{child.icon}</span>
                    {child.label}
                  </Link>
                ))}
              </Dropdown>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? "nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop right side */}
        <div className="navbar-right desktop-only">
          {user ? (
            /* ── LOGGED IN: show avatar dropdown ── */
            <Dropdown
              alignRight
              trigger={(open) => (
                <button className="nav-user-btn">
                  <div className="nav-avatar">{user.initials}</div>
                  <span className="nav-chevron">{open ? "▴" : "▾"}</span>
                </button>
              )}
            >
              <div className="nav-dropdown-header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <div className="nav-dropdown-divider" />
              {USER_LINKS.map((u) => (
                <Link
                  key={u.to}
                  to={u.to}
                  className={`nav-dropdown-item ${isActive(u.to) ? "nav-dropdown-item-active" : ""}`}
                >
                  <span className="nav-dropdown-icon">{u.icon}</span>
                  {u.label}
                </Link>
              ))}
              <div className="nav-dropdown-divider" />
              <button
                className="nav-dropdown-item nav-dropdown-logout"
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                onClick={handleSignOut}
              >
                <span className="nav-dropdown-icon">→</span>
                Sign Out
              </button>
            </Dropdown>
          ) : (
            /* ── LOGGED OUT: avatar icon + Login + Get Started ── */
            <>
              <Link to="/login" className="nav-user-btn" title="Sign in">
                <div className="nav-avatar nav-avatar-guest">?</div>
              </Link>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "nav-link-active" : ""}`}
              >
                Login
              </Link>
              <Link to="/register" className="nav-link nav-cta">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn mobile-only"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileOpen ? "open" : ""}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">

          {/* Main nav links */}
          <div className="mobile-drawer-section">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    className="mobile-drawer-group-btn"
                    onClick={() => setMobileExploreOpen((o) => !o)}
                  >
                    <span>{link.label}</span>
                    <span className="nav-chevron">{mobileExploreOpen ? "▴" : "▾"}</span>
                  </button>
                  {mobileExploreOpen && (
                    <div className="mobile-drawer-nested">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`mobile-drawer-link mobile-drawer-link-nested ${isActive(child.to) ? "mobile-drawer-link-active" : ""}`}
                        >
                          {child.icon} {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`mobile-drawer-link ${isActive(link.to) ? "mobile-drawer-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="mobile-drawer-divider" />

          {user ? (
            /* ── LOGGED IN mobile ── */
            <div className="mobile-drawer-section">
              <div className="mobile-drawer-user-info">
                <div className="nav-avatar">{user.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--white)", fontSize: "0.9rem" }}>{user.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{user.email}</div>
                </div>
              </div>
              {USER_LINKS.map((u) => (
                <Link
                  key={u.to}
                  to={u.to}
                  className={`mobile-drawer-link ${isActive(u.to) ? "mobile-drawer-link-active" : ""}`}
                >
                  {u.icon} {u.label}
                </Link>
              ))}
              <button
                className="mobile-drawer-link"
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: "#e55353" }}
                onClick={handleSignOut}
              >
                → Sign Out
              </button>
            </div>
          ) : (
            /* ── LOGGED OUT mobile ── */
            <div className="mobile-drawer-actions">
              <Link to="/login"    className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Login</Link>
              <Link to="/register" className="btn btn-primary"   style={{ flex: 1, justifyContent: "center" }}>Get Started</Link>
            </div>
          )}

        </div>
      )}
    </>
  );
}