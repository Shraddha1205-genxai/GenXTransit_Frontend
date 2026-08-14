import React from "react";
import { T } from "../../constants/theme";

interface RouteChipProps {
  children: React.ReactNode;
}

export function RouteChip({ children }: RouteChipProps) {
  return (
    <span
      className="stc-mono"
      style={{
        display: "inline-flex", alignItems: "center", padding: "3px 8px",
        background: T.amberFill, color: T.amberDeep, fontSize: 12, fontWeight: 600,
        borderRadius: 3, whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
