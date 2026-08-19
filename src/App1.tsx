// @ts-nocheck
import React, { useState, useMemo, useReducer, createContext, useContext } from "react";
import {
  LayoutDashboard, Building2, Bus, Milestone, Radar, Ticket, Armchair,
  Smartphone, Wallet, MessageSquareWarning, BarChart3, ShieldCheck,
  Search, Bell, ChevronDown, MapPin, Clock, AlertTriangle, CheckCircle2,
  XCircle, Fuel, Wrench, IndianRupee, Battery, Wifi, WifiOff, Printer,
  TrendingUp, Users2, ChevronRight, Circle, Database, UserCog, CalendarCheck,
  HelpCircle, Landmark, MapPinned, Warehouse, ParkingSquare, CalendarDays,
  Percent, FileText, Send, ClipboardList, UserCheck, LifeBuoy,
  LineChart as LineChartIcon, Plus, ChevronsUpDown, Pencil, Trash2, X,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Table } from "./components/common";

/* ---------------------------------------------------------------------
   DESIGN TOKENS
--------------------------------------------------------------------- */
const T = {
  ink: "#101B26",
  ink2: "#182634",
  inkBorder: "#26384A",
  canvas: "#EFEEE6",
  panel: "#FFFFFF",
  border: "#DEDBCF",
  text: "#16212B",
  textSoft: "#5B6672",
  textFaint: "#8B9098",
  amber: "#E5A339",
  amberDeep: "#8A5A14",
  amberFill: "#FBEBD1",
  green: "#2F8F5B",
  greenFill: "#E1F3E9",
  red: "#C6453B",
  redFill: "#FBE7E5",
  blue: "#3E7CB1",
  blueFill: "#E5EFF6",
  gray: "#8B9098",
  grayFill: "#EEEDE7",
};

const fontStack = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
  .stc-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
  .stc-body { font-family: 'IBM Plex Sans', sans-serif; }
  .stc-mono { font-family: 'IBM Plex Mono', monospace; }
  .stc-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .stc-scroll::-webkit-scrollbar-thumb { background: #C9C6B9; border-radius: 4px; }
  .stc-row:hover { background: #FAFAF6; }
  .stc-navitem { position: relative; }
  .stc-navitem.active::before {
    content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px;
    background: ${T.amber}; border-radius: 0;
  }
`;

/* ---------------------------------------------------------------------
   MOCK DATA — Maharashtra: MSRTC (State Transport / ST) + BEST & PMPML
   (City Local services for Mumbai and Pune). Shaped to mirror the DB schema.
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
  { name: "Active", value: 256, color: T.green },
  { name: "Maintenance", value: 29, color: T.amber },
  { name: "Breakdown", value: 9, color: T.red },
  { name: "Retired", value: 7, color: T.gray },
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
  { name: "ETM", value: 44, color: T.blue },
  { name: "Mobile app", value: 31, color: T.green },
  { name: "Counter", value: 15, color: T.amber },
  { name: "Web portal", value: 10, color: T.gray },
];

const users = [
  { name: "Depot Manager – Pune ST", role: "Depot Manager", depot: "MSRTC-PUN-01", status: "Active" },
  { name: "Control Room Ops (Mumbai)", role: "Control Room Operator", depot: "All depots", status: "Active" },
  { name: "Finance Officer – BEST Mumbai", role: "Finance Officer", depot: "BEST-MUM-04", status: "Active" },
  { name: "System Admin", role: "System Administrator", depot: "All depots", status: "Active" },
  { name: "Route Planner – PMPML Pune", role: "Route/Traffic Manager", depot: "PMPML-PUN-02", status: "Suspended" },
];

/* ---------------------------------------------------------------------
   MOCK DATA — Organization hierarchy, Master data, Employees,
   Reservations, Analytics, Help (BRD modules)
--------------------------------------------------------------------- */
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
   Every collection referenced below lives in one place so an edit made
   in, say, Fleet is reflected wherever vehicles are shown elsewhere.
--------------------------------------------------------------------- */
let __seq = 1000;
const nextId = (prefix) => `${prefix}-${__seq++}`;

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
};

function dataReducer(state, action) {
  switch (action.type) {
    case "add":
      return { ...state, [action.col]: [...state[action.col], action.item] };
    case "update":
      return {
        ...state,
        [action.col]: state[action.col].map((r) => (r[action.idKey] === action.matchId ? action.item : r)),
      };
    case "remove":
      return { ...state, [action.col]: state[action.col].filter((r) => r[action.idKey] !== action.id) };
    default:
      return state;
  }
}

const DataContext = createContext(null);

function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialData);
  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>;
}

function useCrud(col, idKey) {
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
   SMALL UI PRIMITIVES
--------------------------------------------------------------------- */
function RouteChip({ children }) {
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

function StatusBadge({ status }) {
  const map = {
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

function Card({ title, action, children, style }: { title?: any; action?: any; children: React.ReactNode; style?: any }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
          <h3 className="stc-display" style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {title}
          </h3>
          {action}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: any }) {
  return (
    <th style={{ textAlign: align || "left", fontSize: 11, fontWeight: 600, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.04em", padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
      {children}
    </th>
  );
}
function Td({ children, align, mono, colSpan }: { children: React.ReactNode; align?: any; mono?: any; colSpan?: any }) {
  return (
    <td colSpan={colSpan} className={mono ? "stc-mono" : ""} style={{ textAlign: align || "left", fontSize: 13, color: T.text, padding: "10px", borderBottom: `1px solid ${T.border}` }}>
      {children}
    </td>
  );
}

function KpiCard({ label, value, sub, icon: Icon, tone }: { label: any; value: any; sub?: any; icon?: any; tone?: any }) {
  const toneColor = tone === "amber" ? T.amberDeep : tone === "red" ? T.red : tone === "green" ? T.green : T.text;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 500 }}>{label}</span>
        <Icon size={16} color={T.textFaint} />
      </div>
      <span className="stc-display" style={{ fontSize: 28, fontWeight: 600, color: toneColor }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: T.textSoft }}>{sub}</span>}
    </div>
  );
}

function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            color: active === t ? T.amberDeep : T.textSoft,
            borderBottom: active === t ? `2px solid ${T.amber}` : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "36px 0", color: T.textFaint }}>
      <Icon size={22} />
      <span style={{ fontSize: 12 }}>{text}</span>
    </div>
  );
}

function Modal({ title, onClose, children, width }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(16,27,38,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.panel, borderRadius: 8, width: width || 460, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(16,27,38,0.35)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.panel }}>
          <h3 className="stc-display" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={17} color={T.textSoft} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ field, value, onChange, disabled }) {
  const common = {
    disabled,
    style: {
      width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13,
      fontFamily: "inherit", color: disabled ? T.textFaint : T.text, background: disabled ? T.canvas : T.panel, boxSizing: "border-box",
    },
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 5 }}>
        {field.label}
      </label>
      {field.type === "select" ? (
        <select {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          {...common}
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}

function RecordModal({ title, fields, initial, idKey, mode, onSave, onClose }) {
  const [values, setValues] = useState(() => {
    const v = { ...initial };
    fields.forEach((f) => {
      if (v[f.key] === undefined) v[f.key] = f.type === "number" ? 0 : (f.options ? f.options[0] : "");
    });
    return v;
  });
  return (
    <Modal title={title} onClose={onClose}>
      {fields.map((f) => (
        <FormField
          key={f.key}
          field={f}
          value={values[f.key]}
          disabled={mode === "edit" && f.key === idKey}
          onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
        />
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={() => onSave(values)} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.ink, color: T.inkText, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Save
        </button>
      </div>
    </Modal>
  );
}

function ConfirmModal({ title, message, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} width={380}>
      <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.5, margin: "0 0 18px" }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.red, color: T.panel, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Delete
        </button>
      </div>
    </Modal>
  );
}

/**
 * Generic Add / Edit / Delete table.
 * columns: [{ key, label, align, mono, chip, badge, currency, render(record) }]
 * fields:  form schema used for both Add and Edit — [{ key, label, type: 'text'|'number'|'select', options }]
 */
function CrudTable({ title, addLabel, data, idKey, columns, fields, onAdd, onUpdate, onDelete, empty, footer }) {
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  return (
    <Card
      title={title}
      action={
        <button
          onClick={() => setModal({ mode: "add" })}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
        >
          <Plus size={13} /> {addLabel || "Add"}
        </button>
      }
    >
      <Table>
        <thead>
          <tr>
            {columns.map((c) => <Th key={c.key} align={c.align}>{c.label}</Th>)}
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r[idKey]} className="stc-row">
              {columns.map((c) => (
                <Td key={c.key} align={c.align} mono={c.mono}>
                  {c.render
                    ? c.render(r)
                    : c.badge
                    ? <StatusBadge status={r[c.key]} />
                    : c.chip
                    ? <RouteChip>{r[c.key]}</RouteChip>
                    : c.currency
                    ? `₹${Number(r[c.key]).toLocaleString("en-IN")}`
                    : r[c.key]}
                </Td>
              ))}
              <Td align="right">
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setModal({ mode: "edit", record: r })} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                    <Pencil size={14} color={T.textSoft} />
                  </button>
                  <button onClick={() => setToDelete(r)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                    <Trash2 size={14} color={T.red} />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><Td colSpan={columns.length + 1}>{empty || "No records yet — use Add to create one."}</Td></tr>
          )}
        </tbody>
      </Table>
      {footer}
      {modal?.mode === "add" && (
        <RecordModal
          title={`Add — ${title}`}
          fields={fields}
          initial={{}}
          idKey={idKey}
          mode="add"
          onClose={() => setModal(null)}
          onSave={(v) => { onAdd(v); setModal(null); }}
        />
      )}
      {modal?.mode === "edit" && (
        <RecordModal
          title={`Edit — ${title}`}
          fields={fields}
          initial={modal.record}
          idKey={idKey}
          mode="edit"
          onClose={() => setModal(null)}
          onSave={(v) => { onUpdate(modal.record[idKey], v); setModal(null); }}
        />
      )}
      {toDelete && (
        <ConfirmModal
          title={`Delete — ${title}`}
          message={`This will permanently remove ${toDelete[idKey]} from the list. This can't be undone.`}
          onClose={() => setToDelete(null)}
          onConfirm={() => { onDelete(toDelete[idKey]); setToDelete(null); }}
        />
      )}
    </Card>
  );
}

