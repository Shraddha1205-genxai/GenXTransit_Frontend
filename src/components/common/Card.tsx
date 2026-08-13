import React from "react";
import { T } from "../../constants/theme";

interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ title, action, children, style }: CardProps) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", flex: 1, ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <h3 className="stc-display" style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {title}
          </h3>
          {action}
        </div>
      )}
      <div style={{ padding: 16, overflowY: "auto", overflowX: "auto", flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}
