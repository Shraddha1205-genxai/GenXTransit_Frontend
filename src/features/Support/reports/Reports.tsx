import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { T } from "../../../constants/theme";
import { Card, SectionHeader } from "../../../components/common";

export interface OnTimeDepotRecord {
  name: string;
  pct: number;
}

export interface ChannelSplitRecord {
  name: string;
  value: number;
  color: string;
}

interface ReportsProps {
  onTimeByDepot: OnTimeDepotRecord[];
  channelSplit: ChannelSplitRecord[];
}

export function Reports({ onTimeByDepot, channelSplit }: ReportsProps) {
  return (
    <div>
      <SectionHeader eyebrow="Analytics" title="Reports & analytics" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="On-time performance by depot (%)">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={onTimeByDepot} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
                <Bar dataKey="pct" fill={T.green} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Ticket sales by channel">
          <div style={{ height: 220, display: "flex", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" innerRadius={48} outerRadius={74} paddingAngle={2}>
                  {channelSplit.map((c: ChannelSplitRecord, i: number) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Reports;
