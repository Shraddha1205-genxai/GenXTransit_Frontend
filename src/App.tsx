import React, { useState, useMemo, useReducer, createContext, useContext, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard, Building2, Bus, Milestone, Radar, Ticket, Armchair,
  Smartphone, Wallet, MessageSquareWarning, BarChart3, ShieldCheck,
  Clock, AlertTriangle, Wrench, IndianRupee, Users2, UserCog, CalendarCheck, HelpCircle, UserCheck, Database,
  LineChart as LineChartIcon
} from "lucide-react";

import { T, fontStack, ThemeProvider } from "./constants/theme";
import { Sidebar, Header, SubTabs, SectionHeader, KpiCard } from "./components/common";

// Lazy-loaded Feature Pages
const DashboardTab = lazy(() => import("./features/dashboard"));
const Regions = lazy(() => import("./features/organization/organizationManagement/Regions"));
const Divisions = lazy(() => import("./features/organization/organizationManagement/Divisions"));
const Depots = lazy(() => import("./features/organization/organizationManagement/Depots"));
const BusStation = lazy(() => import("./features/organization/organizationManagement/BusStation"));
const Workshops = lazy(() => import("./features/organization/organizationManagement/Workshops"));
const ParkingYards = lazy(() => import("./features/organization/organizationManagement/ParkingYards"));

const RouteMaster = lazy(() => import("./features/organization/masters/Route"));
const Stop = lazy(() => import("./features/organization/masters/Stop"));
const Stages = lazy(() => import("./features/organization/masters/Stages"));
const Zones = lazy(() => import("./features/organization/masters/zones"));
const FarePolicies = lazy(() => import("./features/organization/masters/FarePolicies"));
const TicketTypes = lazy(() => import("./features/organization/masters/TicketTypes"));
const PaymentModes = lazy(() => import("./features/organization/masters/PaymentModes"));
const VehicleCategories = lazy(() => import("./features/organization/masters/VehicleCategories"));
const SeatLayouts = lazy(() => import("./features/organization/masters/SeatLayouts"));
const HolidayCalendar = lazy(() => import("./features/organization/masters/HolidayCalendar"));
const NotificationTemplates = lazy(() => import("./features/organization/masters/NotificationTemplates"));
const ComplaintCategories = lazy(() => import("./features/organization/masters/ComplaintCategories"));
const TaxConfiguration = lazy(() => import("./features/organization/masters/TaxConfiguration"));

const VehicleRegister = lazy(() => import("./features/operations/fleet/VehicleRegister"));
const Roster = lazy(() => import("./features/operations/employees/Roster"));
const Attendance = lazy(() => import("./features/operations/employees/Attendance"));
const RoutesAndSchedule = lazy(() => import("./features/operations/routesAndSchedule/RoutesAndSchedule"));
const LiveTracking = lazy(() => import("./features/operations/liveTracking/LiveTracking"));

const FareManagement = lazy(() => import("./features/commercial/fareManagement/FareManagement"));
const Ticketing = lazy(() => import("./features/commercial/ticketing/Ticketing"));
const Reservations = lazy(() => import("./features/commercial/reservations/Reservations"));
const Passes = lazy(() => import("./features/commercial/passes/Passes"));

const EtmDevices = lazy(() => import("./features/systems/etmDevices/EtmDevices"));
const FinanceWallet = lazy(() => import("./features/systems/financeWallet/FinanceWallet"));

const ComplaintsAlerts = lazy(() => import("./features/support/complaintsAlerts/ComplaintsAlerts"));
const Reports = lazy(() => import("./features/support/reports/Reports"));
const Analytics = lazy(() => import("./features/support/analytics/Analytics"));
const UsersRoles = lazy(() => import("./features/support/usersRoles/UsersRoles"));
const Help = lazy(() => import("./features/support/help/Help"));

const AdminAuthScreen = lazy(() => import("./features/auth/AdminAuthScreen"));

const CHART_COLORS = {
  green: "#2F8F5B",
  amber: "#E5A339",
  red: "#C6453B",
  gray: "#8B9098",
  blue: "#3E7CB1",
};

/* ---------------------------------------------------------------------
   MOCK DATA — Maharashtra: MSRTC (State Transport / ST) + BEST & PMPML
--------------------------------------------------------------------- */
const depots = [
  { code: "MSRTC-PUN-01", name: "Pune (Swargate) ST Depot", corp: "MSRTC", service: "ST", zone: "Pune Division", fleet: 96, onRoad: 74, tripsToday: 268, revenueToday: 612400 },
  { code: "BEST-MUM-04", name: "BEST Wadala Depot", corp: "BEST", service: "Local", zone: "Mumbai (Island City)", fleet: 72, onRoad: 58, tripsToday: 341, revenueToday: 398600 },
  { code: "PMPML-PUN-02", name: "PMPML Swargate Depot", corp: "PMPML", service: "Local", zone: "Pune Metropolitan Region", fleet: 60, onRoad: 47, tripsToday: 219, revenueToday: 271500 },
  { code: "MSRTC-MUM-03", name: "Mumbai Central (MSRTC) Depot", corp: "MSRTC", service: "ST", zone: "Mumbai Division", fleet: 54, onRoad: 41, tripsToday: 132, revenueToday: 349800 },
  { code: "BEST-MUM-07", name: "BEST Colaba Depot", corp: "BEST", service: "Local", zone: "Mumbai (Island City)", fleet: 45, onRoad: 36, tripsToday: 208, revenueToday: 226100 },
];

const vehicles = [
  { reg: "MH-12-AB-4421", category: "AC Shivneri", depot: "MSRTC-PUN-01", status: "Active", nextService: "12 Aug 2026", docExpiry: "Fitness · 18 Aug 2026" },
  { reg: "MH-12-CD-1187", category: "Express (ST)", depot: "MSRTC-PUN-01", status: "Active", nextService: "22 Aug 2026", docExpiry: "Insurance · 02 Sep 2026" },
  { reg: "MH-01-EF-7702", category: "AC Local (BEST)", depot: "BEST-MUM-04", status: "Under maintenance", nextService: "In progress", docExpiry: "PUC · 09 Aug 2026" },
  { reg: "MH-14-GH-2290", category: "Ordinary Local (PMPML)", depot: "PMPML-PUN-02", status: "Breakdown", nextService: "Awaiting spare", docExpiry: "Permit · 30 Nov 2026" },
  { reg: "MH-02-JK-5561", category: "AC Shivneri", depot: "MSRTC-MUM-03", status: "Active", nextService: "05 Sep 2026", docExpiry: "Fitness · 14 Aug 2026" },
  { reg: "MH-01-LM-9034", category: "Double-decker (BEST)", depot: "BEST-MUM-07", status: "Active", nextService: "19 Aug 2026", docExpiry: "Road tax · 01 Oct 2026" },
];