function SectionHeader({ eyebrow, title, children }: { eyebrow: any; title: any; children?: any }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.amberDeep, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{eyebrow}</div>
        <h2 className="stc-display" style={{ fontSize: 24, fontWeight: 600, color: T.text, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------
   SECTIONS
--------------------------------------------------------------------- */
function Overview() {
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
                <Tooltip formatter={(v) => [`₹${v}K`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
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
                  {fleetStatus.map((f, i) => <Cell key={i} fill={f.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {fleetStatus.map((f) => (
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
          <Table>
            <tbody>
              {trips.filter((t) => t.status !== "On time").map((t) => (
                <tr key={t.id} className="stc-row">
                  <Td mono><RouteChip>{t.id}</RouteChip></Td>
                  <Td mono>{t.route}</Td>
                  <Td><StatusBadge status={t.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
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

function Organization() {
  const [tab, setTab] = useState("Depots");
  const [regionsData, regionsCrud] = useCrud("regions", "code");
  const [divisionsData, divisionsCrud] = useCrud("divisions", "code");
  const [depotsData] = useCrud("depots", "code");
  const [busStationsData, busStationsCrud] = useCrud("busStations", "code");
  const [workshopsData, workshopsCrud] = useCrud("workshops", "code");
  const [parkingYardsData, parkingYardsCrud] = useCrud("parkingYards", "code");

  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ORG_UNIT · TBL_MAST_DEPOT" title="Organization management" />
      <SubTabs tabs={["Regions", "Divisions", "Depots", "Bus Stations", "Workshops", "Parking Yards"]} active={tab} onChange={setTab} />

      {tab === "Regions" && (
        <CrudTable
          title="Regions" addLabel="Add region" data={regionsData} idKey="code"
          columns={[
            { key: "code", label: "Region", chip: true, mono: true },
            { key: "name", label: "Name" },
            { key: "divisions", label: "Divisions" },
            { key: "depots", label: "Depots" },
            { key: "fleet", label: "Fleet strength", align: "right", mono: true },
          ]}
          fields={[
            { key: "code", label: "Region code", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "divisions", label: "Divisions", type: "number" },
            { key: "depots", label: "Depots", type: "number" },
            { key: "fleet", label: "Fleet strength", type: "number" },
          ]}
          onAdd={regionsCrud.add} onUpdate={regionsCrud.update} onDelete={regionsCrud.remove}
        />
      )}
      {tab === "Divisions" && (
        <CrudTable
          title="Divisions" addLabel="Add division" data={divisionsData} idKey="code"
          columns={[
            { key: "code", label: "Division", chip: true, mono: true },
            { key: "name", label: "Name" },
            { key: "region", label: "Region", mono: true },
            { key: "depots", label: "Depots" },
          ]}
          fields={[
            { key: "code", label: "Division code", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "region", label: "Region", type: "select", options: regionsData.map((r) => r.code) },
            { key: "depots", label: "Depots", type: "number" },
          ]}
          onAdd={divisionsCrud.add} onUpdate={divisionsCrud.update} onDelete={divisionsCrud.remove}
        />
      )}
      {tab === "Bus Stations" && (
        <CrudTable
          title="Bus stations" addLabel="Add station" data={busStationsData} idKey="code"
          columns={[
            { key: "code", label: "Station", chip: true, mono: true },
            { key: "name", label: "Name" },
            { key: "depot", label: "Linked depot", mono: true },
            { key: "platforms", label: "Platforms" },
            { key: "footfall", label: "Daily footfall", align: "right" },
          ]}
          fields={[
            { key: "code", label: "Station code", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "depot", label: "Linked depot", type: "select", options: depotsData.map((d) => d.code) },
            { key: "platforms", label: "Platforms", type: "number" },
            { key: "footfall", label: "Daily footfall", type: "text" },
          ]}
          onAdd={busStationsCrud.add} onUpdate={busStationsCrud.update} onDelete={busStationsCrud.remove}
        />
      )}
      {tab === "Workshops" && (
        <CrudTable
          title="Workshops" addLabel="Add workshop" data={workshopsData} idKey="code"
          columns={[
            { key: "code", label: "Workshop", chip: true, mono: true },
            { key: "name", label: "Name" },
            { key: "depot", label: "Linked depot", mono: true },
            { key: "bays", label: "Bays" },
            { key: "activeJobs", label: "Active jobs", align: "right" },
          ]}
          fields={[
            { key: "code", label: "Workshop code", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "depot", label: "Linked depot", type: "select", options: depotsData.map((d) => d.code) },
            { key: "bays", label: "Bays", type: "number" },
            { key: "activeJobs", label: "Active jobs", type: "number" },
          ]}
          onAdd={workshopsCrud.add} onUpdate={workshopsCrud.update} onDelete={workshopsCrud.remove}
        />
      )}
      {tab === "Parking Yards" && (
        <CrudTable
          title="Parking yards" addLabel="Add yard" data={parkingYardsData} idKey="code"
          columns={[
            { key: "code", label: "Yard", chip: true, mono: true },
            { key: "name", label: "Name" },
            { key: "depot", label: "Linked depot", mono: true },
            { key: "capacity", label: "Capacity" },
            {
              key: "occupied", label: "Occupied", align: "right",
              render: (p) => (
                <span style={{ color: p.occupied / p.capacity > 0.85 ? T.amberDeep : T.text, fontWeight: 600 }}>
                  {p.occupied} ({Math.round((p.occupied / p.capacity) * 100)}%)
                </span>
              ),
            },
          ]}
          fields={[
            { key: "code", label: "Yard code", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "depot", label: "Linked depot", type: "select", options: depotsData.map((d) => d.code) },
            { key: "capacity", label: "Capacity", type: "number" },
            { key: "occupied", label: "Occupied", type: "number" },
          ]}
          onAdd={parkingYardsCrud.add} onUpdate={parkingYardsCrud.update} onDelete={parkingYardsCrud.remove}
        />
      )}
      {tab === "Depots" && <DepotsTab />}
    </div>
  );
}

function DepotsTab() {
  const [depotsData, depotsCrud] = useCrud("depots", "code");
  const [vehiclesData] = useCrud("vehicles", "reg");
  const [sel, setSel] = useState(depotsData[0]);
  const selected = depotsData.find((d) => d.code === sel?.code) || depotsData[0];
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const depotFields = [
    { key: "code", label: "Depot code", type: "text" },
    { key: "name", label: "Name", type: "text" },
    { key: "corp", label: "Corporation", type: "select", options: ["MSRTC", "BEST", "PMPML"] },
    { key: "service", label: "Service", type: "select", options: ["ST", "Local"] },
    { key: "zone", label: "Zone", type: "text" },
    { key: "fleet", label: "Fleet strength", type: "number" },
    { key: "onRoad", label: "On road", type: "number" },
    { key: "tripsToday", label: "Trips today", type: "number" },
    { key: "revenueToday", label: "Revenue today (₹)", type: "number" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12 }}>
        <Card
          title="Depots"
          action={
            <button onClick={() => setModal({ mode: "add" })} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}>
              <Plus size={13} /> Add depot
            </button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {depotsData.map((d) => (
              <div
                key={d.code}
                onClick={() => setSel(d)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                  padding: "10px 12px", borderRadius: 4, cursor: "pointer",
                  background: selected?.code === d.code ? T.amberFill : "transparent",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{d.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: d.service === "ST" ? T.blueFill : T.greenFill, color: d.service === "ST" ? T.blue : T.green }}>
                      {d.corp} · {d.service}
                    </span>
                  </div>
                  <div className="stc-mono" style={{ fontSize: 11, color: T.textSoft, marginTop: 2 }}>{d.code} · {d.zone}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={(e) => { e.stopPropagation(); setModal({ mode: "edit", record: d }); }} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                    <Pencil size={13} color={T.textSoft} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setToDelete(d); }} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                    <Trash2 size={13} color={T.red} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {selected && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
                <KpiCard label="Fleet strength" value={selected.fleet} icon={Bus} />
                <KpiCard label="On road" value={selected.onRoad} sub={`${Math.round((selected.onRoad / selected.fleet) * 100)}% utilisation`} icon={TrendingUp} tone="green" />
                <KpiCard label="Trips today" value={selected.tripsToday} icon={Milestone} />
                <KpiCard label="Revenue today" value={`₹${(selected.revenueToday / 1000).toFixed(1)}K`} icon={IndianRupee} tone="green" />
              </div>
              <Card title={`Fleet at ${selected.code} · managed from Fleet`}>
                <Table>
                  <thead><tr><Th>Registration</Th><Th>Category</Th><Th>Status</Th><Th>Next service / doc</Th></tr></thead>
                  <tbody>
                    {vehiclesData.filter((v) => v.depot === selected.code).map((v) => (
                      <tr key={v.reg} className="stc-row">
                        <Td mono><RouteChip>{v.reg}</RouteChip></Td>
                        <Td>{v.category}</Td>
                        <Td><StatusBadge status={v.status} /></Td>
                        <Td>{v.nextService === "In progress" || v.nextService === "Awaiting spare" ? v.nextService : v.docExpiry}</Td>
                      </tr>
                    ))}
                    {vehiclesData.filter((v) => v.depot === selected.code).length === 0 && (
                      <tr><Td>No vehicles homed at this depot.</Td></tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </>
          )}
        </div>
      </div>
      {modal?.mode === "add" && (
        <RecordModal title="Add — Depot" fields={depotFields} initial={{}} idKey="code" mode="add" onClose={() => setModal(null)} onSave={(v) => { depotsCrud.add(v); setModal(null); setSel(v); }} />
      )}
      {modal?.mode === "edit" && (
        <RecordModal title="Edit — Depot" fields={depotFields} initial={modal.record} idKey="code" mode="edit" onClose={() => setModal(null)} onSave={(v) => { depotsCrud.update(modal.record.code, v); setModal(null); setSel(v); }} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete — Depot"
          message={`This will permanently remove ${toDelete.code} from the list. This can't be undone.`}
          onClose={() => setToDelete(null)}
          onConfirm={() => { depotsCrud.remove(toDelete.code); if (selected?.code === toDelete.code) setSel(depotsData.find((d) => d.code !== toDelete.code)); setToDelete(null); }}
        />
      )}
    </div>
  );
}

function Fleet() {
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
      <CrudTable
        title="Vehicle register" addLabel="Add vehicle" data={vehiclesData} idKey="reg"
        columns={[
          { key: "reg", label: "Registration", chip: true, mono: true },
          { key: "category", label: "Category" },
          { key: "depot", label: "Home depot", mono: true },
          { key: "status", label: "Status", badge: true },
          {
            key: "nextService", label: "Next service / doc",
            render: (v) => (v.nextService === "In progress" || v.nextService === "Awaiting spare" ? v.nextService : v.docExpiry),
          },
        ]}
        fields={[
          { key: "reg", label: "Registration", type: "text" },
          { key: "category", label: "Category", type: "text" },
          { key: "depot", label: "Home depot", type: "select", options: depotsData.map((d) => d.code) },
          { key: "status", label: "Status", type: "select", options: ["Active", "Under maintenance", "Breakdown", "Retired"] },
          { key: "nextService", label: "Next service", type: "text" },
          { key: "docExpiry", label: "Document expiry", type: "text" },
        ]}
        onAdd={vehiclesCrud.add} onUpdate={vehiclesCrud.update} onDelete={vehiclesCrud.remove}
      />
    </div>
  );
}

function MasterData() {
  const [tab, setTab] = useState("Routes");
  const TABS = ["Routes", "Stops", "Stages", "Zones", "Fare Policies", "Ticket Types", "Payment Modes", "Vehicle Categories", "Seat Layouts", "Holiday Calendar", "Notification Templates", "Complaint Categories", "Tax Configuration"];

  const [routesData, routesCrud] = useCrud("routes", "code");
  const [stopsData, stopsCrud] = useCrud("stops", "code");
  const [stagesData, stagesCrud] = useCrud("stages", "code");
  const [zonesData, zonesCrud] = useCrud("zones", "code");
  const [farePoliciesData, farePoliciesCrud] = useCrud("farePolicies", "code");
  const [ticketTypesData, ticketTypesCrud] = useCrud("ticketTypes", "code");
  const [paymentModesData, paymentModesCrud] = useCrud("paymentModes", "code");
  const [vehicleCategoriesData, vehicleCategoriesCrud] = useCrud("vehicleCategories", "code");
  const [seatLayoutsData, seatLayoutsCrud] = useCrud("seatLayouts", "code");
  const [holidaysData, holidaysCrud] = useCrud("holidays", "id");
  const [notificationTemplatesData, notificationTemplatesCrud] = useCrud("notificationTemplates", "code");
  const [complaintCategoriesData, complaintCategoriesCrud] = useCrud("complaintCategories", "code");
  const [taxConfigData, taxConfigCrud] = useCrud("taxConfig", "code");

  return (
    <div>
      <SectionHeader eyebrow="Reference data used across scheduling, ticketing & fares" title="Master data" />
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Routes" && (
        <CrudTable
          title="Route master" addLabel="Add route" data={routesData} idKey="code"
          columns={[
            { key: "code", label: "Route", chip: true, mono: true, render: (r) => (<><RouteChip>{r.code}</RouteChip><div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>{r.name}</div></>) },
            { key: "service", label: "Service" }, { key: "type", label: "Type" }, { key: "distance", label: "Distance" }, { key: "fareModel", label: "Fare model" },
          ]}
          fields={[
            { key: "code", label: "Route code", type: "text" }, { key: "name", label: "Name", type: "text" },
            { key: "service", label: "Service", type: "select", options: ["ST", "Local"] },
            { key: "type", label: "Type", type: "select", options: ["Luxury", "Express", "Ordinary", "City"] },
            { key: "distance", label: "Distance", type: "text" },
            { key: "fareModel", label: "Fare model", type: "select", options: ["Fixed", "Distance", "Zone"] },
            { key: "duration", label: "Duration", type: "text" },
          ]}
          onAdd={routesCrud.add} onUpdate={routesCrud.update} onDelete={routesCrud.remove}
        />
      )}
      {tab === "Stops" && (
        <CrudTable
          title="Stop master" addLabel="Add stop" data={stopsData} idKey="code"
          columns={[{ key: "code", label: "Stop code", mono: true }, { key: "name", label: "Name" }, { key: "route", label: "Route", mono: true }, { key: "seq", label: "Sequence", align: "right" }]}
          fields={[
            { key: "code", label: "Stop code", type: "text" }, { key: "name", label: "Name", type: "text" },
            { key: "route", label: "Route", type: "select", options: routesData.map((r) => r.code) },
            { key: "seq", label: "Sequence", type: "number" },
          ]}
          onAdd={stopsCrud.add} onUpdate={stopsCrud.update} onDelete={stopsCrud.remove}
        />
      )}
      {tab === "Stages" && (
        <CrudTable
          title="Stage master" addLabel="Add stage" data={stagesData} idKey="code"
          columns={[{ key: "code", label: "Stage code", mono: true }, { key: "route", label: "Route", mono: true }, { key: "name", label: "Section" }, { key: "km", label: "Distance (km)", align: "right" }]}
          fields={[
            { key: "code", label: "Stage code", type: "text" },
            { key: "route", label: "Route", type: "select", options: routesData.map((r) => r.code) },
            { key: "name", label: "Section", type: "text" }, { key: "km", label: "Distance (km)", type: "number" },
          ]}
          onAdd={stagesCrud.add} onUpdate={stagesCrud.update} onDelete={stagesCrud.remove}
        />
      )}
      {tab === "Zones" && (
        <CrudTable
          title="Fare zones" addLabel="Add zone" data={zonesData} idKey="code"
          columns={[{ key: "code", label: "Zone", chip: true, mono: true }, { key: "name", label: "Name" }, { key: "districts", label: "Districts covered" }]}
          fields={[{ key: "code", label: "Zone code", type: "text" }, { key: "name", label: "Name", type: "text" }, { key: "districts", label: "Districts covered", type: "text" }]}
          onAdd={zonesCrud.add} onUpdate={zonesCrud.update} onDelete={zonesCrud.remove}
        />
      )}
      {tab === "Fare Policies" && (
        <CrudTable
          title="Fare policies" addLabel="Add policy" data={farePoliciesData} idKey="code"
          columns={[
            { key: "code", label: "Policy", chip: true, mono: true }, { key: "model", label: "Model" },
            { key: "baseRate", label: "Base / rate", render: (f) => `₹${f.base} base · ${f.rate}` },
            { key: "route", label: "Route", mono: true }, { key: "status", label: "Status", badge: true },
          ]}
          fields={[
            { key: "code", label: "Policy code", type: "text" },
            { key: "model", label: "Model", type: "select", options: ["Fixed", "Distance", "Zone"] },
            { key: "base", label: "Base fare (₹)", type: "number" }, { key: "rate", label: "Rate description", type: "text" },
            { key: "route", label: "Route", type: "select", options: routesData.map((r) => r.code) },
            { key: "status", label: "Status", type: "select", options: ["Published", "Simulated", "Draft"] },
          ]}
          onAdd={farePoliciesCrud.add} onUpdate={farePoliciesCrud.update} onDelete={farePoliciesCrud.remove}
        />
      )}
      {tab === "Ticket Types" && (
        <CrudTable
          title="Ticket types" addLabel="Add type" data={ticketTypesData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Name" }, { key: "desc", label: "Description" }]}
          fields={[{ key: "code", label: "Code", type: "text" }, { key: "name", label: "Name", type: "text" }, { key: "desc", label: "Description", type: "text" }]}
          onAdd={ticketTypesCrud.add} onUpdate={ticketTypesCrud.update} onDelete={ticketTypesCrud.remove}
        />
      )}
      {tab === "Payment Modes" && (
        <CrudTable
          title="Payment modes" addLabel="Add mode" data={paymentModesData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Name" }, { key: "status", label: "Status", badge: true }]}
          fields={[
            { key: "code", label: "Code", type: "text" }, { key: "name", label: "Name", type: "text" },
            { key: "status", label: "Status", type: "select", options: ["Active", "Disabled"] },
          ]}
          onAdd={paymentModesCrud.add} onUpdate={paymentModesCrud.update} onDelete={paymentModesCrud.remove}
        />
      )}
      {tab === "Vehicle Categories" && (
        <CrudTable
          title="Vehicle categories" addLabel="Add category" data={vehicleCategoriesData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Name" }, { key: "capacity", label: "Capacity", align: "right" }, { key: "class", label: "Class" }]}
          fields={[
            { key: "code", label: "Code", type: "text" }, { key: "name", label: "Name", type: "text" },
            { key: "capacity", label: "Capacity", type: "number" },
            { key: "class", label: "Class", type: "select", options: ["Luxury", "Standard", "City"] },
          ]}
          onAdd={vehicleCategoriesCrud.add} onUpdate={vehicleCategoriesCrud.update} onDelete={vehicleCategoriesCrud.remove}
        />
      )}
      {tab === "Seat Layouts" && (
        <CrudTable
          title="Seat layouts" addLabel="Add layout" data={seatLayoutsData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Layout" }, { key: "category", label: "Vehicle category", mono: true }]}
          fields={[
            { key: "code", label: "Code", type: "text" }, { key: "name", label: "Layout description", type: "text" },
            { key: "category", label: "Vehicle category", type: "select", options: vehicleCategoriesData.map((v) => v.code) },
          ]}
          onAdd={seatLayoutsCrud.add} onUpdate={seatLayoutsCrud.update} onDelete={seatLayoutsCrud.remove}
        />
      )}
      {tab === "Holiday Calendar" && (
        <CrudTable
          title="Holiday calendar" addLabel="Add holiday" data={holidaysData} idKey="id"
          columns={[{ key: "date", label: "Date", mono: true }, { key: "name", label: "Occasion" }, { key: "type", label: "Type" }]}
          fields={[
            { key: "date", label: "Date", type: "text" }, { key: "name", label: "Occasion", type: "text" },
            { key: "type", label: "Type", type: "select", options: ["National", "Regional"] },
          ]}
          onAdd={(v) => holidaysCrud.add({ id: nextId("HOL"), ...v })} onUpdate={holidaysCrud.update} onDelete={holidaysCrud.remove}
        />
      )}
      {tab === "Notification Templates" && (
        <CrudTable
          title="Notification templates" addLabel="Add template" data={notificationTemplatesData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Name" }, { key: "channel", label: "Channel" }]}
          fields={[{ key: "code", label: "Code", type: "text" }, { key: "name", label: "Name", type: "text" }, { key: "channel", label: "Channel", type: "text" }]}
          onAdd={notificationTemplatesCrud.add} onUpdate={notificationTemplatesCrud.update} onDelete={notificationTemplatesCrud.remove}
        />
      )}
      {tab === "Complaint Categories" && (
        <CrudTable
          title="Complaint categories" addLabel="Add category" data={complaintCategoriesData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Category" }, { key: "sla", label: "SLA" }]}
          fields={[{ key: "code", label: "Code", type: "text" }, { key: "name", label: "Category", type: "text" }, { key: "sla", label: "SLA", type: "text" }]}
          onAdd={complaintCategoriesCrud.add} onUpdate={complaintCategoriesCrud.update} onDelete={complaintCategoriesCrud.remove}
        />
      )}
      {tab === "Tax Configuration" && (
        <CrudTable
          title="Tax configuration" addLabel="Add tax" data={taxConfigData} idKey="code"
          columns={[{ key: "code", label: "Code", mono: true }, { key: "name", label: "Name" }, { key: "rate", label: "Rate", align: "right" }]}
          fields={[{ key: "code", label: "Code", type: "text" }, { key: "name", label: "Name", type: "text" }, { key: "rate", label: "Rate", type: "text" }]}
          onAdd={taxConfigCrud.add} onUpdate={taxConfigCrud.update} onDelete={taxConfigCrud.remove}
        />
      )}
    </div>
  );
}

function Employees() {
  const [tab, setTab] = useState("Roster");
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_EMPLOYEE · TBL_TRANS_ATTENDANCE · TBL_TRANS_DUTY_ROSTER" title="Employee management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total employees" value="1,842" icon={Users2} />
        <KpiCard label="On duty now" value="601" icon={UserCheck} tone="green" />
        <KpiCard label="On leave" value="34" icon={Clock} tone="amber" />
        <KpiCard label="Absent today" value="12" icon={AlertTriangle} tone="red" />
      </div>
      <SubTabs tabs={["Roster", "Attendance"]} active={tab} onChange={setTab} />
      {tab === "Roster" && (
        <Card title="Employee roster">
          <Table>
            <thead><tr><Th>ID</Th><Th>Name</Th><Th>Role</Th><Th>Depot</Th><Th>Shift</Th><Th>Status</Th></tr></thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="stc-row">
                  <Td mono>{e.id}</Td><Td>{e.name}</Td><Td>{e.role}</Td><Td mono>{e.depot}</Td><Td>{e.shift}</Td>
                  <Td><StatusBadge status={e.status === "On duty" ? "Active" : e.status === "On leave" ? "Pending verification" : "Cancelled"} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
      {tab === "Attendance" && (
        <Card title="Attendance — last 7 days (network-wide)">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceSummary} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${T.border}` }} />
                <Bar dataKey="present" fill={T.blue} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function RoutesSchedule() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ROUTE · TBL_MAST_TIMETABLE · TBL_TRANS_TRIP" title="Routes & schedule" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 12 }}>
        <Card title="Route master">
          <Table>
            <thead><tr><Th>Route</Th><Th>Service</Th><Th>Type</Th><Th>Distance</Th><Th>Fare model</Th></tr></thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.code} className="stc-row">
                  <Td mono><RouteChip>{r.code}</RouteChip><div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>{r.name}</div></Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 3, background: r.service === "ST" ? T.blueFill : T.greenFill, color: r.service === "ST" ? T.blue : T.green }}>
                      {r.service}
                    </span>
                  </Td>
                  <Td>{r.type}</Td>
                  <Td>{r.distance}</Td>
                  <Td>{r.fareModel}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Today's trips">
          <Table>
            <thead><tr><Th>Trip</Th><Th>Route</Th><Th>Crew</Th><Th>Sched.</Th><Th>Status</Th></tr></thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="stc-row">
                  <Td mono><RouteChip>{t.id}</RouteChip></Td>
                  <Td mono>{t.route}</Td>
                  <Td>{t.driver}<div style={{ fontSize: 11, color: T.textSoft }}>{t.conductor}</div></Td>
                  <Td>{t.sched}<div style={{ fontSize: 11, color: T.textSoft }}>Actual {t.actual}</div></Td>
                  <Td><StatusBadge status={t.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

function LiveTracking() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_GPS_LOCATION_PING" title="Live tracking" />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
        <Card title="Network map (simplified)">
          <div style={{ position: "relative", height: 340, background: T.grayFill, borderRadius: 4, overflow: "hidden" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 340">
              <path d="M20,300 C100,260 140,120 220,90 S360,40 380,20" fill="none" stroke={T.border} strokeWidth="4" />
              <path d="M40,40 C90,90 120,180 200,200 S320,260 370,300" fill="none" stroke={T.border} strokeWidth="4" />
              {liveBuses.map((b, i) => {
                const pts = [[90, 250], [230, 90], [130, 150], [300, 250]];
                const [x, y] = pts[i % pts.length];
                return (
                  <g key={b.vehicle}>
                    <circle cx={x} cy={y} r="7" fill={b.delay.startsWith("+") ? T.red : T.green} opacity="0.85" />
                    <circle cx={x} cy={y} r="12" fill="none" stroke={b.delay.startsWith("+") ? T.red : T.green} strokeWidth="1.5" opacity="0.4" />
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>
        <Card title="Buses in motion">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {liveBuses.map((b) => (
              <div key={b.vehicle} style={{ padding: 10, border: `1px solid ${T.border}`, borderRadius: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <RouteChip>{b.vehicle}</RouteChip>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.delay.startsWith("+") ? T.red : b.delay.startsWith("-") ? T.blue : T.green }}>{b.delay}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.textSoft }}>
                  <span><MapPin size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{b.nextStop}</span>
                  <span>ETA {b.eta}</span>
                  <span>{b.speed} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Fares() {
  const [dist, setDist] = useState(21);
  const fare = Math.round(10 + dist * 2.5);
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_FARE_POLICY · TBL_MAST_CONCESSION_CATEGORY" title="Fare management" />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Fare policies">
          <Table>
            <thead><tr><Th>Policy</Th><Th>Model</Th><Th>Base / rate</Th><Th>Route</Th><Th>Status</Th></tr></thead>
            <tbody>
              {farePolicies.map((f) => (
                <tr key={f.code} className="stc-row">
                  <Td mono><RouteChip>{f.code}</RouteChip></Td>
                  <Td>{f.model}</Td>
                  <Td>₹{f.base} base · {f.rate}</Td>
                  <Td mono>{f.route}</Td>
                  <Td><StatusBadge status={f.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Public fare calculator">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: T.textSoft }}>Distance travelled: <b style={{ color: T.text }}>{dist} km</b></label>
              <input type="range" min="1" max="120" step="1" value={dist} onChange={(e) => setDist(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div style={{ background: T.amberFill, borderRadius: 4, padding: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.amberDeep, fontWeight: 500 }}>Estimated fare (PMPML-56, Local)</span>
              <span className="stc-display" style={{ fontSize: 26, fontWeight: 600, color: T.amberDeep }}>₹{fare}</span>
            </div>
          </div>
        </Card>
      </div>
      <Card title="Concession categories">
        <Table>
          <thead><tr><Th>Category</Th><Th>Discount</Th><Th>Eligibility proof</Th></tr></thead>
          <tbody>
            {concessions.map((c) => (
              <tr key={c.name} className="stc-row"><Td>{c.name}</Td><Td>{c.discount}</Td><Td>{c.proof}</Td></tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Ticketing() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_TICKET · TBL_TRANS_TICKET_PAYMENT" title="Ticketing" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Tickets today" value="9,842" icon={Ticket} />
        <KpiCard label="Confirmed" value="9,201" icon={CheckCircle2} tone="green" />
        <KpiCard label="Cancelled / refunded" value="512" icon={XCircle} tone="red" />
        <KpiCard label="Voided (audit)" value="14" icon={AlertTriangle} tone="amber" />
      </div>
      <Card title="Recent tickets">
        <Table>
          <thead><tr><Th>Booking ref</Th><Th>Trip</Th><Th>Channel</Th><Th>Passenger</Th><Th align="right">Fare</Th><Th>Status</Th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.ref} className="stc-row">
                <Td mono><RouteChip>{t.ref}</RouteChip></Td>
                <Td mono>{t.trip}</Td>
                <Td>{t.channel}</Td>
                <Td>{t.passenger}</Td>
                <Td align="right" mono>₹{t.fare}</Td>
                <Td><StatusBadge status={t.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Passes() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_PASSENGER_PASS" title="Pass management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Active passes" value="24,610" icon={Armchair} tone="green" />
        <KpiCard label="Pending verification" value="188" icon={Clock} tone="amber" />
        <KpiCard label="Expiring ≤7 days" value="742" icon={AlertTriangle} tone="amber" />
        <KpiCard label="Expired (unrenewed)" value="1,205" icon={XCircle} tone="red" />
      </div>
      <Card title="Passenger passes">
        <Table>
          <thead><tr><Th>Pass no.</Th><Th>Type</Th><Th>Holder</Th><Th>Valid to</Th><Th>Status</Th></tr></thead>
          <tbody>
            {passes.map((p) => (
              <tr key={p.number} className="stc-row">
                <Td mono><RouteChip>{p.number}</RouteChip></Td>
                <Td>{p.type}</Td>
                <Td>{p.holder}</Td>
                <Td>{p.validTo}</Td>
                <Td><StatusBadge status={p.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Reservations() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_TRIP_SEAT_INVENTORY · TBL_TRANS_RESERVATION" title="Reservation management" />
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="Reservations">
          <Table>
            <thead><tr><Th>PNR</Th><Th>Trip</Th><Th>Passenger</Th><Th>Seat</Th><Th>Boarding point</Th><Th>Status</Th></tr></thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.pnr} className="stc-row">
                  <Td mono><RouteChip>{r.pnr}</RouteChip></Td>
                  <Td mono>{r.trip}</Td>
                  <Td>{r.passenger}</Td>
                  <Td mono>{r.seat}</Td>
                  <Td>{r.boarding}</Td>
                  <Td><StatusBadge status={r.status === "Waitlisted" ? "Pending verification" : "Confirmed"} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card title="Seat map · TRP-90215">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
              {seatMap.map((s) => {
                const c = s.status === "booked" ? [T.redFill, T.red] : s.status === "held" ? [T.amberFill, T.amberDeep] : [T.greenFill, T.green];
                return (
                  <div key={s.seat} className="stc-mono" style={{ background: c[0], color: c[1], fontSize: 11, fontWeight: 600, textAlign: "center", padding: "6px 0", borderRadius: 3 }}>
                    {s.seat}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: T.textSoft }}>
              <span><Circle size={8} fill={T.green} color={T.green} /> Available</span>
              <span><Circle size={8} fill={T.amberDeep} color={T.amberDeep} /> Held</span>
              <span><Circle size={8} fill={T.red} color={T.red} /> Booked</span>
            </div>
          </Card>
          <Card title="Boarding points · MSRTC-9502">
            <Table>
              <thead><tr><Th>Point</Th><Th align="right">Departure</Th></tr></thead>
              <tbody>
                {boardingPoints.map((b) => (
                  <tr key={b.name} className="stc-row"><Td>{b.name}</Td><Td align="right" mono>{b.time}</Td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EtmDevices() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ETM_DEVICE · TBL_TRANS_ETM_SHIFT_CLOSURE" title="ETM device fleet" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
        {etmDevices.map((d) => (
          <Card key={d.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <RouteChip>{d.id}</RouteChip>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 6 }}>{d.conductor}</div>
                <div style={{ fontSize: 12, color: T.textSoft }}>{d.depot}</div>
              </div>
              {d.connectivity === "online" ? <Wifi size={18} color={T.green} /> : <WifiOff size={18} color={T.red} />}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textSoft, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Battery size={14} color={d.battery < 40 ? T.red : T.green} /> {d.battery}%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Printer size={14} color={d.printer === "ok" ? T.green : T.amberDeep} /> {d.printer === "ok" ? "Ready" : "Low paper"}
              </span>
              <span>Synced {d.lastSync}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FinanceWallet() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_DAILY_SHIFT_COLLECTION · TBL_TRANS_WALLET_TRANSACTION" title="Finance & wallet" />
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="Cash reconciliation by depot">
          <Table>
            <thead><tr><Th>Depot</Th><Th align="right">Declared</Th><Th align="right">Deposited</Th><Th align="right">Discrepancy</Th></tr></thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.depot} className="stc-row">
                  <Td mono>{c.depot}</Td>
                  <Td align="right" mono>₹{c.declared.toLocaleString("en-IN")}</Td>
                  <Td align="right" mono>₹{c.deposited.toLocaleString("en-IN")}</Td>
                  <Td align="right" mono>
                    <span style={{ color: c.discrepancy < 0 ? T.red : T.green, fontWeight: 600 }}>
                      {c.discrepancy === 0 ? "Matched" : `₹${c.discrepancy.toLocaleString("en-IN")}`}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Wallet transactions">
          <Table>
            <thead><tr><Th>Ref</Th><Th>Passenger</Th><Th>Type</Th><Th align="right">Amount</Th></tr></thead>
            <tbody>
              {walletTxns.map((w) => (
                <tr key={w.ref} className="stc-row">
                  <Td mono style={{ fontSize: 11 }}>{w.ref}</Td>
                  <Td>{w.passenger}</Td>
                  <Td>{w.type}</Td>
                  <Td align="right" mono>
                    <span style={{ color: w.amount < 0 ? T.red : T.green, fontWeight: 600 }}>
                      {w.amount < 0 ? "-" : "+"}₹{Math.abs(w.amount)}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

function Support() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_COMPLAINT · TBL_TRANS_SOS_ALERT" title="Complaints & support" />
      <Card title="Open complaints">
        <Table>
          <thead><tr><Th>ID</Th><Th>Category</Th><Th>Trip</Th><Th>SLA</Th><Th>Status</Th></tr></thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className="stc-row">
                <Td mono><RouteChip>{c.id}</RouteChip></Td>
                <Td>{c.category}</Td>
                <Td mono>{c.trip}</Td>
                <Td style={{ color: c.sla === "Overdue" ? T.red : T.textSoft }}>{c.sla}</Td>
                <Td><StatusBadge status={c.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Reports() {
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
                  {channelSplit.map((c, i) => <Cell key={i} fill={c.color} />)}
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

function Analytics() {
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
                  {channelSplit.map((c, i) => <Cell key={i} fill={c.color} />)}
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

function Admin() {
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_APP_USER · TBL_MAST_ROLE" title="User & role administration" />
      <Card title="System users">
        <Table>
          <thead><tr><Th>User</Th><Th>Role</Th><Th>Depot scope</Th><Th>Status</Th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.name} className="stc-row">
                <Td>{u.name}</Td>
                <Td>{u.role}</Td>
                <Td mono>{u.depot}</Td>
                <Td><StatusBadge status={u.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Help() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <SectionHeader eyebrow="User guidance" title="Help & support" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: T.amberFill, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={17} color={T.amberDeep} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>User manual</div>
              <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Module-by-module guide covering every screen in this console.</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: T.blueFill, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LifeBuoy size={17} color={T.blue} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Raise a support ticket</div>
              <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Reach the helpdesk for account, access, or data issues.</div>
            </div>
          </div>
        </Card>
      </div>
      <Card title="Frequently asked questions">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "12px 2px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{f.q}</span>
                <ChevronsUpDown size={14} color={T.textFaint} style={{ flexShrink: 0 }} />
              </button>
              {open === i && <div style={{ fontSize: 13, color: T.textSoft, padding: "0 2px 14px", lineHeight: 1.55 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------
   NAVIGATION + SHELL
--------------------------------------------------------------------- */
const NAV = [
  { group: null, items: [{ id: "overview", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Organization",
    items: [
      { id: "organization", label: "Organization", icon: Building2 },
      { id: "masters", label: "Master Data", icon: Database },
    ],
  },
  {
    group: "Operations",
    items: [
      { id: "fleet", label: "Fleet", icon: Bus },
      { id: "employees", label: "Employees", icon: UserCog },
      { id: "routes", label: "Routes & Schedule", icon: Milestone },
      { id: "tracking", label: "Live Tracking", icon: Radar },
    ],
  },
  {
    group: "Commercial",
    items: [
      { id: "fares", label: "Fare Management", icon: IndianRupee },
      { id: "ticketing", label: "Ticketing", icon: Ticket },
      { id: "reservations", label: "Reservations", icon: CalendarCheck },
      { id: "passes", label: "Passes", icon: Armchair },
    ],
  },
  {
    group: "Systems",
    items: [
      { id: "etm", label: "ETM Devices", icon: Smartphone },
      { id: "finance", label: "Finance & Wallet", icon: Wallet },
    ],
  },
  {
    group: "Support",
    items: [
      { id: "support", label: "Complaints & Alerts", icon: MessageSquareWarning },
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "analytics", label: "Analytics", icon: LineChartIcon },
      { id: "admin", label: "Users & Roles", icon: ShieldCheck },
      { id: "help", label: "Help", icon: HelpCircle },
    ],
  },
];

const SECTION_MAP: Record<string, any> = {
  overview: { comp: Overview, title: "Dashboard" },
  organization: { comp: Organization, title: "Organization" },
  masters: { comp: MasterData, title: "Master Data" },
  fleet: { comp: Fleet, title: "Fleet" },
  employees: { comp: Employees, title: "Employees" },
  routes: { comp: RoutesSchedule, title: "Routes & Schedule" },
  tracking: { comp: LiveTracking, title: "Live Tracking" },
  fares: { comp: Fares, title: "Fare Management" },
  ticketing: { comp: Ticketing, title: "Ticketing" },
  reservations: { comp: Reservations, title: "Reservations" },
  passes: { comp: Passes, title: "Passes" },
  etm: { comp: EtmDevices, title: "ETM Devices" },
  finance: { comp: FinanceWallet, title: "Finance & Wallet" },
  support: { comp: Support, title: "Complaints & Alerts" },
  reports: { comp: Reports, title: "Reports" },
  analytics: { comp: Analytics, title: "Analytics" },
  admin: { comp: Admin, title: "Users & Roles" },
  help: { comp: Help, title: "Help" },
};

export default function TransitOpsConsole() {
  return (
    <DataProvider>
      <ConsoleShell />
    </DataProvider>
  );
}

function ConsoleShell() {
  const [active, setActive] = useState("overview");
  const Active = SECTION_MAP[active].comp;

  return (
    <div className="stc-body" style={{ display: "flex", width: "100%", minHeight: 640, background: T.canvas, color: T.text }}>
      <style>{fontStack}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: T.ink, borderRight: `1px solid ${T.inkBorder}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.inkBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: T.amber, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bus size={15} color={T.ink} />
            </div>
            <span className="stc-display" style={{ color: T.inkText, fontSize: 15, fontWeight: 600 }}>GenXTransit</span>
          </div>
          <div style={{ fontSize: 11, color: "#7C8A99", marginTop: 4, letterSpacing: "0.03em" }}>MSRTC · BEST · PMPML — MAHARASHTRA</div>
        </div>

        <nav className="stc-scroll" style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {NAV.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              {g.group && (
                <div style={{ fontSize: 10, fontWeight: 600, color: "#5E6C7B", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 10px" }}>
                  {g.group}
                </div>
              )}
              {g.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`stc-navitem${isActive ? " active" : ""}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px 8px 13px",
                      background: isActive ? T.ink2 : "transparent", border: "none", borderRadius: 4, cursor: "pointer",
                      color: isActive ? "#F4F0E4" : "#9AA6B2", fontSize: 13, fontWeight: 500, marginBottom: 1, textAlign: "left",
                    }}
                  >
                    <Icon size={16} color={isActive ? T.amber : "#6B7885"} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: 14, borderTop: `1px solid ${T.inkBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.ink2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: T.amber }}>
            CR
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.inkText }}>Control Room</div>
            <div style={{ fontSize: 11, color: T.inkTextFaint }}>All depots</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.panel }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.textSoft }}>
            <span>Transit Ops</span>
            <ChevronRight size={14} />
            <span style={{ color: T.text, fontWeight: 600 }}>{SECTION_MAP[active].title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, color: T.textSoft }}>
              <Search size={14} />
              Search trips, tickets, vehicles…
            </div>
            <Bell size={17} color={T.textSoft} />
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.textSoft, cursor: "pointer" }}>
              All depots <ChevronDown size={13} />
            </div>
          </div>
        </header>
        <main className="stc-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <Active />
        </main>
      </div>
    </div>
  );
}





// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
