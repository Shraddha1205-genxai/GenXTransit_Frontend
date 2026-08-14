import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { T } from "../../../constants/theme";
import { Card } from "../../../components/common";

export interface AttendanceSummaryItem {
  day: string;
  present: number;
}

interface AttendanceProps {
  data: AttendanceSummaryItem[];
}

export function Attendance({ data }: AttendanceProps) {
  return (
    <Card title="Attendance — last 7 days (network-wide)">
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={T.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
            <Bar dataKey="present" fill={T.blue} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default Attendance;
