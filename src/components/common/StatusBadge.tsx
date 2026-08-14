import React from "react";
import { T } from "../../constants/theme";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, [string, string]> = {
    "On time": [T.greenFill, T.green], "Active": [T.greenFill, T.green], "Confirmed": [T.greenFill, T.green],
    "Published": [T.greenFill, T.green], "Resolved": [T.greenFill, T.green],
    "Delayed": [T.amberFill, T.amberDeep], "Ongoing": [T.blueFill, T.blue], "Simulated": [T.blueFill, T.blue],
    "Pending verification": [T.amberFill, T.amberDeep], "In progress": [T.amberFill, T.amberDeep], "Open": [T.amberFill, T.amberDeep],
    "Cancelled": [T.redFill, T.red], "Breakdown": [T.redFill, T.red], "Voided": [T.redFill, T.red],
    "Expired": [T.redFill, T.red], "Escalated": [T.redFill, T.red], "Suspended": [T.redFill, T.red],
    "Under maintenance": [T.amberFill, T.amberDeep],
  };
  const [bg, fg] = map[status] || [T.grayFill, T.gray];
  return (
    <span style={{ background: bg, color: fg, fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 3, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}
