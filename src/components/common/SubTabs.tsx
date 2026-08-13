import React from "react";
import { T } from "../../constants/theme";

interface SubTabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function SubTabs({ tabs, active, onChange }: SubTabsProps) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            color: active === t ? T.amberDeep : T.textSoft,
            borderBottom: active === t ? `2px solid ${T.amber}` : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