const routes = [
  { code: "MSRTC-9502", name: "Pune – Mumbai Shivneri (Expressway)", type: "Luxury", distance: "150 km", fareModel: "Fixed", duration: "3h 10m", service: "ST" },
  { code: "MSRTC-7714", name: "Pune – Nashik ST Express", type: "Express", distance: "210 km", fareModel: "Distance", duration: "4h 30m", service: "ST" },
  { code: "MSRTC-8801", name: "Mumbai Central – Mahabaleshwar", type: "Ordinary", distance: "247 km", fareModel: "Zone", duration: "5h 45m", service: "ST" },
  { code: "BEST-A-1", name: "Colaba – Bandra (via Worli Sea Face)", type: "City", distance: "18 km", fareModel: "Distance", duration: "1h 05m", service: "Local" },
  { code: "BEST-AC-84", name: "Colaba – Andheri Station AC", type: "City", distance: "24 km", fareModel: "Distance", duration: "1h 20m", service: "Local" },
  { code: "PMPML-56", name: "Swargate – Hinjawadi IT Park", type: "City", distance: "21 km", fareModel: "Distance", duration: "1h 10m", service: "Local" },
];

const trips = [
  { id: "TRP-90213", route: "MSRTC-9502", vehicle: "MH-12-AB-4421", driver: "S. Jadhav", conductor: "R. Kulkarni", sched: "14:30", actual: "14:33", status: "Delayed" },
  { id: "TRP-90214", route: "BEST-A-1", vehicle: "MH-01-EF-7702", driver: "V. Pawar", conductor: "A. Shinde", sched: "14:45", actual: "—", status: "Cancelled" },
  { id: "TRP-90215", route: "MSRTC-8801", vehicle: "MH-02-JK-5561", driver: "D. More", conductor: "P. Bhosale", sched: "15:00", actual: "15:00", status: "On time" },
  { id: "TRP-90216", route: "PMPML-56", vehicle: "MH-14-GH-2290", driver: "N. Gaikwad", conductor: "S. Kadam", sched: "15:10", actual: "15:09", status: "On time" },
  { id: "TRP-90217", route: "BEST-AC-84", vehicle: "MH-01-LM-9034", driver: "R. Sawant", conductor: "M. Chavan", sched: "15:20", actual: "Ongoing", status: "Ongoing" },
];

const liveBuses = [
  { vehicle: "MH-12-AB-4421", route: "MSRTC-9502", speed: 78, nextStop: "Lonavala Ghat", eta: "6 min", delay: "+4 min" },
  { vehicle: "MH-02-JK-5561", route: "MSRTC-8801", speed: 64, nextStop: "Panvel Junction", eta: "12 min", delay: "On time" },
  { vehicle: "MH-01-LM-9034", route: "BEST-AC-84", speed: 28, nextStop: "Prabhadevi", eta: "3 min", delay: "On time" },
  { vehicle: "MH-14-GH-2290", route: "PMPML-56", speed: 41, nextStop: "Wakad Chowk", eta: "9 min", delay: "-2 min" },
];

const farePolicies = [
  { code: "FP-FIX-01", model: "Fixed", base: 350, rate: "Flat (Shivneri)", route: "MSRTC-9502", status: "Published" },
  { code: "FP-DIST-02", model: "Distance", base: 20, rate: "₹1.45/km", route: "MSRTC-7714", status: "Published" },
  { code: "FP-ZONE-03", model: "Zone", base: 15, rate: "Zone matrix", route: "MSRTC-8801", status: "Simulated" },
  { code: "FP-DIST-04", model: "Distance", base: 8, rate: "₹2.00/km", route: "BEST-A-1", status: "Published" },
  { code: "FP-DIST-05", model: "Distance", base: 10, rate: "₹2.50/km", route: "PMPML-56", status: "Published" },
];

const concessions = [
  { name: "Student", discount: "50%", proof: "Institution ID" },
  { name: "Senior citizen", discount: "30%", proof: "Age proof (Aadhaar)" },
  { name: "Divyang (disabled)", discount: "75%", proof: "UDID certificate" },
  { name: "Freedom fighter", discount: "100%", proof: "Sainik Board certificate" },
  { name: "Maharashtra women (Local, city routes)", discount: "50%", proof: "None — scheme-wide" },
];

const tickets = [
  { ref: "BK-914481", trip: "TRP-90213", channel: "ETM", passenger: "Walk-in", fare: 350, status: "Confirmed" },
  { ref: "BK-914482", trip: "TRP-90215", channel: "Mobile app", passenger: "A. Deshmukh", fare: 285, status: "Confirmed" },
  { ref: "BK-914483", trip: "TRP-90214", channel: "Counter", passenger: "S. Naik", fare: 36, status: "Cancelled" },
  { ref: "BK-914484", trip: "TRP-90216", channel: "Web portal", passenger: "R. Iyer", fare: 42, status: "Confirmed" },
  { ref: "BK-914485", trip: "TRP-90217", channel: "ETM", passenger: "Walk-in", fare: 20, status: "Voided" },
];

const passes = [
  { number: "PASS-51021", type: "Monthly (BEST Local)", holder: "G. Vaidya", validTo: "31 Aug 2026", status: "Active" },
  { number: "PASS-51022", type: "Student quarterly (PMPML)", holder: "T. Kale", validTo: "14 Sep 2026", status: "Active" },
  { number: "PASS-51023", type: "Senior citizen annual (MSRTC)", holder: "P. Joshi", validTo: "02 Feb 2027", status: "Pending verification" },
  { number: "PASS-51024", type: "Corporate (Shivneri)", holder: "Infosys Hinjawadi", validTo: "30 Jun 2026", status: "Expired" },
];

const seatMap = Array.from({ length: 40 }, (_, i) => ({
  seat: `${Math.floor(i / 4) + 1}${["A", "B", "C", "D"][i % 4]}`,
  status: ["booked", "booked", "available", "available", "available", "held"][i % 6],
}));

