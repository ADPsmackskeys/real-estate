import { useState } from "react";
import { Heart, Users, Home, Menu, X } from "lucide-react";

export default function TopBar({ currentPage, onNavigate, favouriteCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Properties", icon: Home },
    { id: "agents", label: "Agents", icon: Users },
    { id: "favourites", label: "Saved", icon: Heart, badge: favouriteCount },
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-logo" onClick={() => onNavigate("home")}>
          <div className="logo-mark">
            <span className="logo-square" />
            <span className="logo-square logo-square--offset" />
          </div>
          <span className="logo-text">
            nest<span className="logo-accent">.</span>
          </span>
        </div>

        <nav className="topbar-nav desktop-only">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${currentPage === id ? "nav-item--active" : ""}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        <button className="mobile-menu-toggle mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`mobile-nav-item ${currentPage === id ? "mobile-nav-item--active" : ""}`}
              onClick={() => { onNavigate(id); setMenuOpen(false); }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
