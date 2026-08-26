import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronRight,
  Search,
  Bell,
  ChevronDown,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
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
      const spaced = s
        .replace(/([A-Z])/g, " $1")
        .replace(/[-_]/g, " ")
        .trim();
      return spaced
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    });

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        borderBottom: `1px solid ${T.border}`,
        background: T.panel,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: T.textSoft,
        }}
      >
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
            <span
              style={{
                color: idx === segments.length - 1 ? T.text : T.textSoft,
                fontWeight: idx === segments.length - 1 ? 600 : 400,
              }}
            >
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}
        <button
          onClick={toggle}
          title={
            mode === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: 52,
            height: 28,
            borderRadius: 999,
            padding: 4,
            cursor: "pointer",
            background:
              mode === "light"
                ? "linear-gradient(180deg, #f7ebcf 0%, #f2dca0 100%)"
                : "linear-gradient(180deg, #1a2330 0%, #111827 100%)",
            border:
              mode === "light"
                ? "1px solid rgba(229, 163, 57, 0.8)"
                : "1px solid rgba(148, 163, 184, 0.6)",
            boxShadow:
              mode === "light"
                ? "inset 0 0 0 1px rgba(255,255,255,0.25), 0 2px 8px rgba(160, 110, 22, 0.16)"
                : "inset 0 0 0 1px rgba(255,255,255,0.04), 0 2px 10px rgba(0,0,0,0.28)",
            transition: "all 0.25s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: mode === "light" ? 4 : 26,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background:
                mode === "light"
                  ? "linear-gradient(180deg, #fffaf0 0%, #f6efe6 100%)"
                  : "#E5A339",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                mode === "light"
                  ? "0 2px 6px rgba(166, 113, 16, 0.25)"
                  : "0 2px 8px rgba(229, 163, 57, 0.45)",
              border:
                mode === "dark"
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(138, 90, 20, 0.18)",
            }}
          >
            {mode === "light" ? (
              <Sun size={10} color={T.amber} />
            ) : (
              <Moon size={10} color="#fff" />
            )}
          </div>
        </button>
        <div ref={langRef} style={{ position: "relative" }}>
          <div
            onClick={() => setLangOpen(!langOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: T.textSoft,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Globe size={13} />{" "}
            {LANGUAGES.find((l) => l.code === selectedLang)?.label || "English"}{" "}
            <ChevronDown size={13} />
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
                    background:
                      lang.code === selectedLang ? T.hover : "transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (lang.code !== selectedLang)
                      e.currentTarget.style.background = T.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (lang.code !== selectedLang)
                      e.currentTarget.style.background = "transparent";
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
