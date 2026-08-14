import React from "react";
import { T } from "../../constants/theme";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tone?: "amber" | "red" | "green";
}

export function KpiCard({ label, value, sub, icon: Icon, tone }: KpiCardProps) {
  const toneColor = tone === "amber" ? T.amberDeep : tone === "red" ? T.red : tone === "green" ? T.green : T.text;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 500 }}>{label}</span>
        <Icon size={16} color={T.textFaint} />
      </div>
      <span className="stc-display" style={{ fontSize: 28, fontWeight: 600, color: toneColor }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: T.textSoft }}>{sub}</span>}
    </div>
  );
}
