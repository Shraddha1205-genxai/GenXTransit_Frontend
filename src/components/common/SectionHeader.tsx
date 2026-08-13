import React from "react";
import { T } from "../../constants/theme";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}

export function SectionHeader({ eyebrow, title, children }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap" as const, gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.amberDeep, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{eyebrow}</div>
        <h2 className="stc-display" style={{ fontSize: 24, fontWeight: 600, color: T.text, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
