import React from "react";
import { Percent, TrendingUp, Users2, IndianRupee } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { T } from "../../../constants/theme";
import { Card, KpiCard, SectionHeader } from "../../../components/common";

export interface OccupancyTrendItem {
  day: string;
  pct: number;
}

export interface PassengerTrendItem {
  month: string;
  passengers: number;
}

import { OnTimeDepotRecord, ChannelSplitRecord } from "../reports/Reports";


interface AnalyticsProps {
  occupancyTrend: OccupancyTrendItem[];
  passengerTrends: PassengerTrendItem[];
  onTimeByDepot: OnTimeDepotRecord[];
  channelSplit: ChannelSplitRecord[];
}

export function Analytics({ occupancyTrend, passengerTrends, onTimeByDepot, channelSplit }: AnalyticsProps) {
  return (
    <div>
      <SectionHeader eyebrow="Business intelligence" title="Analytics" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Avg. occupancy (7d)" value="80%" icon={Percent} tone="green" />
        <KpiCard label="Fleet utilisation" value="85%" icon={TrendingUp} tone="green" />
        <KpiCard label="Passengers (Jul)" value="4.72L" sub="+3.7% MoM" icon={Users2} />
        <KpiCard label="Revenue / km" value="₹38.60" icon={IndianRupee} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Occupancy trend · last 7 days">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrend} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, "Occupancy"]} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
                <Line type="monotone" dataKey="pct" stroke={T.blue} strokeWidth={2.5} dot={{ r: 3, fill: T.blue }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Passenger trend · monthly">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passengerTrends} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}K`} />
                <Tooltip formatter={(v) => [`${v}K`, "Passengers"]} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
                <Bar dataKey="passengers" fill={T.amber} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <Card title="Fleet utilisation by depot (%)">
          <div style={{ height: 200 }}>
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
        <Card title="Revenue by channel">
          <div style={{ height: 200, display: "flex", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" innerRadius={44} outerRadius={68} paddingAngle={2}>
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

export default Analytics;