const etmDevices = [
  { id: "ETM-6671", conductor: "R. Kulkarni", depot: "MSRTC-PUN-01", battery: 82, connectivity: "online", printer: "ok", lastSync: "2 min ago" },
  { id: "ETM-6672", conductor: "A. Shinde", depot: "BEST-MUM-04", battery: 34, connectivity: "offline", printer: "low_paper", lastSync: "38 min ago" },
  { id: "ETM-6673", conductor: "P. Bhosale", depot: "MSRTC-MUM-03", battery: 91, connectivity: "online", printer: "ok", lastSync: "just now" },
  { id: "ETM-6674", conductor: "S. Kadam", depot: "PMPML-PUN-02", battery: 58, connectivity: "online", printer: "ok", lastSync: "5 min ago" },
];

const revenueTrend = [
  { day: "Mon", revenue: 1560 }, { day: "Tue", revenue: 1610 }, { day: "Wed", revenue: 1490 },
  { day: "Thu", revenue: 1720 }, { day: "Fri", revenue: 1980 }, { day: "Sat", revenue: 2260 }, { day: "Sun", revenue: 2040 },
];

const fleetStatus = [
  { name: "Active", value: 256, color: CHART_COLORS.green },
  { name: "Maintenance", value: 29, color: CHART_COLORS.amber },
  { name: "Breakdown", value: 9, color: CHART_COLORS.red },
  { name: "Retired", value: 7, color: CHART_COLORS.gray },
];

const depotRevenue = depots.map((d) => ({ name: d.code.split("-").slice(0, 2).join("-"), revenue: Math.round(d.revenueToday / 1000) }));

const collections = [
  { depot: "MSRTC-PUN-01", declared: 612400, deposited: 612400, discrepancy: 0 },
  { depot: "BEST-MUM-04", declared: 398600, deposited: 395100, discrepancy: -3500 },
  { depot: "PMPML-PUN-02", declared: 271500, deposited: 271500, discrepancy: 0 },
  { depot: "MSRTC-MUM-03", declared: 349800, deposited: 346900, discrepancy: -2900 },
];

const walletTxns = [
  { ref: "WTX-88410", passenger: "A. Deshmukh", type: "Recharge", amount: 500, mode: "UPI" },
  { ref: "WTX-88411", passenger: "G. Vaidya", type: "Debit", amount: -36, mode: "Wallet" },
  { ref: "WTX-88412", passenger: "T. Kale", type: "Refund", amount: 42, mode: "Wallet" },
  { ref: "WTX-88413", passenger: "R. Iyer", type: "Cashback", amount: 15, mode: "Promo" },
];

const complaints = [
  { id: "CMP-7721", category: "Conductor behaviour", trip: "TRP-90213", status: "In progress", sla: "4h left" },
  { id: "CMP-7722", category: "Delay (Shivneri)", trip: "TRP-90214", status: "Open", sla: "1h left" },
  { id: "CMP-7723", category: "Cleanliness", trip: "TRP-90215", status: "Resolved", sla: "—" },
  { id: "CMP-7724", category: "Fare dispute", trip: "TRP-90216", status: "Escalated", sla: "Overdue" },
];

const onTimeByDepot = [
  { name: "PUN-01", pct: 91 }, { name: "MUM-04", pct: 82 }, { name: "PUN-02", pct: 88 },
  { name: "MUM-03", pct: 94 }, { name: "MUM-07", pct: 85 },
];

const channelSplit = [
  { name: "ETM", value: 44, color: CHART_COLORS.blue },
  { name: "Mobile app", value: 31, color: CHART_COLORS.green },
  { name: "Counter", value: 15, color: CHART_COLORS.amber },
  { name: "Web portal", value: 10, color: CHART_COLORS.gray },
];

const users = [
  { name: "Depot Manager – Pune ST", role: "Depot Manager", depot: "MSRTC-PUN-01", status: "Active" },
  { name: "Control Room Ops (Mumbai)", role: "Control Room Operator", depot: "All depots", status: "Active" },
  { name: "Finance Officer – BEST Mumbai", role: "Finance Officer", depot: "BEST-MUM-04", status: "Active" },
  { name: "System Admin", role: "System Administrator", depot: "All depots", status: "Active" },
  { name: "Route Planner – PMPML Pune", role: "Route/Traffic Manager", depot: "PMPML-PUN-02", status: "Suspended" },
];

const regions = [
  { code: "REG-PUN", name: "Pune Region", divisions: 3, depots: 18, fleet: 612 },
  { code: "REG-MUM", name: "Mumbai Region", divisions: 2, depots: 11, fleet: 348 },
  { code: "REG-NAS", name: "Nashik Region", divisions: 2, depots: 9, fleet: 241 },
];

const divisions = [
  { code: "DIV-PUN-01", name: "Pune Division", region: "REG-PUN", depots: 7 },
  { code: "DIV-PUN-02", name: "Solapur Division", region: "REG-PUN", depots: 6 },
  { code: "DIV-MUM-01", name: "Mumbai Division", region: "REG-MUM", depots: 5 },
  { code: "DIV-MUM-02", name: "Thane Division", region: "REG-MUM", depots: 6 },
];

const busStations = [
  { code: "BS-PUN-SWG", name: "Swargate Bus Station", depot: "MSRTC-PUN-01", platforms: 14, footfall: "38,000/day" },
  { code: "BS-MUM-CST", name: "Mumbai Central Bus Terminus", depot: "MSRTC-MUM-03", platforms: 10, footfall: "22,500/day" },
  { code: "BS-MUM-COL", name: "Colaba Bus Depot Stand", depot: "BEST-MUM-07", platforms: 6, footfall: "9,200/day" },
];

const workshops = [
  { code: "WS-PUN-01", name: "Swargate Central Workshop", depot: "MSRTC-PUN-01", bays: 12, activeJobs: 7 },
  { code: "WS-MUM-04", name: "Wadala Repair Workshop", depot: "BEST-MUM-04", bays: 8, activeJobs: 5 },
  { code: "WS-PUN-02", name: "PMPML Swargate Workshop", depot: "PMPML-PUN-02", bays: 6, activeJobs: 2 },
];

const parkingYards = [
  { code: "PY-PUN-01", name: "Swargate Overnight Yard", depot: "MSRTC-PUN-01", capacity: 110, occupied: 88 },
  { code: "PY-MUM-04", name: "Wadala Parking Yard", depot: "BEST-MUM-04", capacity: 85, occupied: 74 },
  { code: "PY-MUM-07", name: "Colaba Parking Yard", depot: "BEST-MUM-07", capacity: 52, occupied: 40 },
];

