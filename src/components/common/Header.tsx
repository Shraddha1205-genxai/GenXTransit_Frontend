import React from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, Search, Bell, ChevronDown } from "lucide-react";
import { T } from "../../constants/theme";

export function Header() {
  const location = useLocation();

  // Parse pathname into capitalized, spaced breadcrumb names
  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => {
      // Convert camelCase or kebab-case to words
      const spaced = s.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim();
      return spaced
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    });

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.panel }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.textSoft }}>
        <span>Transit Ops</span>
        {segments.length === 0 && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: T.text, fontWeight: 600 }}>Dashboard</span>
          </>
        )}
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={14} />
            <span style={{ color: idx === segments.length - 1 ? T.text : T.textSoft, fontWeight: idx === segments.length - 1 ? 600 : 400 }}>
              {seg}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, color: T.textSoft }}>
          <Search size={14} />
          Search trips, tickets, vehicles…
        </div>
        <Bell size={17} color={T.textSoft} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.textSoft, cursor: "pointer" }}>
          All depots <ChevronDown size={13} />
        </div>
      </div>
    </header>
  );
}

export default Header;
