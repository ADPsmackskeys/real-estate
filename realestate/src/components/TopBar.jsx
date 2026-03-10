import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Users, Home } from "lucide-react";

export default function TopBar({ favouriteCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "/", label: "Properties", icon: Home },
    { id: "/agents", label: "Agents", icon: Users },
    { id: "/favourites", label: "Saved", icon: Heart, badge: favouriteCount },
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-logo" onClick={() => navigate("/")}>
          <div className="logo-mark">
            <span className="logo-square" />
            <span className="logo-square logo-square--offset" />
          </div>
          <span className="logo-text">
            nest<span className="logo-accent">.</span>
          </span>
        </div>

        <nav className="topbar-nav">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${location.pathname === id ? "nav-item--active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        <div />
      </div>
    </header>
  );
}