const stops = [
  { code: "STP-0142", name: "Lonavala Ghat", route: "MSRTC-9502", seq: 4 },
  { code: "STP-0143", name: "Panvel Junction", route: "MSRTC-8801", seq: 6 },
  { code: "STP-0144", name: "Prabhadevi", route: "BEST-AC-84", seq: 9 },
  { code: "STP-0145", name: "Wakad Chowk", route: "PMPML-56", seq: 3 },
];

const stages = [
  { code: "STG-01", route: "MSRTC-7714", name: "Pune – Chakan", km: 22 },
  { date: "15 Aug 2026", name: "Independence Day", type: "National" },
  { code: "STG-02", route: "MSRTC-7714", name: "Chakan – Sangamner", km: 88 },
  { code: "STG-03", route: "BEST-A-1", name: "Colaba – Worli", km: 8 },
];

const zones = [
  { code: "ZN-01", name: "Zone A · City core", districts: "Colaba, Fort, Marine Lines" },
  { code: "ZN-02", name: "Zone B · Western suburbs", districts: "Bandra, Andheri, Borivali" },
  { code: "ZN-03", name: "Zone C · Pune metro", districts: "Swargate, Hinjawadi, Wakad" },
];

const ticketTypes = [
  { code: "TT-ADULT", name: "Adult full fare", desc: "Standard passenger fare" },
  { code: "TT-CHILD", name: "Child (5–12 yrs)", desc: "50% of adult fare" },
  { code: "TT-LUGGAGE", name: "Luggage ticket", desc: "Excess luggage surcharge" },
  { code: "TT-GROUP", name: "Group booking", desc: "10+ passengers, single trip" },
];

const paymentModes = [
  { code: "PM-CASH", name: "Cash", status: "Active" },
  { code: "PM-UPI", name: "UPI", status: "Active" },
  { code: "PM-WALLET", name: "Transit wallet", status: "Active" },
  { code: "PM-CARD", name: "Debit / credit card", status: "Active" },
  { code: "PM-NETBANK", name: "Net banking", status: "Disabled" },
];

const vehicleCategories = [
  { code: "VC-SHIV", name: "AC Shivneri", capacity: 42, class: "Luxury" },
  { code: "VC-EXP", name: "Express (ST)", capacity: 52, class: "Standard" },
  { code: "VC-ORD", name: "Ordinary Local", capacity: 58, class: "Standard" },
  { code: "VC-DD", name: "Double-decker", capacity: 96, class: "City" },
];

const seatLayouts = [
  { code: "SL-2X2-42", name: "2x2 pushback, 42 seat", category: "VC-SHIV" },
  { code: "SL-3X2-52", name: "3x2 seating, 52 seat", category: "VC-EXP" },
  { code: "SL-3X2-58", name: "3x2 seating, 58 seat", category: "VC-ORD" },
];

const holidays = [
  { date: "15 Aug 2026", name: "Independence Day", type: "National" },
  { date: "27 Aug 2026", name: "Ganesh Chaturthi", type: "Regional" },
  { date: "02 Oct 2026", name: "Gandhi Jayanti", type: "National" },
];

const notificationTemplates = [
  { code: "NT-DELAY", name: "Trip delay alert", channel: "SMS + Push" },
  { code: "NT-CONFIRM", name: "Booking confirmation", channel: "SMS + Email" },
  { code: "NT-REFUND", name: "Refund processed", channel: "Push" },
];

const complaintCategories = [
  { code: "CC-BEHAV", name: "Conductor / driver behaviour", sla: "8h" },
  { code: "CC-DELAY", name: "Trip delay", sla: "4h" },
  { code: "CC-CLEAN", name: "Cleanliness", sla: "24h" },
  { code: "CC-FARE", name: "Fare dispute", sla: "12h" },
];

const taxConfig = [
  { code: "TX-GST5", name: "GST — Local city service", rate: "5%" },
  { code: "TX-GST12", name: "GST — AC / Luxury service", rate: "12%" },
  { code: "TX-CESS", name: "State road cess", rate: "1%" },
];

const employees = [
  { id: "EMP-2201", name: "S. Jadhav", role: "Driver", depot: "MSRTC-PUN-01", shift: "Morning (06:00–14:00)", status: "On duty" },
  { id: "EMP-2202", name: "R. Kulkarni", role: "Conductor", depot: "MSRTC-PUN-01", shift: "Morning (06:00–14:00)", status: "On duty" },
  { id: "EMP-2203", name: "V. Pawar", role: "Driver", depot: "BEST-MUM-04", shift: "Evening (14:00–22:00)", status: "On leave" },
  { id: "EMP-2204", name: "N. Gaikwad", role: "Inspector", depot: "PMPML-PUN-02", shift: "General (09:00–18:00)", status: "On duty" },
  { id: "EMP-2205", name: "M. Chavan", role: "Conductor", depot: "BEST-MUM-07", shift: "Evening (14:00–22:00)", status: "On duty" },
  { id: "EMP-2206", name: "P. Joshi", role: "Admin staff", depot: "MSRTC-MUM-03", shift: "General (09:00–18:00)", status: "Absent" },
];

const attendanceSummary = [
  { day: "Mon", present: 612 }, { day: "Tue", present: 605 }, { day: "Wed", present: 598 },
  { day: "Thu", present: 618 }, { day: "Fri", present: 601 }, { day: "Sat", present: 588 }, { day: "Sun", present: 561 },
];

const reservations = [
  { pnr: "RSV-33810", trip: "TRP-90213", passenger: "K. Bhagat", seat: "12A", boarding: "Swargate", status: "Confirmed" },
  { pnr: "RSV-33811", trip: "TRP-90213", passenger: "S. Rane", seat: "12B", boarding: "Swargate", status: "Confirmed" },
  { pnr: "RSV-33812", trip: "TRP-90215", passenger: "A. Wagh", seat: "8C", boarding: "Mumbai Central", status: "Waitlisted" },
  { pnr: "RSV-33813", trip: "TRP-90217", passenger: "J. Fernandes", seat: "4A", boarding: "Colaba", status: "Confirmed" },
];

const boardingPoints = [
  { name: "Swargate", route: "MSRTC-9502", time: "14:30" },
  { name: "Katraj", route: "MSRTC-9502", time: "14:45" },
  { name: "Mumbai Central", route: "MSRTC-8801", time: "15:00" },
];

