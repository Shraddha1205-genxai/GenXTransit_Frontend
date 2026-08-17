import React from "react";
import { NavLink } from "react-router-dom";
import { Bus, LogOut } from "lucide-react";
import { T } from "../../constants/theme";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  path: string;
}

interface NavGroup {
  group: string | null;
  items: NavItem[];
}

interface SidebarProps {
  nav: NavGroup[];
  session: {
    name: string;
    role: string;
    depot: string;
  };
  onLogout: () => void;
}

export function Sidebar({ nav, session, onLogout }: SidebarProps) {
  return (
    <aside style={{ width: 240, flexShrink: 0, background: T.ink, borderRight: `1px solid ${T.inkBorder}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.inkBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: T.amber, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bus size={15} color={T.ink} />
          </div>
          <span className="stc-display" style={{ color: "#F4F0E4", fontSize: 15, fontWeight: 600 }}>TransitX</span>
        </div>
        <div style={{ fontSize: 11, color: "#7C8A99", marginTop: 4, letterSpacing: "0.03em" }}>MSRTC · BEST · PMPML — MAHARASHTRA</div>
      </div>

      <nav className="stc-scroll" style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {nav.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            {g.group && (
              <div style={{ fontSize: 10, fontWeight: 800, color: "#5E6C7B", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 10px" }}>
                {g.group}
              </div>
            )}
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `stc-navitem${isActive ? " active" : ""}`}
                  style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px 8px 13px",
                    background: isActive ? T.ink2 : "transparent", border: "none", borderRadius: 4, cursor: "pointer",
                    color: isActive ? "#F4F0E4" : "#9AA6B2", fontSize: 13, fontWeight: 500, marginBottom: 1, textAlign: "left",
                    textDecoration: "none", boxSizing: "border-box"
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} color={isActive ? T.amber : "#6B7885"} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: 14, borderTop: `1px solid ${T.inkBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.ink2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: T.amber, flexShrink: 0 }}>
          {session.name.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#F4F0E4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.name}</div>
          <div style={{ fontSize: 11, color: "#7C8A99", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.role} · {session.depot}</div>
        </div>
        <button onClick={onLogout} title="Log out" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}>
          <LogOut size={15} color="#9AA6B2" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
