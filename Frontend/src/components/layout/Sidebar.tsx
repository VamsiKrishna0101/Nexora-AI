import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Building2, Users, Scale, Brain, Map,
  Settings, CreditCard, LogOut, ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/sidebar.css";
import lexora_logo from "../../assets/nexora_icon.png";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Building2, label: "Company", path: "/dashboard/company" },
  { icon: Users, label: "Personas", path: "/dashboard/personas" },
  { icon: Scale, label: "Compare", path: "/dashboard/compare" },
  { icon: Brain, label: "AI Insights", path: "/dashboard/insights" },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: CreditCard, label: "Subscription", path: "/dashboard/subscription" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <img
          src={lexora_logo}
          alt="Nexora AI"
          className="sidebar-logo-icon"
        />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Nexora AI</span>
          <span className="sidebar-logo-sub">AI Research Platform</span>
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            title={label}
            onClick={() => console.log("Sidebar Clicked:", label, "Path:", path)}
            className={({ isActive }) =>
              `sidebar-item${isActive ? " sidebar-item--active" : ""}`
            }
          >

            <Icon size={17} strokeWidth={1.6} />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />

        {BOTTOM_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            className={({ isActive }) =>
              `sidebar-item${isActive ? " sidebar-item--active" : ""}`
            }
          >
            <Icon size={17} strokeWidth={1.6} />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}

        <button
          className="sidebar-item sidebar-logout"
          onClick={handleLogout}
          title="Log out"
        >
          <LogOut size={17} strokeWidth={1.6} />
          <span className="sidebar-label">Log out</span>
        </button>

        {/* ── Profile ── */}
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || "User"}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>
      </div>

    </aside>
  );
}