const occupancyTrend = [
  { day: "Mon", pct: 74 }, { day: "Tue", pct: 71 }, { day: "Wed", pct: 69 },
  { day: "Thu", pct: 76 }, { day: "Fri", pct: 88 }, { day: "Sat", pct: 94 }, { day: "Sun", pct: 90 },
];

const passengerTrends = [
  { month: "Mar", passengers: 412 }, { month: "Apr", passengers: 438 }, { month: "May", passengers: 401 },
  { month: "Jun", passengers: 455 }, { month: "Jul", passengers: 472 }, { month: "Aug", passengers: 460 },
];

const faqs = [
  { q: "How do I reassign a vehicle to a different depot?", a: "Go to Fleet, open the vehicle record, and update its home depot field. The change is logged for audit." },
  { q: "Why is an ETM device shown as offline?", a: "The device hasn't synced within the last 15 minutes. Tickets are still issued and queued for sync once connectivity returns." },
  { q: "How do refunds get settled for cancelled tickets?", a: "Refunds route through Finance & Wallet and post to the original payment mode within 3–5 working days." },
  { q: "Who can edit fare policies?", a: "Only users with the Finance Officer or System Administrator role, from Fare Management." },
];

/* ---------------------------------------------------------------------
   SHARED DATA STORE — enables Add / Update / Delete across screens.
--------------------------------------------------------------------- */
const initialData = {
  regions, divisions, depots, busStations, workshops, parkingYards,
  routes, stops, stages, zones, farePolicies, ticketTypes, paymentModes,
  vehicleCategories, seatLayouts, holidays: holidays.map((h, i) => ({ id: `HOL-${i + 1}`, ...h })),
  notificationTemplates, complaintCategories, taxConfig,
  vehicles, trips, employees,
  tickets, reservations, boardingPoints: boardingPoints.map((b, i) => ({ id: `BP-${i + 1}`, ...b })),
  passes, concessions: concessions.map((c, i) => ({ id: `CON-${i + 1}`, ...c })),
  etmDevices, collections: collections.map((c, i) => ({ id: `COL-${i + 1}`, ...c })), walletTxns,
  complaints, users: users.map((u, i) => ({ id: `USR-${i + 1}`, ...u })),
  attendanceSummary,
};

function dataReducer(state: any, action: any) {
  switch (action.type) {
    case "add":
      return { ...state, [action.col]: [...state[action.col], action.item] };
    case "update":
      return {
        ...state,
        [action.col]: state[action.col].map((r: any) => (r[action.idKey] === action.matchId ? action.item : r)),
      };
    case "remove":
      return { ...state, [action.col]: state[action.col].filter((r: any) => r[action.idKey] !== action.id) };
    default:
      return state;
  }
}

const DataContext = createContext<any>(null);

function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialData);
  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>;
}

function useCrud(col: string, idKey: string): [any[], { add: (item: any) => void, update: (matchId: any, item: any) => void, remove: (id: any) => void }] {
  const { state, dispatch } = useContext(DataContext);
  const data = state[col];
  return [
    data,
    {
      add: (item) => dispatch({ type: "add", col, item }),
      update: (matchId, item) => dispatch({ type: "update", col, idKey, matchId, item }),
      remove: (id) => dispatch({ type: "remove", col, idKey, id }),
    },
  ];
}

/* ---------------------------------------------------------------------
   TAB LAYOUT WRAPPERS (linked to nested Router URLs)
--------------------------------------------------------------------- */

function DashboardTabWrapper() {
  const [tripsData] = useCrud("trips", "id");
  return (
    <DashboardTab
      revenueTrend={revenueTrend}
      fleetStatus={fleetStatus}
      trips={tripsData}
      depotRevenue={depotRevenue}
    />
  );
}

function OrganizationLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabMap: Record<string, string> = {
    "/Organization/organizationManagement/Regions": "Regions",
    "/Organization/organizationManagement/Divisions": "Divisions",
    "/Organization/organizationManagement/Depots": "Depots",
    "/Organization/organizationManagement/BusStation": "Bus Stations",
    "/Organization/organizationManagement/Workshops": "Workshops",
    "/Organization/organizationManagement/ParkingYards": "Parking Yards",
  };

  const activeTab = tabMap[location.pathname] || "Depots";

  const handleTabChange = (tabName: string) => {
    const routeMap: Record<string, string> = {
      "Regions": "/Organization/organizationManagement/Regions",
      "Divisions": "/Organization/organizationManagement/Divisions",
      "Depots": "/Organization/organizationManagement/Depots",
      "Bus Stations": "/Organization/organizationManagement/BusStation",
      "Workshops": "/Organization/organizationManagement/Workshops",
      "Parking Yards": "/Organization/organizationManagement/ParkingYards",
    };
    navigate(routeMap[tabName]);
  };

  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ORG_UNIT · TBL_MAST_DEPOT" title="Organization management" />
      <SubTabs tabs={["Regions", "Divisions", "Depots", "Bus Stations", "Workshops", "Parking Yards"]} active={activeTab} onChange={handleTabChange} />
      <Outlet />
    </div>
  );
}

function MasterDataLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabMap: Record<string, string> = {
    "/Organization/masters/Route": "Routes",
    "/Organization/masters/Stop": "Stops",
    "/Organization/masters/Stages": "Stages",
    "/Organization/masters/zones": "Zones",
    "/Organization/masters/FarePolicies": "Fare Policies",
    "/Organization/masters/TicketTypes": "Ticket Types",
    "/Organization/masters/PaymentModes": "Payment Modes",
    "/Organization/masters/VehicleCategories": "Vehicle Categories",
    "/Organization/masters/SeatLayouts": "Seat Layouts",
    "/Organization/masters/HolidayCalendar": "Holiday Calendar",
    "/Organization/masters/NotificationTemplates": "Notification Templates",
    "/Organization/masters/ComplaintCategories": "Complaint Categories",
    "/Organization/masters/TaxConfiguration": "Tax Configuration",
  };

  const activeTab = tabMap[location.pathname] || "Routes";

  const handleTabChange = (tabName: string) => {
    const routeMap: Record<string, string> = {
      "Routes": "/Organization/masters/Route",
      "Stops": "/Organization/masters/Stop",
      "Stages": "/Organization/masters/Stages",
      "Zones": "/Organization/masters/zones",
      "Fare Policies": "/Organization/masters/FarePolicies",
      "Ticket Types": "/Organization/masters/TicketTypes",
      "Payment Modes": "/Organization/masters/PaymentModes",
      "Vehicle Categories": "/Organization/masters/VehicleCategories",
      "Seat Layouts": "/Organization/masters/SeatLayouts",
      "Holiday Calendar": "/Organization/masters/HolidayCalendar",
      "Notification Templates": "/Organization/masters/NotificationTemplates",
      "Complaint Categories": "/Organization/masters/ComplaintCategories",
      "Tax Configuration": "/Organization/masters/TaxConfiguration",
    };
    navigate(routeMap[tabName]);
  };

  return (
    <div>
      <SectionHeader eyebrow="Reference data used across scheduling, ticketing & fares" title="Master data" />
      <SubTabs
        tabs={[
          "Routes", "Stops", "Stages", "Zones", "Fare Policies", "Ticket Types", "Payment Modes",
          "Vehicle Categories", "Seat Layouts", "Holiday Calendar", "Notification Templates",
          "Complaint Categories", "Tax Configuration"
        ]}
        active={activeTab}
        onChange={handleTabChange}
      />
      <Outlet />
    </div>
  );
}

