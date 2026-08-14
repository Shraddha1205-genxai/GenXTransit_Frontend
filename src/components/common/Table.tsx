import React from "react";
import { T } from "../../constants/theme";

interface ThProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}

export function Table({ children, maxHeight = 400 }: { children: React.ReactNode; maxHeight?: number }) {
  return (
    <div className="stc-table-scroll" style={{ maxHeight, overflowY: "auto", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children, align }: ThProps) {
  return (
    <th
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: T.panel,
        textAlign: align || "left",
        fontSize: 11,
        fontWeight: 600,
        color: T.textFaint,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        padding: "8px 10px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {children}
    </th>
  );
}

interface TdProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
  colSpan?: number;
  style?: React.CSSProperties;
}

export function Td({ children, align, mono, colSpan, style }: TdProps) {
  return (
    <td
      colSpan={colSpan}
      className={mono ? "stc-mono" : ""}
      style={{
        textAlign: align || "left",
        fontSize: 13,
        color: T.text,
        padding: "10px",
        borderBottom: `1px solid ${T.border}`,
        ...style,
      }}
    >
      {children}
    </td>
  );
}

