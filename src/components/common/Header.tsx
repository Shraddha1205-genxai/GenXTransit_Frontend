import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, Search, Bell, ChevronDown, Globe, Sun, Moon } from "lucide-react";
import { T, useTheme } from "../../constants/theme";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
];

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const langRef = useRef<HTMLDivElement>(null);
  const { mode, toggle } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => {
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
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid " + T.border,
              background: T.panel,
              cursor: "pointer",
              color: T.textSoft,
              transition: "all 0.15s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}
        <button
          onClick={toggle}
          title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: 40,
            height: 20,
            borderRadius: 999,
            padding: 2,
            cursor: "pointer",
            background: mode === "light" ? T.amberFill : T.ink2,
            border: `0.5px solid ${mode === "light" ? T.amber : T.inkBorder}`,
            transition: "all 0.25s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: mode === "light" ? "calc(100% - 36px)" : "calc(100% - 17px)",
              // bottom: 3,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: mode === "light" ? T.panel : T.amberDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
            }}
          >
            {mode === "light" ? <Sun size={8} color={T.amber} /> : <Moon size={8} color="#fff" />}
          </div>
        </button>
        <div ref={langRef} style={{ position: "relative" }}>
          <div
            onClick={() => setLangOpen(!langOpen)}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.textSoft, cursor: "pointer", userSelect: "none" }}
          >
            <Globe size={13} /> {LANGUAGES.find((l) => l.code === selectedLang)?.label || "English"} <ChevronDown size={13} />
          </div>
          {langOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: T.panel,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                minWidth: 140,
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setLangOpen(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: 12,
                    color: lang.code === selectedLang ? T.text : T.textSoft,
                    background: lang.code === selectedLang ? T.hover : "transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (lang.code !== selectedLang) e.currentTarget.style.background = T.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (lang.code !== selectedLang) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {lang.label}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Bell size={17} color={T.textSoft} />
      </div>
    </header>
  );
}

export default Header;