function RegionsTab() {
  const [regionsData, regionsCrud] = useCrud("regions", "code");
  return <Regions data={regionsData} onAdd={regionsCrud.add} onUpdate={regionsCrud.update} onDelete={regionsCrud.remove} />;
}
function DivisionsTab() {
  const [regionsData] = useCrud("regions", "code");
  const [divisionsData, divisionsCrud] = useCrud("divisions", "code");
  return <Divisions data={divisionsData} regionOptions={regionsData.map((r) => r.code)} onAdd={divisionsCrud.add} onUpdate={divisionsCrud.update} onDelete={divisionsCrud.remove} />;
}
function DepotsTab() {
  const [depotsData, depotsCrud] = useCrud("depots", "code");
  const [vehiclesData] = useCrud("vehicles", "reg");
  return <Depots depotsData={depotsData} vehiclesData={vehiclesData} onAddDepot={depotsCrud.add} onUpdateDepot={depotsCrud.update} onDeleteDepot={depotsCrud.remove} />;
}
function BusStationTab() {
  const [depotsData] = useCrud("depots", "code");
  const [busStationsData, busStationsCrud] = useCrud("busStations", "code");
  return <BusStation data={busStationsData} depotOptions={depotsData.map((d) => d.code)} onAdd={busStationsCrud.add} onUpdate={busStationsCrud.update} onDelete={busStationsCrud.remove} />;
}
function WorkshopsTab() {
  const [depotsData] = useCrud("depots", "code");
  const [workshopsData, workshopsCrud] = useCrud("workshops", "code");
  return <Workshops data={workshopsData} depotOptions={depotsData.map((d) => d.code)} onAdd={workshopsCrud.add} onUpdate={workshopsCrud.update} onDelete={workshopsCrud.remove} />;
}
function ParkingYardsTab() {
  const [depotsData] = useCrud("depots", "code");
  const [parkingYardsData, parkingYardsCrud] = useCrud("parkingYards", "code");
  return <ParkingYards data={parkingYardsData} depotOptions={depotsData.map((d) => d.code)} onAdd={parkingYardsCrud.add} onUpdate={parkingYardsCrud.update} onDelete={parkingYardsCrud.remove} />;
}

function RouteTab() {
  const [routesData, routesCrud] = useCrud("routes", "code");
  return <RouteMaster data={routesData} onAdd={routesCrud.add} onUpdate={routesCrud.update} onDelete={routesCrud.remove} />;
}
function StopTab() {
  const [routesData] = useCrud("routes", "code");
  const [stopsData, stopsCrud] = useCrud("stops", "code");
  return <Stop data={stopsData} routeOptions={routesData.map((r) => r.code)} onAdd={stopsCrud.add} onUpdate={stopsCrud.update} onDelete={stopsCrud.remove} />;
}
function StagesTab() {
  const [routesData] = useCrud("routes", "code");
  const [stagesData, stagesCrud] = useCrud("stages", "code");
  return <Stages data={stagesData} routeOptions={routesData.map((r) => r.code)} onAdd={stagesCrud.add} onUpdate={stagesCrud.update} onDelete={stagesCrud.remove} />;
}
function ZonesTab() {
  const [zonesData, zonesCrud] = useCrud("zones", "code");
  return <Zones data={zonesData} onAdd={zonesCrud.add} onUpdate={zonesCrud.update} onDelete={zonesCrud.remove} />;
}
function FarePoliciesTab() {
  const [routesData] = useCrud("routes", "code");
  const [farePoliciesData, farePoliciesCrud] = useCrud("farePolicies", "code");
  return <FarePolicies data={farePoliciesData} routeOptions={routesData.map((r) => r.code)} onAdd={farePoliciesCrud.add} onUpdate={farePoliciesCrud.update} onDelete={farePoliciesCrud.remove} />;
}
function TicketTypesTab() {
  const [ticketTypesData, ticketTypesCrud] = useCrud("ticketTypes", "code");
  return <TicketTypes data={ticketTypesData} onAdd={ticketTypesCrud.add} onUpdate={ticketTypesCrud.update} onDelete={ticketTypesCrud.remove} />;
}
function PaymentModesTab() {
  const [paymentModesData, paymentModesCrud] = useCrud("paymentModes", "code");
  return <PaymentModes data={paymentModesData} onAdd={paymentModesCrud.add} onUpdate={paymentModesCrud.update} onDelete={paymentModesCrud.remove} />;
}
function VehicleCategoriesTab() {
  const [vehicleCategoriesData, vehicleCategoriesCrud] = useCrud("vehicleCategories", "code");
  return <VehicleCategories data={vehicleCategoriesData} onAdd={vehicleCategoriesCrud.add} onUpdate={vehicleCategoriesCrud.update} onDelete={vehicleCategoriesCrud.remove} />;
}
function SeatLayoutsTab() {
  const [vehicleCategoriesData] = useCrud("vehicleCategories", "code");
  const [seatLayoutsData, seatLayoutsCrud] = useCrud("seatLayouts", "code");
  return <SeatLayouts data={seatLayoutsData} categoryOptions={vehicleCategoriesData.map((c) => c.code)} onAdd={seatLayoutsCrud.add} onUpdate={seatLayoutsCrud.update} onDelete={seatLayoutsCrud.remove} />;
}
function HolidayCalendarTab() {
  const [holidaysData, holidaysCrud] = useCrud("holidays", "id");
  const [, dispatch] = useContext(DataContext);
  return <HolidayCalendar data={holidaysData} onAdd={(v) => holidaysCrud.add({ id: `HOL-${Math.floor(Math.random() * 9000) + 1000}`, ...v })} onUpdate={holidaysCrud.update} onDelete={holidaysCrud.remove} />;
}
function NotificationTemplatesTab() {
  const [notificationTemplatesData, notificationTemplatesCrud] = useCrud("notificationTemplates", "code");
  return <NotificationTemplates data={notificationTemplatesData} onAdd={notificationTemplatesCrud.add} onUpdate={notificationTemplatesCrud.update} onDelete={notificationTemplatesCrud.remove} />;
}
function ComplaintCategoriesTab() {
  const [complaintCategoriesData, complaintCategoriesCrud] = useCrud("complaintCategories", "code");
  return <ComplaintCategories data={complaintCategoriesData} onAdd={complaintCategoriesCrud.add} onUpdate={complaintCategoriesCrud.update} onDelete={complaintCategoriesCrud.remove} />;
}
function TaxConfigurationTab() {
  const [taxConfigData, taxConfigCrud] = useCrud("taxConfig", "code");
  return <TaxConfiguration data={taxConfigData} onAdd={taxConfigCrud.add} onUpdate={taxConfigCrud.update} onDelete={taxConfigCrud.remove} />;
}

