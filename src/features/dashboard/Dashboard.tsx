import React from "react";
import {
  Bus, Milestone, Ticket, IndianRupee, Smartphone, Wifi, UserCheck, Percent,
  Wrench, MessageSquareWarning, XCircle, AlertTriangle, Circle
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { T } from "../../constants/theme";
import { Card, RouteChip, StatusBadge, Td, KpiCard, SectionHeader } from "../../components/common";

export interface RevenueTrendItem {
  day: string;
  revenue: number;
}

export interface FleetStatusItem {
  name: string;
  value: number;
  color: string;
}

export interface TripAlertItem {
  id: string;
  route: string;
  status: string;
}

export interface DepotRevenueItem {
  name: string;
  revenue: number;
}

export interface DashboardProps {
  revenueTrend?: RevenueTrendItem[];
  fleetStatus?: FleetStatusItem[];
  trips?: TripAlertItem[];
  depotRevenue?: DepotRevenueItem[];
}

// Default mock data
const defaultRevenueTrend: RevenueTrendItem[] = [
  { day: "Mon", revenue: 1560 }, { day: "Tue", revenue: 1610 }, { day: "Wed", revenue: 1490 },
  { day: "Thu", revenue: 1720 }, { day: "Fri", revenue: 1980 }, { day: "Sat", revenue: 2260 }, { day: "Sun", revenue: 2040 },
];

const defaultFleetStatus: FleetStatusItem[] = [
  { name: "Active", value: 256, color: T.green },
  { name: "Maintenance", value: 29, color: T.amber },
  { name: "Breakdown", value: 9, color: T.red },
  { name: "Retired", value: 7, color: T.gray },
];

const defaultTrips: TripAlertItem[] = [
  { id: "TRP-90213", route: "MSRTC-9502", status: "Delayed" },
  { id: "TRP-90214", route: "BEST-A-1", status: "Cancelled" },
  { id: "TRP-90215", route: "MSRTC-8801", status: "On time" },
  { id: "TRP-90216", route: "PMPML-56", status: "On time" },
  { id: "TRP-90217", route: "BEST-AC-84", status: "Ongoing" },
];

const defaultDepotRevenue: DepotRevenueItem[] = [
  { name: "MSRTC-PUN", revenue: 612 },
  { name: "BEST-MUM", revenue: 399 },
  { name: "PMPML-PUN", revenue: 272 },
  { name: "MSRTC-MUM", revenue: 350 },
];

export function Dashboard({
  revenueTrend = defaultRevenueTrend,
  fleetStatus = defaultFleetStatus,
  trips = defaultTrips,
  depotRevenue = defaultDepotRevenue,
}: DashboardProps) {
  const delayedTrips = trips.filter((t: TripAlertItem) => t.status !== "On time");

  return (
    <div>
      <SectionHeader eyebrow="Network-wide" title="Operations overview" />
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total buses" value="258" sub="220 on road today" icon={Bus} />
        <KpiCard label="Active trips" value="718" sub="612 completed" icon={Milestone} />
        <KpiCard label="Tickets issued today" value="9,842" icon={Ticket} />
        <KpiCard label="Revenue today" value="₹15.2L" sub="+8% vs last Mon" icon={IndianRupee} tone="green" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Online bookings" value="3,051" sub="31% of tickets today" icon={Smartphone} />
        <KpiCard label="ETM devices online" value="3 / 4" sub="1 offline" icon={Wifi} tone="amber" />
        <KpiCard label="Driver attendance" value="601 / 640" sub="94% present" icon={UserCheck} tone="green" />
        <KpiCard label="Occupancy" value="80%" sub="Avg. across live trips" icon={Percent} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Pending maintenance" value="24" icon={Wrench} tone="amber" />
        <KpiCard label="Complaints raised" value="4" sub="1 overdue SLA" icon={MessageSquareWarning} tone="red" />
        <KpiCard label="Refund requests" value="9" sub="₹6,240 pending" icon={XCircle} tone="amber" />
        <KpiCard label="Active alerts" value="6" sub="2 breakdowns, 4 delays" icon={AlertTriangle} tone="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Revenue trend · last 7 days">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}K`} />
                <Tooltip formatter={(v: any) => [`₹${v}K`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
                <Line type="monotone" dataKey="revenue" stroke={T.amber} strokeWidth={2.5} dot={{ r: 3, fill: T.amber }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fleet status">
          <div style={{ height: 180, display: "flex", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleetStatus} dataKey="value" innerRadius={44} outerRadius={68} paddingAngle={2}>
                  {fleetStatus.map((f: FleetStatusItem, i: number) => <Cell key={i} fill={f.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {fleetStatus.map((f: FleetStatusItem) => (
              <div key={f.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: T.textSoft }}>
                  <Circle size={8} fill={f.color} color={f.color} /> {f.name}
                </span>
                <span style={{ fontWeight: 600, color: T.text }}>{f.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Live delay alerts">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {delayedTrips.map((t: TripAlertItem) => (
                <tr key={t.id} className="stc-row">
                  <Td mono><RouteChip>{t.id}</RouteChip></Td>
                  <Td mono>{t.route}</Td>
                  <Td><StatusBadge status={t.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Depot-wise revenue today (₹ '000)">
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depotRevenue} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
                <Bar dataKey="revenue" fill={T.blue} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
