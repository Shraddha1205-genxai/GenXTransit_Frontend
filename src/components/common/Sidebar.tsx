import React from "react";
import { NavLink } from "react-router-dom";
import {
  Bus,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { T } from "../../constants/theme";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
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
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  nav,
  session,
  onLogout,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const width = collapsed ? 64 : 240;
  return (
    <aside
      className="stc-sidebar"
      style={{
        width,
        flexShrink: 0,
        background: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: collapsed ? "16px 10px" : "18px 18px 14px",
          borderBottom: `1px solid ${T.sidebarBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 8,
          transition: "padding 0.25s ease",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                background: T.amber,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bus size={15} color={T.ink} />
            </div>
            <span
              className="stc-display"
              style={{
                color: T.sidebarText,
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              GenXTransit
            </span>
          </div>
        )}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            style={{
              width: 26,
              height: 26,
              background: T.amber,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Bus size={15} color={T.ink} />
          </button>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              color: T.sidebarTextSoft,
              transition: "color 0.15s ease",
            }}
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="stc-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: collapsed ? "10px 6px" : "10px 10px",
          transition: "padding 0.25s ease",
        }}
      >
        {nav.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            {g.group && !collapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.sidebarTextFaint,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  padding: "4px 10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {g.group}
              </div>
            )}
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `stc-navitem${isActive ? " active" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: collapsed ? "10px" : "10px 10px 10px 13px",
                    background: isActive ? T.sidebarActive : "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: isActive ? T.sidebarText : T.sidebarTextSoft,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    marginBottom: 2,
                    textAlign: "left",
                    textDecoration: "none",
                    boxSizing: "border-box",
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "all 0.15s ease",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        color={isActive ? T.amber : T.sidebarTextFaint}
                        style={{
                          flexShrink: 0,
                          transition: "color 0.15s ease",
                        }}
                      />
                      {!collapsed && (
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: collapsed ? 12 : 14,
          borderTop: `1px solid ${T.sidebarBorder}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "all 0.25s ease",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: T.sidebarHover,
            border: `1px solid ${T.sidebarBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: T.amber,
            flexShrink: 0,
          }}
        >
          {session.name.slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.sidebarText,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {session.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.sidebarTextFaint,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {session.role} · {session.depot}
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onLogout}
            title="Log out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              flexShrink: 0,
              color: T.sidebarTextSoft,
            }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