function FleetTab() {
  const [vehiclesData, vehiclesCrud] = useCrud("vehicles", "reg");
  const [depotsData] = useCrud("depots", "code");
  const underMaint = vehiclesData.filter((v) => v.status === "Under maintenance").length;
  const breakdowns = vehiclesData.filter((v) => v.status === "Breakdown").length;
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_VEHICLE · TBL_TRANS_VEHICLE_DOCUMENT · TBL_TRANS_MAINTENANCE_RECORD" title="Fleet management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total fleet" value={vehiclesData.length} icon={Bus} />
        <KpiCard label="Under maintenance" value={underMaint} icon={Wrench} tone="amber" />
        <KpiCard label="Breakdowns open" value={breakdowns} icon={AlertTriangle} tone="red" />
        <KpiCard label="Docs expiring ≤30d" value="17" icon={Clock} tone="amber" />
      </div>
      <VehicleRegister
        data={vehiclesData}
        depotOptions={depotsData.map((d) => d.code)}
        onAdd={vehiclesCrud.add}
        onUpdate={vehiclesCrud.update}
        onDelete={vehiclesCrud.remove}
      />
    </div>
  );
}

function EmployeesLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabMap: Record<string, string> = {
    "/Operations/employees/Roster": "Roster",
    "/Operations/employees/Attendance": "Attendance",
  };

  const activeTab = tabMap[location.pathname] || "Roster";

  const handleTabChange = (tabName: string) => {
    const routeMap: Record<string, string> = {
      "Roster": "/Operations/employees/Roster",
      "Attendance": "/Operations/employees/Attendance",
    };
    navigate(routeMap[tabName]);
  };

  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_EMPLOYEE · TBL_TRANS_ATTENDANCE · TBL_TRANS_DUTY_ROSTER" title="Employee management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total employees" value="1,842" icon={Users2} />
        <KpiCard label="On duty now" value="601" icon={UserCheck} tone="green" />
        <KpiCard label="On leave" value="34" icon={Clock} tone="amber" />
        <KpiCard label="Absent today" value="12" icon={AlertTriangle} tone="red" />
      </div>
      <SubTabs tabs={["Roster", "Attendance"]} active={activeTab} onChange={handleTabChange} />
      <Outlet />
    </div>
  );
}

function RosterTab() {
  const [employeesData] = useCrud("employees", "id");
  return <Roster data={employeesData} />;
}
function AttendanceTab() {
  return <Attendance data={attendanceSummary} />;
}

function RoutesScheduleTab() {
  const [routesData] = useCrud("routes", "code");
  const [tripsData] = useCrud("trips", "id");
  return <RoutesAndSchedule routes={routesData} trips={tripsData} />;
}
function LiveTrackingTab() {
  return <LiveTracking liveBuses={liveBuses} />;
}

function FaresTab() {
  const [farePoliciesData] = useCrud("farePolicies", "code");
  return <FareManagement farePolicies={farePoliciesData} concessions={concessions} />;
}
function TicketingTab() {
  const [ticketsData] = useCrud("tickets", "ref");
  return <Ticketing tickets={ticketsData} />;
}
function ReservationsTab() {
  const [reservationsData] = useCrud("reservations", "pnr");
  return <Reservations reservations={reservationsData} seatMap={seatMap} boardingPoints={boardingPoints} />;
}
function PassesTab() {
  const [passesData] = useCrud("passes", "number");
  return <Passes passes={passesData} />;
}

function EtmDevicesTab() {
  const [etmDevicesData] = useCrud("etmDevices", "id");
  return <EtmDevices etmDevices={etmDevicesData} />;
}
function FinanceWalletTab() {
  const [collectionsData] = useCrud("collections", "depot");
  return <FinanceWallet collections={collectionsData} walletTxns={walletTxns} />;
}

function SupportTab() {
  const [complaintsData] = useCrud("complaints", "id");
  return <ComplaintsAlerts complaints={complaintsData} />;
}
function ReportsTab() {
  return <Reports onTimeByDepot={onTimeByDepot} channelSplit={channelSplit} />;
}
function AnalyticsTab() {
  return <Analytics occupancyTrend={occupancyTrend} passengerTrends={passengerTrends} onTimeByDepot={onTimeByDepot} channelSplit={channelSplit} />;
}
function AdminTab() {
  const [usersData, usersCrud] = useCrud("users", "id");
  return <UsersRoles data={usersData} onUpdate={usersCrud.update} onDelete={usersCrud.remove} />;
}
function HelpTab() {
  return <Help faqs={faqs} />;
}

/* ---------------------------------------------------------------------
   NAVIGATION + SHELL
--------------------------------------------------------------------- */
const NAV = [
  { group: null, items: [{ id: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/" }] },
  {
    group: "Organization",
    items: [
      { id: "organization", label: "Organization", icon: Building2, path: "/Organization/organizationManagement/Depots" },
      { id: "masters", label: "Master Data", icon: Database, path: "/Organization/masters/Route" },
    ],
  },
  {
    group: "Operations",
    items: [
      { id: "fleet", label: "Fleet", icon: Bus, path: "/Operations/fleet/VehicleRegister" },
      { id: "employees", label: "Employees", icon: UserCog, path: "/Operations/employees/Roster" },
      { id: "routes", label: "Routes & Schedule", icon: Milestone, path: "/Operations/routesAndSchedule/RoutesAndSchedule" },
      { id: "tracking", label: "Live Tracking", icon: Radar, path: "/Operations/liveTracking/LiveTracking" },
    ],
  },
  {
    group: "Commercial",
    items: [
      { id: "fares", label: "Fare Management", icon: IndianRupee, path: "/Commercial/fareManagement/FareManagement" },
      { id: "ticketing", label: "Ticketing", icon: Ticket, path: "/Commercial/ticketing/Ticketing" },
      { id: "reservations", label: "Reservations", icon: CalendarCheck, path: "/Commercial/reservations/Reservations" },
      { id: "passes", label: "Passes", icon: Armchair, path: "/Commercial/passes/Passes" },
    ],
  },
  {
    group: "Systems",
    items: [
      { id: "etm", label: "ETM Devices", icon: Smartphone, path: "/Systems/etmDevices/EtmDevices" },
      { id: "finance", label: "Finance & Wallet", icon: Wallet, path: "/Systems/financeWallet/FinanceWallet" },
    ],
  },
  {
    group: "Support",
    items: [
      { id: "support", label: "Complaints & Alerts", icon: MessageSquareWarning, path: "/Support/complaintsAlerts/ComplaintsAlerts" },
      { id: "reports", label: "Reports", icon: BarChart3, path: "/Support/reports/Reports" },
      { id: "analytics", label: "Analytics", icon: LineChartIcon, path: "/Support/analytics/Analytics" },
      { id: "admin", label: "Users & Roles", icon: ShieldCheck, path: "/Support/usersRoles/UsersRoles" },
      { id: "help", label: "Help", icon: HelpCircle, path: "/Support/help/Help" },
    ],
  },
];

function ConsoleShell({ session, onLogout }: { session: any, onLogout: () => void }) {
  return (
    <div className="stc-body" style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden", background: T.canvas, color: T.text }}>
      <style>{fontStack}</style>

      <Sidebar nav={NAV} session={session} onLogout={onLogout} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Header />
        <main className="stc-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const PageFallback = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, fontSize: 14, color: T.textSoft }}>
    Loading section…
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function AuthGate() {
  const [session, setSession] = useState<any>({ name: "Guest Admin", role: "Super Admin", depot: "All depots" });
  const [, usersCrud] = useCrud("users", "id");

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<AdminAuthScreen onLogin={setSession} onAddUser={usersCrud.add} />} />
        <Route
          path="/"
          element={
            <ConsoleShell session={session || { name: "Guest Admin", role: "Super Admin", depot: "All depots" }} onLogout={() => setSession(null)} />
          }
        >
          <Route index element={<DashboardTabWrapper />} />
          
          {/* Organization Sub-Routes */}
          <Route path="Organization/organizationManagement" element={<OrganizationLayout />}>
            <Route index element={<Navigate to="Depots" replace />} />
            <Route path="Regions" element={<RegionsTab />} />
            <Route path="Divisions" element={<DivisionsTab />} />
            <Route path="Depots" element={<DepotsTab />} />
            <Route path="BusStation" element={<BusStationTab />} />
            <Route path="Workshops" element={<WorkshopsTab />} />
            <Route path="ParkingYards" element={<ParkingYardsTab />} />
          </Route>
          
          <Route path="Organization/masters" element={<MasterDataLayout />}>
            <Route index element={<Navigate to="Route" replace />} />
            <Route path="Route" element={<RouteTab />} />
            <Route path="Stop" element={<StopTab />} />
            <Route path="Stages" element={<StagesTab />} />
            <Route path="zones" element={<ZonesTab />} />
            <Route path="FarePolicies" element={<FarePoliciesTab />} />
            <Route path="TicketTypes" element={<TicketTypesTab />} />
            <Route path="PaymentModes" element={<PaymentModesTab />} />
            <Route path="VehicleCategories" element={<VehicleCategoriesTab />} />
            <Route path="SeatLayouts" element={<SeatLayoutsTab />} />
            <Route path="HolidayCalendar" element={<HolidayCalendarTab />} />
            <Route path="NotificationTemplates" element={<NotificationTemplatesTab />} />
            <Route path="ComplaintCategories" element={<ComplaintCategoriesTab />} />
            <Route path="TaxConfiguration" element={<TaxConfigurationTab />} />
          </Route>

          {/* Operations Sub-Routes */}
          <Route path="Operations/fleet/VehicleRegister" element={<FleetTab />} />
          <Route path="Operations/employees" element={<EmployeesLayout />}>
            <Route index element={<Navigate to="Roster" replace />} />
            <Route path="Roster" element={<RosterTab />} />
            <Route path="Attendance" element={<AttendanceTab />} />
          </Route>
          <Route path="Operations/routesAndSchedule/RoutesAndSchedule" element={<RoutesScheduleTab />} />
          <Route path="Operations/liveTracking/LiveTracking" element={<LiveTrackingTab />} />

          {/* Commercial Routes */}
          <Route path="Commercial/fareManagement/FareManagement" element={<FaresTab />} />
          <Route path="Commercial/ticketing/Ticketing" element={<TicketingTab />} />
          <Route path="Commercial/reservations/Reservations" element={<ReservationsTab />} />
          <Route path="Commercial/passes/Passes" element={<PassesTab />} />

          {/* Systems Routes */}
          <Route path="Systems/etmDevices/EtmDevices" element={<EtmDevicesTab />} />
          <Route path="Systems/financeWallet/FinanceWallet" element={<FinanceWalletTab />} />

          {/* Support Routes */}
          <Route path="Support/complaintsAlerts/ComplaintsAlerts" element={<SupportTab />} />
          <Route path="Support/reports/Reports" element={<ReportsTab />} />
          <Route path="Support/analytics/Analytics" element={<AnalyticsTab />} />
          <Route path="Support/usersRoles/UsersRoles" element={<AdminTab />} />
          <Route path="Support/help/Help" element={<HelpTab />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function TransitOpsConsole() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <BrowserRouter>
            <AuthGate />
          </BrowserRouter>
        </DataProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#112236",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "13px",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
