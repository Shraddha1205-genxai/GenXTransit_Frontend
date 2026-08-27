import React, {
  useState,
  useMemo,
  useReducer,
  createContext,
  useContext,
  lazy,
  Suspense,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  Building2,
  Bus,
  Milestone,
  Radar,
  Ticket,
  Armchair,
  Smartphone,
  Wallet,
  MessageSquareWarning,
  BarChart3,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Wrench,
  IndianRupee,
  Users2,
  UserCog,
  CalendarCheck,
  HelpCircle,
  UserCheck,
  Database,
  LineChart as LineChartIcon,
} from "lucide-react";

import { T, fontStack, ThemeProvider } from "./constants/theme";
import {
  Sidebar,
  Header,
  SubTabs,
  SectionHeader,
  KpiCard,
} from "./components/common";

// Lazy-loaded Feature Pages
const DashboardTab = lazy(() => import("./features/dashboard"));
const Regions = lazy(
  () => import("./features/organization/organizationManagement/Regions"),
);
const Divisions = lazy(
  () => import("./features/organization/organizationManagement/Divisions"),
);
const Zones = lazy(
  () => import("./features/organization/organizationManagement/Zones"),
);
const Corporations = lazy(
  () => import("./features/organization/organizationManagement/Corporations"),
);
const Depots = lazy(
  () => import("./features/organization/organizationManagement/Depots"),
);
const BusStation = lazy(
  () => import("./features/organization/organizationManagement/BusStation"),
);
const Workshops = lazy(
  () => import("./features/organization/organizationManagement/Workshops"),
);
const ParkingYards = lazy(
  () => import("./features/organization/organizationManagement/ParkingYards"),
);
const RoleMaster = lazy(
  () => import("./features/organization/userManagement/RoleMaster"),
);
const UserMaster = lazy(
  () => import("./features/organization/userManagement/UserMaster"),
);
const ScreenMaster = lazy(
  () => import("./features/organization/userManagement/ScreenMaster"),
);
const Authorization = lazy(
  () => import("./features/organization/userManagement/Authorization"),
);

const RouteMaster = lazy(() => import("./features/organization/masters/Route"));
const Stop = lazy(() => import("./features/organization/masters/Stop"));
const Stages = lazy(() => import("./features/organization/masters/Stages"));
const FarePolicies = lazy(
  () => import("./features/organization/masters/FarePolicies"),
);
const TicketTypes = lazy(
  () => import("./features/organization/masters/TicketTypes"),
);
const PaymentModes = lazy(
  () => import("./features/organization/masters/PaymentModes"),
);
const VehicleCategories = lazy(
  () => import("./features/organization/masters/VehicleCategories"),
);
const SeatLayouts = lazy(
  () => import("./features/organization/masters/SeatLayouts"),
);
const HolidayCalendar = lazy(
  () => import("./features/organization/masters/HolidayCalendar"),
);
const NotificationTemplates = lazy(
  () => import("./features/organization/masters/NotificationTemplates"),
);
const ComplaintCategories = lazy(
  () => import("./features/organization/masters/ComplaintCategories"),
);
const TaxConfiguration = lazy(
  () => import("./features/organization/masters/TaxConfiguration"),
);

const VehicleRegister = lazy(
  () => import("./features/operations/fleet/VehicleRegister"),
);
const Roster = lazy(() => import("./features/operations/employees/Roster"));
const Attendance = lazy(
  () => import("./features/operations/employees/Attendance"),
);
const RoutesAndSchedule = lazy(
  () => import("./features/operations/routesAndSchedule/RoutesAndSchedule"),
);
const LiveTracking = lazy(
  () => import("./features/operations/liveTracking/LiveTracking"),
);

const FareManagement = lazy(
  () => import("./features/commercial/fareManagement/FareManagement"),
);
const Ticketing = lazy(
  () => import("./features/commercial/ticketing/Ticketing"),
);
const Reservations = lazy(
  () => import("./features/commercial/reservations/Reservations"),
);
const Passes = lazy(() => import("./features/commercial/passes/Passes"));

const EtmDevices = lazy(
  () => import("./features/systems/etmDevices/EtmDevices"),
);
const FinanceWallet = lazy(
  () => import("./features/systems/financeWallet/FinanceWallet"),
);

const ComplaintsAlerts = lazy(
  () => import("./features/support/complaintsAlerts/ComplaintsAlerts"),
);
const Reports = lazy(() => import("./features/support/reports/Reports"));
const Analytics = lazy(() => import("./features/support/analytics/Analytics"));
const UsersRoles = lazy(
  () => import("./features/support/usersRoles/UsersRoles"),
);
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
  {
    depotId: "001",
    depotCode: "MSRTC-PUN-01",
    depotName: "Pune (Swargate) ST Depot",
    corpId: "CORP-ID-1001",
    corpCode: "CORP-0001",
    corporationName: "Maharashtra State Road Transport Corporation",
    service: "ST",
    zoneName: "Pune Division",
    zoneId: "0001",
    zoneCode: "z-001",
    regionId: "01",
    regionCode: "r-01",
    regionName: "Pune Region",
    divisionId: "DIV-01",
    divisionCode: "DIV-01",
    divisionName: "Pune Division",
    fleet: 96,
    onRoad: 74,
    tripsToday: 268,
    revenueToday: 612400,
    isActive: true,
  },
  {
    depotId: "002",
    depotCode: "BEST-MUM-04",
    depotName: "BEST Wadala Depot",
    corpId: "CORP-ID-1002",
    corpCode: "CORP-0002",
    corporationName: "BEST",
    service: "Local",
    zoneName: "Mumbai (Island City)",
    zoneId: "0002",
    zoneCode: "z-002",
    regionId: "02",
    regionCode: "r-02",
    regionName: "Mumbai Region",
    divisionId: "DIV-02",
    divisionCode: "DIV-02",
    divisionName: "Mumbai Division",
    fleet: 72,
    onRoad: 58,
    tripsToday: 341,
    revenueToday: 398600,
    isActive: true,
  },
  {
    depotId: "003",
    depotCode: "PMPML-PUN-02",
    depotName: "PMPML Swargate Depot",
    corpId: "CORP-ID-1003",
    corpCode: "CORP-0003",
    corporationName: "PMPML",
    service: "Local",
    zoneName: "Pune Metropolitan Region",
    zoneId: "0003",
    zoneCode: "z-003",
    regionId: "03",
    regionCode: "r-03",
    regionName: "Pune Region",
    divisionId: "DIV-03",
    divisionCode: "DIV-03",
    divisionName: "Pune Division",
    fleet: 60,
    onRoad: 47,
    tripsToday: 219,
    revenueToday: 271500,
    isActive: true,
  },
  {
    depotId: "004",
    depotCode: "MSRTC-MUM-03",
    depotName: "Mumbai Central (MSRTC) Depot",
    corpId: "CORP-ID-1001",
    corpCode: "CORP-001",
    corporationName: "Maharashtra State Road Transport Corporation",
    service: "ST",
    zoneName: "Mumbai Division",
    zoneId: "0004",
    zoneCode: "z-004",
    regionId: "04",
    regionCode: "r-04",
    regionName: "Mumbai Region",
    divisionId: "DIV-04",
    divisionCode: "DIV-04",
    divisionName: "Mumbai Division",
    fleet: 54,
    onRoad: 41,
    tripsToday: 132,
    revenueToday: 349800,
    isActive: true,
  },
];

const vehicles = [
  {
    fleetId: "001",
    vehicleNumber: "MH-12-AB-4421",
    categoryId: "001",
    categoryName: "AC Shivneri",
    seriesType: "BH",
    depotId: "01",
    depotCode: "MSRTC-PUN-01",
    fleetStatus: "Active",
    nextService: "12 Aug 2026",
    docExpiry: "Fitness · 18 Aug 2026",
    isActive: true,
  },
  {
    fleetId: "002",
    vehicleNumber: "MH-12-CD-1187",
    categoryId: "002",
    categoryName: "Express (ST)",
    seriesType: "BH",
    depotId: "01",
    depotCode: "MSRTC-PUN-01",
    fleetStatus: "Active",
    nextService: "22 Aug 2026",
    docExpiry: "Insurance · 02 Sep 2026",
    isActive: true,
  },
  {
    fleetId: "003",
    vehicleNumber: "MH-01-EF-7702",
    categoryId: "003",
    categoryName: "AC Local (BEST)",
    seriesType: "State",
    depotId: "04",
    depotCode: "BEST-MUM-04",
    fleetStatus: "Under maintenance",
    nextService: "In progress",
    docExpiry: "PUC · 09 Aug 2026",
    isActive: true,
  },
];

const routes = [
  {
    routeId: "R-9502",
    routeCode: "MSRTC-9502",
    routeName: "Pune – Mumbai Shivneri (Expressway)",
    regionId: "001",
    regionCode: "REG-001",
    regionName: "MSR-0001",
    fromStationId: "01",
    fromStationCode: "PUNE-001",
    fromStationName: "Pune",
    toStationId: "02",
    toStationCode: "MUM-001",
    toStationName: "Mumbai",
    service: "ST",
    type: "Luxury",
    distance: "150 km",
    fareModel: "Fixed",
    duration: "3h 10m",
    isActive: true,
  },
  {
    routeId: "R-7714",
    routeCode: "MSRTC-7714",
    routeName: "Pune – Nashik ST Express",
    regionId: "001",
    regionCode: "REG-001",
    regionName: "MSR-0001",
    fromStationId: "01",
    fromStationCode: "PUNE-001",
    fromStationName: "Pune",
    toStationId: "03",
    toStationCode: "NASH-001",
    toStationName: "Nashik",
    service: "ST",
    type: "Express",
    distance: "210 km",
    fareModel: "Distance",
    duration: "4h 30m",
    isActive: true,
  },
  {
    routeId: "R-BEST-A-1",
    routeCode: "BEST-A-1",
    routeName: "Colaba – Bandra (via Worli Sea Face)",
    regionId: "002",
    regionCode: "REG-002",
    regionName: "MSR-0002",
    fromStationId: "04",
    fromStationCode: "COLABA-001",
    fromStationName: "Colaba",
    toStationId: "05",
    toStationCode: "BANDRA-001",
    toStationName: "Bandra",
    service: "Local",
    type: "City",
    distance: "18 km",
    fareModel: "Distance",
    duration: "1h 05m",
    isActive: true,
  },
];

const trips = [
  {
    tripId: "90213",
    tripCode: "TRP-90213",
    routeId: "9502",
    routeName: "Mumbai",
    routeCode: "MSRTC-9502",
    fleetId: "01",
    vehicleNumber: "MH-12-AB-4421",
    driverId: "01",
    driverCode: "EMP-001",
    driverName: "S. Jadhav",
    conductorId: "06",
    conductorCode: "EMP-006",
    conductorName: "R. Kulkarni",
    sched: "14:30",
    actual: "14:33",
    fleetStatus: "Delayed",
    isActive: true,
  },
  {
    tripId: "90214",
    tripCode: "TRP-90214",
    routeId: "1",
    routeName: "BEST",
    routeCode: "BEST-A-1",
    fleetId: "02",
    vehicleNumber: "MH-01-EF-7702",
    driverId: "02",
    driverCode: "EMP-002",
    driverName: "V. Pawar",
    conductorId: "07",
    conductorCode: "EMP-007",
    conductorName: "A. Shinde",
    sched: "14:45",
    actual: "—",
    fleetStatus: "Cancelled",
    isActive: true,
  },
  {
    tripId: "90215",
    tripCode: "TRP-90215",
    routeId: "8801",
    routeName: "Mumbai MSRTC",
    routeCode: "MSRTC-8801",
    fleetId: "03",
    vehicleNumber: "MH-02-JK-5561",
    driverId: "03",
    driverCode: "EMP-003",
    driverName: "D. More",
    conductorId: "08",
    conductorCode: "EMP-008",
    conductorName: "P. Bhosale",
    sched: "15:00",
    actual: "15:00",
    fleetStatus: "On time",
    isActive: true,
  },
  {
    tripId: "90216",
    tripCode: "TRP-90216",
    routeId: "56",
    routeName: "PMPML Pune",
    routeCode: "PMPML-56",
    fleetId: "04",
    vehicleNumber: "MH-14-GH-2290",
    driverId: "04",
    driverCode: "EMP-004",
    driverName: "N. Gaikwad",
    conductorId: "09",
    conductorCode: "EMP-009",
    conductorName: "S. Kadam",
    sched: "15:10",
    actual: "15:09",
    fleetStatus: "On time",
    isActive: true,
  },
  {
    tripId: "90217",
    tripCode: "TRP-90217",
    routeId: "84",
    routeName: "Best AC",
    routeCode: "BEST-AC-84",
    fleetId: "05",
    vehicleNumber: "MH-01-LM-9034",
    driverId: "05",
    driverCode: "EMP-005",
    driverName: "R. Sawant",
    conductorId: "10",
    conductorCode: "EMP-010",
    conductorName: "M. Chavan",
    sched: "15:20",
    actual: "Ongoing",
    fleetStatus: "Ongoing",
    isActive: true,
  },
];

const liveBuses = [
  {
    vehicle: "MH-12-AB-4421",
    route: "MSRTC-9502",
    speed: 78,
    nextStop: "Lonavala Ghat",
    eta: "6 min",
    delay: "+4 min",
  },
  {
    vehicle: "MH-02-JK-5561",
    route: "MSRTC-8801",
    speed: 64,
    nextStop: "Panvel Junction",
    eta: "12 min",
    delay: "On time",
  },
  {
    vehicle: "MH-01-LM-9034",
    route: "BEST-AC-84",
    speed: 28,
    nextStop: "Prabhadevi",
    eta: "3 min",
    delay: "On time",
  },
  {
    vehicle: "MH-14-GH-2290",
    route: "PMPML-56",
    speed: 41,
    nextStop: "Wakad Chowk",
    eta: "9 min",
    delay: "-2 min",
  },
];

const farePolicies = [
  {
    policyId: "01",
    policyCode: "FP-FIX-01",
    model: "Fixed",
    categoryId: "01",
    categoryCode: "CAT-FIX-01",
    baseFare: 350,
    rateDescription: "Flat (Shivneri)",
    routeId: "MSRTC-9502",
    routeCode: "MSRTC-9502",
    routeName: "Pune – Mumbai Shivneri (Expressway)",
    policyStatus: "Published",
    isActive: true,
  },
  {
    policyId: "02",
    policyCode: "FP-DIST-02",
    model: "Distance",
    categoryId: "02",
    categoryCode: "CAT-DIST-02",
    baseFare: 20,
    rateDescription: "₹1.45/km",
    routeId: "MSRTC-7714",
    routeCode: "MSRTC-7714",
    routeName: "Pune – Nashik ST Express",
    policyStatus: "Simulated",
    isActive: true,
  },
  {
    policyId: "03",
    policyCode: "FP-ZONE-03",
    model: "Zone",
    categoryId: "03",
    categoryCode: "CAT-ZONE-03",
    baseFare: 15,
    rateDescription: "Zone matrix",
    routeId: "MSRTC-8801",
    routeCode: "MSRTC-8801",
    routeName: "Pune – Nashik Local",
    policyStatus: "Draft",
    isActive: false,
  },
];

const concessions = [
  { name: "Student", discount: "50%", proof: "Institution ID" },
  { name: "Senior citizen", discount: "30%", proof: "Age proof (Aadhaar)" },
  { name: "Divyang (disabled)", discount: "75%", proof: "UDID certificate" },
  {
    name: "Freedom fighter",
    discount: "100%",
    proof: "Sainik Board certificate",
  },
  {
    name: "Maharashtra women (Local, city routes)",
    discount: "50%",
    proof: "None — scheme-wide",
  },
];

const tickets = [
  {
    ref: "BK-914481",
    trip: "TRP-90213",
    channel: "ETM",
    passenger: "Walk-in",
    fare: 350,
    status: "Confirmed",
  },
  {
    ref: "BK-914482",
    trip: "TRP-90215",
    channel: "Mobile app",
    passenger: "A. Deshmukh",
    fare: 285,
    status: "Confirmed",
  },
  {
    ref: "BK-914483",
    trip: "TRP-90214",
    channel: "Counter",
    passenger: "S. Naik",
    fare: 36,
    status: "Cancelled",
  },
  {
    ref: "BK-914484",
    trip: "TRP-90216",
    channel: "Web portal",
    passenger: "R. Iyer",
    fare: 42,
    status: "Confirmed",
  },
  {
    ref: "BK-914485",
    trip: "TRP-90217",
    channel: "ETM",
    passenger: "Walk-in",
    fare: 20,
    status: "Voided",
  },
];

const passes = [
  {
    number: "PASS-51021",
    type: "Monthly (BEST Local)",
    holder: "G. Vaidya",
    validTo: "31 Aug 2026",
    status: "Active",
  },
  {
    number: "PASS-51022",
    type: "Student quarterly (PMPML)",
    holder: "T. Kale",
    validTo: "14 Sep 2026",
    status: "Active",
  },
  {
    number: "PASS-51023",
    type: "Senior citizen annual (MSRTC)",
    holder: "P. Joshi",
    validTo: "02 Feb 2027",
    status: "Pending verification",
  },
  {
    number: "PASS-51024",
    type: "Corporate (Shivneri)",
    holder: "Infosys Hinjawadi",
    validTo: "30 Jun 2026",
    status: "Expired",
  },
];

const seatMap = Array.from({ length: 40 }, (_, i) => ({
  seat: `${Math.floor(i / 4) + 1}${["A", "B", "C", "D"][i % 4]}`,
  status: ["booked", "booked", "available", "available", "available", "held"][
    i % 6
  ],
}));

const etmDevices = [
  {
    id: "ETM-6671",
    conductor: "R. Kulkarni",
    depot: "MSRTC-PUN-01",
    battery: 82,
    connectivity: "online",
    printer: "ok",
    lastSync: "2 min ago",
  },
  {
    id: "ETM-6672",
    conductor: "A. Shinde",
    depot: "BEST-MUM-04",
    battery: 34,
    connectivity: "offline",
    printer: "low_paper",
    lastSync: "38 min ago",
  },
  {
    id: "ETM-6673",
    conductor: "P. Bhosale",
    depot: "MSRTC-MUM-03",
    battery: 91,
    connectivity: "online",
    printer: "ok",
    lastSync: "just now",
  },
  {
    id: "ETM-6674",
    conductor: "S. Kadam",
    depot: "PMPML-PUN-02",
    battery: 58,
    connectivity: "online",
    printer: "ok",
    lastSync: "5 min ago",
  },
];

const revenueTrend = [
  { day: "Mon", revenue: 1560 },
  { day: "Tue", revenue: 1610 },
  { day: "Wed", revenue: 1490 },
  { day: "Thu", revenue: 1720 },
  { day: "Fri", revenue: 1980 },
  { day: "Sat", revenue: 2260 },
  { day: "Sun", revenue: 2040 },
];

const fleetStatus = [
  { name: "Active", value: 256, color: CHART_COLORS.green },
  { name: "Maintenance", value: 29, color: CHART_COLORS.amber },
  { name: "Breakdown", value: 9, color: CHART_COLORS.red },
  { name: "Retired", value: 7, color: CHART_COLORS.gray },
];

const depotRevenue = depots.map((d) => ({
  name: d.depotCode.split("-").slice(0, 2).join("-"),
  revenue: Math.round(d.revenueToday / 1000),
}));

const collections = [
  {
    depot: "MSRTC-PUN-01",
    declared: 612400,
    deposited: 612400,
    discrepancy: 0,
  },
  {
    depot: "BEST-MUM-04",
    declared: 398600,
    deposited: 395100,
    discrepancy: -3500,
  },
  {
    depot: "PMPML-PUN-02",
    declared: 271500,
    deposited: 271500,
    discrepancy: 0,
  },
  {
    depot: "MSRTC-MUM-03",
    declared: 349800,
    deposited: 346900,
    discrepancy: -2900,
  },
];

const walletTxns = [
  {
    ref: "WTX-88410",
    passenger: "A. Deshmukh",
    type: "Recharge",
    amount: 500,
    mode: "UPI",
  },
  {
    ref: "WTX-88411",
    passenger: "G. Vaidya",
    type: "Debit",
    amount: -36,
    mode: "Wallet",
  },
  {
    ref: "WTX-88412",
    passenger: "T. Kale",
    type: "Refund",
    amount: 42,
    mode: "Wallet",
  },
  {
    ref: "WTX-88413",
    passenger: "R. Iyer",
    type: "Cashback",
    amount: 15,
    mode: "Promo",
  },
];

const complaints = [
  {
    id: "CMP-7721",
    category: "Conductor behaviour",
    trip: "TRP-90213",
    status: "In progress",
    sla: "4h left",
  },
  {
    id: "CMP-7722",
    category: "Delay (Shivneri)",
    trip: "TRP-90214",
    status: "Open",
    sla: "1h left",
  },
  {
    id: "CMP-7723",
    category: "Cleanliness",
    trip: "TRP-90215",
    status: "Resolved",
    sla: "—",
  },
  {
    id: "CMP-7724",
    category: "Fare dispute",
    trip: "TRP-90216",
    status: "Escalated",
    sla: "Overdue",
  },
];

const onTimeByDepot = [
  { name: "PUN-01", pct: 91 },
  { name: "MUM-04", pct: 82 },
  { name: "PUN-02", pct: 88 },
  { name: "MUM-03", pct: 94 },
  { name: "MUM-07", pct: 85 },
];

const channelSplit = [
  { name: "ETM", value: 44, color: CHART_COLORS.blue },
  { name: "Mobile app", value: 31, color: CHART_COLORS.green },
  { name: "Counter", value: 15, color: CHART_COLORS.amber },
  { name: "Web portal", value: 10, color: CHART_COLORS.gray },
];

const users = [
  {
    name: "Depot Manager – Pune ST",
    role: "Depot Manager",
    depot: "MSRTC-PUN-01",
    status: "Active",
  },
  {
    name: "Control Room Ops (Mumbai)",
    role: "Control Room Operator",
    depot: "All depots",
    status: "Active",
  },
  {
    name: "Finance Officer – BEST Mumbai",
    role: "Finance Officer",
    depot: "BEST-MUM-04",
    status: "Active",
  },
  {
    name: "System Admin",
    role: "System Administrator",
    depot: "All depots",
    status: "Active",
  },
  {
    name: "Route Planner – PMPML Pune",
    role: "Route/Traffic Manager",
    depot: "PMPML-PUN-02",
    status: "Suspended",
  },
];

const regions = [
  {
    regionId: "1001",
    regionCode: "REG-0001",
    divisions: 2,
    depots: 2,
    stations: 2,
    workshops: 3,
    regionName: "Pune Region",
    isActive: true,
  },
  {
    regionId: "1002",
    regionCode: "REG-0002",
    divisions: 1,
    depots: 1,
    stations: 1,
    workshops: 2,
    regionName: "Mumbai Region",
    isActive: true,
  },
  {
    regionId: "1003",
    regionCode: "REG-0003",
    divisions: 0,
    depots: 0,
    stations: 0,
    workshops: 0,
    regionName: "Nashik Region",
    isActive: true,
  },
];

const corporations = [
  {
    corpId: "CORP-ID-1001",
    corpCode: "CORP-0001",
    corporationName: "Maharashtra State Road Transport Corporation",
    stateName: "Maharashtra",
    districtName: "Pune",
    cityName: "Pune",
    isActive: "Active",
  },
  {
    corpId: "CORP-ID-1002",
    corpCode: "CORP-0002",
    corporationName: "Brihanmumbai Electric Supply and Transport",
    stateName: "Maharashtra",
    districtName: "Mumbai",
    cityName: "Mumbai",
    isActive: "Active",
  },
  {
    corpId: "CORP-ID-1003",
    corpCode: "CORP-0003",
    corporationName: "Pune Mahanagar Parivahan Mahamandal Limited",
    stateName: "Maharashtra",
    districtName: "Pune",
    cityName: "Pune",
    isActive: "Active",
  },
];

const divisions = [
  {
    divisionId: "DIV-ID-1001",
    divisionCode: "DIV-0001",
    depots: 2,
    workshops: 1,
    stations: 3,
    parkingYards: 1,
    divisionName: "Pune Division",
    regionId: "1001",
    regionName: "Pune Region",
    regionCode: "REG-0001",
    isActive: true,
  },
  {
    divisionId: "DIV-ID-1002",
    divisionCode: "DIV-0002",
    depots: 1,
    workshops: 1,
    stations: 2,
    parkingYards: 1,
    divisionName: "Solapur Division",
    regionId: "1001",
    regionName: "Pune Region",
    regionCode: "REG-0001",
    isActive: true,
  },
  {
    divisionId: "DIV-ID-1003",
    divisionCode: "DIV-0003",
    depots: 1,
    workshops: 1,
    stations: 2,
    parkingYards: 1,
    divisionName: "Mumbai Division",
    regionId: "1002",
    regionName: "Mumbai Region",
    regionCode: "REG-0002",
    isActive: true,
  },
];

const busStations = [
  {
    stationId: "001",
    stationCode: "STN-0001",
    stationName: "Swargate Bus Station",
    regionId: "0001",
    regionName: "Mumbai",
    regionCode: "REG-0001",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0001",
    depotName: "Mumbai Depot",
    depotCode: "MSRTC-PUN-01",
    platforms: 14,
    dailyFootfall: 38000,
    isActive: true,
  },
  {
    stationId: "002",
    stationCode: "STN-0002",
    stationName: "Mumbai Central Bus Terminus",
    regionId: "0002",
    regionName: "Pune",
    regionCode: "REG-0002",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0003",
    depotName: "Pune Depot",
    depotCode: "MSRTC-MUM-03",
    platforms: 10,
    dailyFootfall: 22500,
    isActive: true,
  },
  {
    stationId: "003",
    stationCode: "STN-0003",
    stationName: "Colaba Bus Depot Stand",
    regionId: "0002",
    regionName: "Pune",
    regionCode: "REG-0002",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0003",
    depotName: "Pune Depot",
    depotCode: "BEST-MUM-07",
    platforms: 6,
    dailyFootfall: 9200,
    isActive: true,
  },
];

const workshops = [
  {
    workShopId: "WS-0001",
    workShopCode: "WS-0001",
    workShopName: "Swargate Central Workshop",
    regionId: "REG-0001",
    regionCode: "REG-0001",
    regionName: "Region 1",
    divisionId: "DIV-0001",
    divisionCode: "DIV-0001",
    divisionName: "Division 1",
    depotId: "MSRTC-PUN-01",
    depotCode: "MSRTC-PUN-01",
    depotName: "Depot 1",
    workBays: 12,
    activeRepairJobs: 7,
    isActive: true,
  },
  {
    workShopId: "WS-0002",
    workShopCode: "WS-0002",
    workShopName: "Wadala Repair Workshop",
    regionId: "REG-0002",
    regionCode: "REG-0002",
    regionName: "Region 2",
    divisionId: "DIV-0003",
    divisionCode: "DIV-0003",
    divisionName: "Division 3",
    depotId: "BEST-MUM-04",
    depotCode: "BEST-MUM-04",
    depotName: "Depot 4",
    workBays: 8,
    activeRepairJobs: 5,
    isActive: true,
  },
  {
    workShopId: "WS-0003",
    workShopCode: "WS-0003",
    workShopName: "PMPML Swargate Workshop",
    regionId: "REG-0001",
    regionCode: "REG-0001",
    regionName: "Region 1",
    divisionId: "DIV-₀₀₀₁",
    divisionCode: "DIV-₀₀₀₁",
    divisionName: "Division 1",
    depotId: "PMPML-PUN-₀₂",
    depotCode: "PMPML-PUN-₀₂",
    depotName: "Depot 2",
    workBays: 6,
    activeRepairJobs: 2,
    isActive: true,
  },
];

const parkingYards = [
  {
    yardId: "01",
    yardCode: "PY-PUN-01",
    yardName: "Swargate Overnight Yard",
    regionId: "001",
    regionCode: "REG-PUN",
    regionName: "Pune",
    divisionId: "001",
    divisionCode: "DIV-PUN",
    divisionName: "Pune Division",
    depotId: "MSRTC-PUN-01",
    depotCode: "DEP-PUN-01",
    depotName: "MSRTC-PUN-01",
    capacity: 110,
    occupied: 88,
    isActive: true,
  },
  {
    yardId: "02",
    yardCode: "PY-MUM-04",
    yardName: "Wadala Parking Yard",
    regionId: "002",
    regionCode: "REG-MUM",
    regionName: "Mumbai",
    divisionId: "002",
    divisionCode: "DIV-MUM",
    divisionName: "Mumbai Division",
    depotId: "BEST-MUM-04",
    depotCode: "DEP-MUM-04",
    depotName: "BEST-MUM-04",
    capacity: 85,
    occupied: 74,
    isActive: true,
  },
  {
    yardId: "03",
    yardCode: "PY-MUM-07",
    yardName: "Colaba Parking Yard",
    regionId: "002",
    regionCode: "REG-MUM",
    regionName: "Mumbai",
    divisionId: "002",
    divisionCode: "DIV-MUM",
    divisionName: "Mumbai Division",
    depotId: "BEST-MUM-07",
    depotCode: "DEP-MUM-07",
    depotName: "BEST-MUM-07",
    capacity: 52,
    occupied: 40,
    isActive: true,
  },
];

const stops = [
  {
    stopId: "STP-0142",
    stopCode: "STP-0142",
    stopName: "Lonavala Ghat",
    routeId: "MSRTC-9502",
    routeCode: "MSRTC-9502",
    routeName: "Pune – Mumbai Shivneri (Expressway)",
    stopOrder: 4,
    isActive: true,
  },
  {
    stopId: "STP-0143",
    stopCode: "STP-0143",
    stopName: "Panvel Junction",
    routeId: "MSRTC-8801",
    routeCode: "MSRTC-8801",
    routeName: "Pune – Nashik ST Express",
    stopOrder: 6,
    isActive: true,
  },
  {
    stopId: "STP-0144",
    stopCode: "STP-0144",
    stopName: "Prabhadevi",
    routeId: "BEST-AC-84",
    routeCode: "BEST-AC-84",
    routeName: "Colaba – Bandra (via Worli Sea Face)",
    stopOrder: 9,
    isActive: true,
  },
  {
    stopId: "STP-0145",
    stopCode: "STP-0145",
    stopName: "Wakad Chowk",
    routeId: "PMPML-56",
    routeCode: "PMPML-56",
    routeName: "Pune – Nashik Local",
    stopOrder: 3,
    isActive: true,
  },
];

const stages = [
  {
    stageId: "STG-001",
    stageCode: "STG-001",
    stageName: "Pune Section",
    routeId: "9502",
    routeCode: "MSRTC-9502",
    routeName: "MSRTC-9502",
    sectionFromId: "001",
    sectionFromCode: "SEC-001",
    sectionFromName: "Pune Section",
    sectionToId: "002",
    sectionToCode: "SEC-002",
    sectionToName: "Lonavala Section",
    distance: 40,
    isActive: true,
  },
  {
    stageId: "STG-002",
    stageCode: "STG-002",
    stageName: "Lonavala Section",
    routeId: "9502",
    routeCode: "MSRTC-9502",
    routeName: "MSRTC-9502",
    sectionFromId: "002",
    sectionFromCode: "SEC-002",
    sectionFromName: "Lonavala Section",
    sectionToId: "003",
    sectionToCode: "SEC-003",
    sectionToName: "Colaba Section",
    distance: 82,
    isActive: true,
  },
  {
    stageId: "STG-003",
    stageCode: "STG-003",
    stageName: "Colaba Section",
    routeId: "101",
    routeCode: "BEST-A-1",
    routeName: "BEST-A-1",
    sectionFromId: "003",
    sectionFromCode: "SEC-003",
    sectionFromName: "Colaba Section",
    sectionToId: "004",
    sectionToCode: "SEC-004",
    sectionToName: "Mumbai Section",
    distance: 6,
    isActive: true,
  },
];

const zones = [
  {
    zoneId: "ZN-ID-1001",
    zoneCode: "ZN-0001",
    zoneName: "Pune Metropolitan Zone",
    regionName: "REG-0001",
    districts: ["Pune", "Pimpri-Chinchwad"],
    isActive: true,
  },
  {
    zoneId: "ZN-ID-1002",
    zoneCode: "ZN-0002",
    zoneName: "Mumbai Zone",
    regionName: "REG-0002",
    districts: ["Mumbai", "Thane"],
    isActive: true,
  },
  {
    zoneId: "ZN-ID-1003",
    zoneCode: "ZN-0003",
    zoneName: "Nashik Zone",
    regionName: "REG-0003",
    districts: ["Nashik", "Ahmednagar"],
    isActive: true,
  },
];

const ticketTypes = [
  {
    ticketId: "TT-ADULT",
    ticketCode: "TT-ADULT",
    ticketName: "Adult",
    description: "Standard full fare",
    isActive: true,
  },
  {
    ticketId: "TT-STUDENT",
    ticketCode: "TT-STUDENT",
    ticketName: "Student",
    description: "Concession ticket",
    isActive: true,
  },
  {
    ticketId: "TT-SENIOR",
    ticketCode: "TT-SENIOR",
    ticketName: "Senior citizen",
    description: "Discounted fare",
    isActive: true,
  },
];

const paymentModes = [
  {
    modeId: "PM-CASH",
    modeCode: "PM-CASH",
    modeName: "Cash",
    modeStatus: "",
    description: "",
    isActive: true,
  },
  {
    modeId: "PM-CARD",
    modeCode: "PM-CARD",
    modeName: "Debit / credit card",
    modeStatus: "",
    description: "",
    isActive: true,
  },
  {
    modeId: "PM-NETBANK",
    modeCode: "PM-NETBANK",
    modeName: "Net banking",
    modeStatus: "",
    description: "",
    isActive: false,
  },
];

const vehicleCategories = [
  {
    categoryId: "VC-SHIV",
    categoryCode: "VC-SHIV",
    categoryName: "AC Shivneri",
    capacity: 42,
    type: "AC",
    class: "Luxury",
    isActive: true,
  },
  {
    categoryId: "VC-EXP",
    categoryCode: "VC-EXP",
    categoryName: "Express (ST)",
    capacity: 52,
    type: "AC",
    class: "Standard",
    isActive: true,
  },
  {
    categoryId: "VC-ORD",
    categoryCode: "VC-ORD",
    categoryName: "Ordinary Local",
    capacity: 58,
    type: "AC",
    class: "Standard",
    isActive: true,
  },
  {
    categoryId: "VC-DD",
    categoryCode: "VC-DD",
    categoryName: "Double-decker",
    capacity: 96,
    type: "Non AC",
    class: "City",
    isActive: true,
  },
];

const seatLayouts = [
  {
    layoutId: "SL-01",
    layoutCode: "SL-01",
    description: "2+2 Front Facing",
    categoryCode: "VC-STD",
    categoryId: "VC-STD",
    isActive: true,
  },
  {
    layoutId: "SL-02",
    layoutCode: "SL-02",
    description: "3+2 Recliner",
    categoryCode: "VC-LUX",
    categoryId: "VC-LUX",
    isActive: true,
  },
  {
    layoutId: "SL-03",
    layoutCode: "SL-03",
    description: "City Bus Single Row",
    categoryCode: "VC-CITY",
    categoryId: "VC-CITY",
    isActive: true,
  },
];

const holidays = [
  {
    holidayId: "001",
    holidayCode: "h-001",
    holidayName: "Republic Day",
    occasion: "Republic Day",
    date: "2026-01-26",
    description: "Republic Day",
    type: "National",
    isActive: true,
  },
  {
    holidayId: "002",
    holidayCode: "h-002",
    holidayName: "Independence Day",
    occasion: "Independence Day",
    date: "2026-08-15",
    description: "Independence Day",
    type: "National",
    isActive: true,
  },
  {
    holidayId: "003",
    holidayCode: "h-003",
    holidayName: "Gandhi Jayanti",
    occasion: "Gandhi Jayanti",
    date: "2026-10-02",
    description: "Gandhi Jayanti",
    type: "National",
    isActive: true,
  },
];

const notificationTemplates = [
  {
    notificationId: "NT-DELAY",
    notificationCode: "NT-DELAY",
    notificationTitle: "Trip delay alert",
    channel: "SMS + Push",
    isActive: true,
  },
  {
    notificationId: "NT-CONFIRM",
    notificationCode: "NT-CONFIRM",
    notificationTitle: "Booking confirmation",
    channel: "SMS + Email",
    isActive: true,
  },
  {
    notificationId: "NT-REFUND",
    notificationCode: "NT-REFUND",
    notificationTitle: "Refund processed",
    channel: "Push",
    isActive: true,
  },
];

const complaintCategories = [
  {
    complaintId: "001",
    complaintCode: "CMP-001",
    complaintTitle: "Driver behavior",
    complaintCategory: "Behavioral",
    sla: "4h",
    isActive: true,
  },
  {
    complaintId: "002",
    complaintCode: "CMP-002",
    complaintTitle: "Vehicle cleanliness",
    complaintCategory: "Cleanliness",
    sla: "8h",
    isActive: true,
  },
  {
    complaintId: "003",
    complaintCode: "CMP-003",
    complaintTitle: "Ticketing issue",
    complaintCategory: "Fare Management",
    sla: "6h",
    isActive: true,
  },
];

const taxConfig = [
  {
    textId: "TX-GST5",
    textCode: "TX-GST5",
    textType: "GST — Local city service",
    rate: "5%",
    description: "GST for local city service",
  },
  {
    textId: "TX-GST12",
    textCode: "TX-GST12",
    textType: "GST — AC / Luxury service",
    rate: "12%",
    description: "GST for AC / Luxury service",
  },
  {
    textId: "TX-CESS",
    textCode: "TX-CESS",
    textType: "State road cess",
    rate: "1%",
    description: "State road cess",
  },
];

const employees = [
  {
    empId: "2201",
    empCode: "EMP-2201",
    empName: "S. Jadhav",
    role: "Driver",
    depotId: "01",
    depotCode: "MSRTC-PUN-01",
    shift: "Morning (06:00–14:00)",
    attendanceStatus: "On duty",
    isActive: true,
  },
  {
    empId: "2202",
    empCode: "EMP-2202",
    empName: "R. Kulkarni",
    role: "Conductor",
    depotId: "01",
    depotCode: "MSRTC-PUN-01",
    shift: "Morning (06:00–14:00)",
    attendanceStatus: "On duty",
    isActive: true,
  },
  {
    empId: "2203",
    empCode: "EMP-2203",
    empName: "V. Pawar",
    role: "Driver",
    depotId: "03",
    depotCode: "BEST-MUM-04",
    shift: "Evening (14:00–22:00)",
    attendanceStatus: "On leave",
    isActive: true,
  },
  {
    empId: "2204",
    empCode: "EMP-2204",
    empName: "N. Gaikwad",
    role: "Inspector",
    depotId: "04",
    depotCode: "PMPML-PUN-02",
    shift: "General (09:00–18:00)",
    attendanceStatus: "On duty",
    isActive: true,
  },
  {
    empId: "2205",
    empCode: "EMP-2205",
    empName: "M. Chavan",
    role: "Conductor",
    depotId: "03",
    depotCode: "BEST-MUM-07",
    shift: "Evening (14:00–22:00)",
    attendanceStatus: "On duty",
    isActive: true,
  },
  {
    empId: "2206",
    empCode: "EMP-2206",
    empName: "P. Joshi",
    role: "Admin staff",
    depotId: "05",
    depotCode: "MSRTC-MUM-03",
    shift: "General (09:00–18:00)",
    attendanceStatus: "Absent",
    isActive: true,
  },
];

const attendanceSummary = [
  { day: "Mon", present: 612 },
  { day: "Tue", present: 605 },
  { day: "Wed", present: 598 },
  { day: "Thu", present: 618 },
  { day: "Fri", present: 601 },
  { day: "Sat", present: 588 },
  { day: "Sun", present: 561 },
];

const reservations = [
  {
    pnr: "RSV-33810",
    trip: "TRP-90213",
    passenger: "K. Bhagat",
    seat: "12A",
    boarding: "Swargate",
    status: "Confirmed",
  },
  {
    pnr: "RSV-33811",
    trip: "TRP-90213",
    passenger: "S. Rane",
    seat: "12B",
    boarding: "Swargate",
    status: "Confirmed",
  },
  {
    pnr: "RSV-33812",
    trip: "TRP-90215",
    passenger: "A. Wagh",
    seat: "8C",
    boarding: "Mumbai Central",
    status: "Waitlisted",
  },
  {
    pnr: "RSV-33813",
    trip: "TRP-90217",
    passenger: "J. Fernandes",
    seat: "4A",
    boarding: "Colaba",
    status: "Confirmed",
  },
];

const boardingPoints = [
  { name: "Swargate", route: "MSRTC-9502", time: "14:30" },
  { name: "Katraj", route: "MSRTC-9502", time: "14:45" },
  { name: "Mumbai Central", route: "MSRTC-8801", time: "15:00" },
];

const occupancyTrend = [
  { day: "Mon", pct: 74 },
  { day: "Tue", pct: 71 },
  { day: "Wed", pct: 69 },
  { day: "Thu", pct: 76 },
  { day: "Fri", pct: 88 },
  { day: "Sat", pct: 94 },
  { day: "Sun", pct: 90 },
];

const passengerTrends = [
  { month: "Mar", passengers: 412 },
  { month: "Apr", passengers: 438 },
  { month: "May", passengers: 401 },
  { month: "Jun", passengers: 455 },
  { month: "Jul", passengers: 472 },
  { month: "Aug", passengers: 460 },
];

const faqs = [
  {
    q: "How do I reassign a vehicle to a different depot?",
    a: "Go to Fleet, open the vehicle record, and update its home depot field. The change is logged for audit.",
  },
  {
    q: "Why is an ETM device shown as offline?",
    a: "The device hasn't synced within the last 15 minutes. Tickets are still issued and queued for sync once connectivity returns.",
  },
  {
    q: "How do refunds get settled for cancelled tickets?",
    a: "Refunds route through Finance & Wallet and post to the original payment mode within 3–5 working days.",
  },
  {
    q: "Who can edit fare policies?",
    a: "Only users with the Finance Officer or System Administrator role, from Fare Management.",
  },
];

/* ---------------------------------------------------------------------
   SHARED DATA STORE — enables Add / Update / Delete across screens.
--------------------------------------------------------------------- */
const initialData = {
  regions,
  divisions,
  corporations,
  depots,
  busStations,
  workshops,
  parkingYards,
  routes,
  stops,
  stages,
  zones,
  farePolicies,
  ticketTypes,
  paymentModes,
  vehicleCategories,
  seatLayouts,
  holidays: holidays.map((h, i) => ({ id: `HOL-${i + 1}`, ...h })),
  notificationTemplates,
  complaintCategories,
  taxConfig,
  vehicles,
  trips,
  employees,
  tickets,
  reservations,
  boardingPoints: boardingPoints.map((b, i) => ({ id: `BP-${i + 1}`, ...b })),
  passes,
  concessions: concessions.map((c, i) => ({ id: `CON-${i + 1}`, ...c })),
  etmDevices,
  collections: collections.map((c, i) => ({ id: `COL-${i + 1}`, ...c })),
  walletTxns,
  complaints,
  users: users.map((u, i) => ({ id: `USR-${i + 1}`, ...u })),
  attendanceSummary,
};

function dataReducer(state: any, action: any) {
  switch (action.type) {
    case "add":
      return { ...state, [action.col]: [...state[action.col], action.item] };
    case "update":
      return {
        ...state,
        [action.col]: state[action.col].map((r: any) =>
          r[action.idKey] === action.matchId ? action.item : r,
        ),
      };
    case "remove":
      return {
        ...state,
        [action.col]: state[action.col].filter(
          (r: any) => r[action.idKey] !== action.id,
        ),
      };
    default:
      return state;
  }
}

const DataContext = createContext<any>(null);

function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialData);
  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

function useCrud(
  col: string,
  idKey: string,
): [
  any[],
  {
    add: (item: any) => void;
    update: (item: any) => void;
    remove: (id: any) => void;
  },
] {
  const { state, dispatch } = useContext(DataContext);
  const data = state[col];
  return [
    data,
    {
      add: (item) => dispatch({ type: "add", col, item }),
      update: (item) => dispatch({ type: "update", col, idKey, item }),
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
    "/Organization/organizationManagement/Corporations": "Corporation",
    "/Organization/organizationManagement/Regions": "Regions",
    "/Organization/organizationManagement/Divisions": "Divisions",
    "/Organization/organizationManagement/Zone": "Zone",
    "/Organization/organizationManagement/Depots": "Depots",
    "/Organization/organizationManagement/Stations": "Stations",
    "/Organization/organizationManagement/WorkShop": "WorkShop",
    "/Organization/organizationManagement/ParkingYards": "Parking Yards",
  };

  const activeTab = tabMap[location.pathname] || "Corporation";

  const handleTabChange = (tabName: string) => {
    const routeMap: Record<string, string> = {
      Corporation: "/Organization/organizationManagement/Corporations",
      Regions: "/Organization/organizationManagement/Regions",
      Divisions: "/Organization/organizationManagement/Divisions",
      Zone: "/Organization/organizationManagement/Zone",
      Depots: "/Organization/organizationManagement/Depots",
      Stations: "/Organization/organizationManagement/Stations",
      WorkShop: "/Organization/organizationManagement/WorkShop",
      "Parking Yards": "/Organization/organizationManagement/ParkingYards",
    };
    navigate(routeMap[tabName]);
  };

  return (
    <div>
      <SectionHeader
        eyebrow="TBL_MAST_ORG_UNIT · TBL_MAST_DEPOT"
        title="Organization management"
      />
      <SubTabs
        tabs={[
          "Corporation",
          "Regions",
          "Divisions",
          "Zone",
          "Depots",
          "Stations",
          "WorkShop",
          "Parking Yards",
        ]}
        active={activeTab}
        onChange={handleTabChange}
      />
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
      Routes: "/Organization/masters/Route",
      Stops: "/Organization/masters/Stop",
      Stages: "/Organization/masters/Stages",
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
      <SectionHeader
        eyebrow="Reference data used across scheduling, ticketing & fares"
        title="Master data"
      />
      <SubTabs
        tabs={[
          "Vehicle Categories",
          "Routes",
          "Stops",
          "Stages",
          "Fare Policies",
          "Ticket Types",
          "Payment Modes",
          "Seat Layouts",
          "Holiday Calendar",
          "Notification Templates",
          "Complaint Categories",
          "Tax Configuration",
        ]}
        active={activeTab}
        onChange={handleTabChange}
      />
      <Outlet />
    </div>
  );
}

function UserManagementLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabMap: Record<string, string> = {
    "/Organization/userManagement/RoleMaster": "Role Master",
    "/Organization/userManagement/UserMaster": "User Master",
    "/Organization/userManagement/ScreenMaster": "Screen Master",
    "/Organization/userManagement/Authorization": "Authorization",
  };

  const activeTab = tabMap[location.pathname] || "Role Master";
  const routeMap: Record<string, string> = {
    "Role Master": "/Organization/userManagement/RoleMaster",
    "User Master": "/Organization/userManagement/UserMaster",
    "Screen Master": "/Organization/userManagement/ScreenMaster",
    Authorization: "/Organization/userManagement/Authorization",
  };

  return (
    <div>
      <SectionHeader
        eyebrow="TBL_MAST_ROLE · TBL_MAST_APP_USER · SCREEN_AUTHORIZATION"
        title="User management"
      />
      <SubTabs
        tabs={["Role Master", "User Master", "Screen Master", "Authorization"]}
        active={activeTab}
        onChange={(tab) => navigate(routeMap[tab])}
      />
      <Outlet />
    </div>
  );
}




function DepotsTab() {
  const [vehiclesData] = useCrud("vehicles", "reg");
  return (
    <Depots
      vehiclesData={vehiclesData}
    />
  );
}
function BusStationTab() {
  return (
    <BusStation />
  );
}
function WorkshopsTab() {
  return (
    <Workshops />
  );
}
function ParkingYardsTab() {
  return (
    <ParkingYards />
  );
}

function RouteTab() {
  return (
    <RouteMaster />
  );
}
function StopTab() {
  return (
    <Stop />
  );
}
function StagesTab() {
  return (
    <Stages />
  );
}
function FarePoliciesTab() {
  return (
    <FarePolicies />
  );
}
function TicketTypesTab() {
  return (
    <TicketTypes />
  );
}
function PaymentModesTab() {
  const [paymentModesData, paymentModesCrud] = useCrud("paymentModes", "code");
  return (
    <PaymentModes
      data={paymentModesData}
      onAdd={paymentModesCrud.add}
      onUpdate={paymentModesCrud.update}
      onDelete={paymentModesCrud.remove}
    />
  );
}
function VehicleCategoriesTab() {
  return (
    <VehicleCategories />
  );
}
function SeatLayoutsTab() {
  const [vehicleCategoriesData] = useCrud("vehicleCategories", "code");
  const [seatLayoutsData, seatLayoutsCrud] = useCrud("seatLayouts", "code");
  return (
    <SeatLayouts
      data={seatLayoutsData}
      categoryOptions={vehicleCategoriesData}
      onAdd={seatLayoutsCrud.add}
      onUpdate={seatLayoutsCrud.update}
      onDelete={seatLayoutsCrud.remove}
    />
  );
}
function HolidayCalendarTab() {
  const [holidaysData, holidaysCrud] = useCrud("holidays", "id");
  // const [, dispatch] = useContext(DataContext);
  return (
    <HolidayCalendar
      data={holidaysData}
      onAdd={(v) =>
        holidaysCrud.add({
          id: `HOL-${Math.floor(Math.random() * 9000) + 1000}`,
          ...v,
        })
      }
      onUpdate={holidaysCrud.update}
      onDelete={holidaysCrud.remove}
    />
  );
}
function NotificationTemplatesTab() {
  const [notificationTemplatesData, notificationTemplatesCrud] = useCrud(
    "notificationTemplates",
    "code",
  );
  return (
    <NotificationTemplates
      data={notificationTemplatesData}
      onAdd={notificationTemplatesCrud.add}
      onUpdate={notificationTemplatesCrud.update}
      onDelete={notificationTemplatesCrud.remove}
    />
  );
}
function ComplaintCategoriesTab() {
  const [complaintCategoriesData, complaintCategoriesCrud] = useCrud(
    "complaintCategories",
    "complaintId",
  );
  return (
    <ComplaintCategories
      data={complaintCategoriesData}
      onAdd={complaintCategoriesCrud.add}
      onUpdate={complaintCategoriesCrud.update}
      onDelete={complaintCategoriesCrud.remove}
    />
  );
}
function TaxConfigurationTab() {
  const [taxConfigData, taxConfigCrud] = useCrud("taxConfig", "code");
  return (
    <TaxConfiguration
      data={taxConfigData}
      onAdd={taxConfigCrud.add}
      onUpdate={taxConfigCrud.update}
      onDelete={taxConfigCrud.remove}
    />
  );
}

function FleetTab() {
  const [vehiclesData, vehiclesCrud] = useCrud("vehicles", "reg");
  const [depotsData] = useCrud("depots", "code");
  const [vehicleCategoriesData] = useCrud("vehicleCategories", "categoryId");
  const underMaint = vehiclesData.filter(
    (v) => v.status === "Under maintenance",
  ).length;
  const breakdowns = vehiclesData.filter(
    (v) => v.status === "Breakdown",
  ).length;
  return (
    <div>
      <SectionHeader
        eyebrow="TBL_MAST_VEHICLE · TBL_TRANS_VEHICLE_DOCUMENT · TBL_TRANS_MAINTENANCE_RECORD"
        title="Fleet management"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <KpiCard label="Total fleet" value={vehiclesData.length} icon={Bus} />
        <KpiCard
          label="Under maintenance"
          value={underMaint}
          icon={Wrench}
          tone="amber"
        />
        <KpiCard
          label="Breakdowns open"
          value={breakdowns}
          icon={AlertTriangle}
          tone="red"
        />
        <KpiCard
          label="Docs expiring ≤30d"
          value="17"
          icon={Clock}
          tone="amber"
        />
      </div>
      <VehicleRegister
        data={vehiclesData}
        depotOptions={depotsData}
        categoryOptions={vehicleCategoriesData}
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
      Roster: "/Operations/employees/Roster",
      Attendance: "/Operations/employees/Attendance",
    };
    navigate(routeMap[tabName]);
  };

  return (
    <div>
      <SectionHeader
        eyebrow="TBL_MAST_EMPLOYEE · TBL_TRANS_ATTENDANCE · TBL_TRANS_DUTY_ROSTER"
        title="Employee management"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <KpiCard label="Total employees" value="1,842" icon={Users2} />
        <KpiCard
          label="On duty now"
          value="601"
          icon={UserCheck}
          tone="green"
        />
        <KpiCard label="On leave" value="34" icon={Clock} tone="amber" />
        <KpiCard
          label="Absent today"
          value="12"
          icon={AlertTriangle}
          tone="red"
        />
      </div>
      <SubTabs
        tabs={["Roster", "Attendance"]}
        active={activeTab}
        onChange={handleTabChange}
      />
      <Outlet />
    </div>
  );
}

function RosterTab() {
  const [employeesData, employeesCrud] = useCrud("employees", "id");
  const [depotsData] = useCrud("depots", "code");
  return (
    <Roster
      data={employeesData}
      depotOptions={depotsData}
      onAdd={employeesCrud.add}
      onUpdate={employeesCrud.update}
      onDelete={employeesCrud.remove}
    />
  );
}
function AttendanceTab() {
  return <Attendance data={attendanceSummary} />;
}

function RoutesScheduleTab() {
  const [routesData] = useCrud("routes", "code");
  const [employeeData] = useCrud("employees", "empId");
  const [vehiclesData] = useCrud("vehicles", "reg");
  const [tripsData, tripsCrud] = useCrud("trips", "id");
  return (
    <RoutesAndSchedule
      routes={routesData}
      fleetOptions={vehiclesData}
      driverOptions={employeeData.filter(
        (x) => x.role.toLowerCase() === "driver",
      )}
      conductorOptions={employeeData.filter(
        (x) => x.role.toLowerCase() === "conductor",
      )}
      trips={tripsData}
      onAdd={tripsCrud.add}
      onUpdate={tripsCrud.update}
      onDelete={tripsCrud.remove}
    />
  );
}
function LiveTrackingTab() {
  return <LiveTracking liveBuses={liveBuses} />;
}

function FaresTab() {
  const [farePoliciesData] = useCrud("farePolicies", "code");
  return (
    <FareManagement farePolicies={farePoliciesData} concessions={concessions} />
  );
}
function TicketingTab() {
  const [ticketsData] = useCrud("tickets", "ref");
  return <Ticketing tickets={ticketsData} />;
}
function ReservationsTab() {
  const [reservationsData] = useCrud("reservations", "pnr");
  return (
    <Reservations
      reservations={reservationsData}
      seatMap={seatMap}
      boardingPoints={boardingPoints}
    />
  );
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
  return (
    <FinanceWallet collections={collectionsData} walletTxns={walletTxns} />
  );
}

function SupportTab() {
  const [complaintsData] = useCrud("complaints", "id");
  return <ComplaintsAlerts complaints={complaintsData} />;
}
function ReportsTab() {
  return <Reports onTimeByDepot={onTimeByDepot} channelSplit={channelSplit} />;
}
function AnalyticsTab() {
  return (
    <Analytics
      occupancyTrend={occupancyTrend}
      passengerTrends={passengerTrends}
      onTimeByDepot={onTimeByDepot}
      channelSplit={channelSplit}
    />
  );
}
function AdminTab() {
  const [usersData, usersCrud] = useCrud("users", "id");
  return (
    <UsersRoles
      data={usersData}
      onUpdate={usersCrud.update}
      onDelete={usersCrud.remove}
    />
  );
}
function HelpTab() {
  return <Help faqs={faqs} />;
}

/* ---------------------------------------------------------------------
   NAVIGATION + SHELL
--------------------------------------------------------------------- */
const NAV = [
  {
    group: null,
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    group: "Organization",
    items: [
      {
        id: "organization",
        label: "Organization",
        icon: Building2,
        path: "/Organization/organizationManagement/Depots",
      },
      {
        id: "masters",
        label: "Master Data",
        icon: Database,
        path: "/Organization/masters/Route",
      },
      {
        id: "user-management",
        label: "User Management",
        icon: ShieldCheck,
        path: "/Organization/userManagement/RoleMaster",
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        id: "fleet",
        label: "Fleet",
        icon: Bus,
        path: "/Operations/fleet/VehicleRegister",
      },
      {
        id: "employees",
        label: "Employees",
        icon: UserCog,
        path: "/Operations/employees/Roster",
      },
      {
        id: "routes",
        label: "Routes & Schedule",
        icon: Milestone,
        path: "/Operations/routesAndSchedule/RoutesAndSchedule",
      },
      {
        id: "tracking",
        label: "Live Tracking",
        icon: Radar,
        path: "/Operations/liveTracking/LiveTracking",
      },
    ],
  },
  {
    group: "Commercial",
    items: [
      {
        id: "fares",
        label: "Fare Management",
        icon: IndianRupee,
        path: "/Commercial/fareManagement/FareManagement",
      },
      {
        id: "ticketing",
        label: "Ticketing",
        icon: Ticket,
        path: "/Commercial/ticketing/Ticketing",
      },
      {
        id: "reservations",
        label: "Reservations",
        icon: CalendarCheck,
        path: "/Commercial/reservations/Reservations",
      },
      {
        id: "passes",
        label: "Passes",
        icon: Armchair,
        path: "/Commercial/passes/Passes",
      },
    ],
  },
  {
    group: "Systems",
    items: [
      {
        id: "etm",
        label: "ETM Devices",
        icon: Smartphone,
        path: "/Systems/etmDevices/EtmDevices",
      },
      {
        id: "finance",
        label: "Finance & Wallet",
        icon: Wallet,
        path: "/Systems/financeWallet/FinanceWallet",
      },
    ],
  },
  {
    group: "Support",
    items: [
      {
        id: "support",
        label: "Complaints & Alerts",
        icon: MessageSquareWarning,
        path: "/Support/complaintsAlerts/ComplaintsAlerts",
      },
      {
        id: "reports",
        label: "Reports",
        icon: BarChart3,
        path: "/Support/reports/Reports",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: LineChartIcon,
        path: "/Support/analytics/Analytics",
      },
      {
        id: "admin",
        label: "Users & Roles",
        icon: ShieldCheck,
        path: "/Support/usersRoles/UsersRoles",
      },
      {
        id: "help",
        label: "Help",
        icon: HelpCircle,
        path: "/Support/help/Help",
      },
    ],
  },
];

function ConsoleShell({
  session,
  onLogout,
}: {
  session: any;
  onLogout: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className="stc-body"
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: T.canvas,
        color: T.text,
      }}
    >
      <style>{fontStack}</style>

      <Sidebar
        nav={NAV}
        session={session}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main
          className="stc-scroll"
          style={{ flex: 1, overflowY: "auto", padding: 24 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const PageFallback = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 260,
      fontSize: 14,
      color: T.textSoft,
    }}
  >
    Loading section…
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function AuthGate() {
  const [session, setSession] = useState<any>({
    name: "Guest Admin",
    role: "Super Admin",
    depot: "All depots",
  });
  const [, usersCrud] = useCrud("users", "id");

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <AdminAuthScreen onLogin={setSession} onAddUser={usersCrud.add} />
          }
        />
        <Route
          path="/"
          element={
            <ConsoleShell
              session={
                session || {
                  name: "Guest Admin",
                  role: "Super Admin",
                  depot: "All depots",
                }
              }
              onLogout={() => setSession(null)}
            />
          }
        >
          <Route index element={<DashboardTabWrapper />} />

          {/* Organization Sub-Routes */}
          <Route
            path="Organization/organizationManagement"
            element={<OrganizationLayout />}
          >
            <Route index element={<Navigate to="Corporations" replace />} />
            <Route path="Corporations" element={<Corporations />} />
            <Route path="Regions" element={<Regions />} />
            <Route path="Divisions" element={<Divisions />} />
            <Route path="Zone" element={<Zones />} />
            <Route path="Depots" element={<DepotsTab />} />
            <Route path="Stations" element={<BusStationTab />} />
            <Route path="WorkShop" element={<WorkshopsTab />} />
            <Route path="ParkingYards" element={<ParkingYardsTab />} />
          </Route>

          <Route path="Organization/masters" element={<MasterDataLayout />}>
            <Route index element={<Navigate to="Route" replace />} />
            <Route path="Route" element={<RouteTab />} />
            <Route path="Stop" element={<StopTab />} />
            <Route path="Stages" element={<StagesTab />} />
            <Route path="zones" element={<Zones />} />
            <Route path="FarePolicies" element={<FarePoliciesTab />} />
            <Route path="TicketTypes" element={<TicketTypesTab />} />
            <Route path="PaymentModes" element={<PaymentModesTab />} />
            <Route
              path="VehicleCategories"
              element={<VehicleCategoriesTab />}
            />
            <Route path="SeatLayouts" element={<SeatLayoutsTab />} />
            <Route path="HolidayCalendar" element={<HolidayCalendarTab />} />
            <Route
              path="NotificationTemplates"
              element={<NotificationTemplatesTab />}
            />
            <Route
              path="ComplaintCategories"
              element={<ComplaintCategoriesTab />}
            />
            <Route path="TaxConfiguration" element={<TaxConfigurationTab />} />
          </Route>

          {/* User Management Sub-Routes */}
          <Route
            path="Organization/userManagement"
            element={<UserManagementLayout />}
          >
            <Route index element={<Navigate to="RoleMaster" replace />} />
            <Route path="RoleMaster" element={<RoleMaster />} />
            <Route path="UserMaster" element={<UserMaster />} />
            <Route path="ScreenMaster" element={<ScreenMaster />} />
            <Route path="Authorization" element={<Authorization />} />
          </Route>

          {/* Operations Sub-Routes */}
          <Route
            path="Operations/fleet/VehicleRegister"
            element={<FleetTab />}
          />
          <Route path="Operations/employees" element={<EmployeesLayout />}>
            <Route index element={<Navigate to="Roster" replace />} />
            <Route path="Roster" element={<RosterTab />} />
            <Route path="Attendance" element={<AttendanceTab />} />
          </Route>
          <Route
            path="Operations/routesAndSchedule/RoutesAndSchedule"
            element={<RoutesScheduleTab />}
          />
          <Route
            path="Operations/liveTracking/LiveTracking"
            element={<LiveTrackingTab />}
          />

          {/* Commercial Routes */}
          <Route
            path="Commercial/fareManagement/FareManagement"
            element={<FaresTab />}
          />
          <Route
            path="Commercial/ticketing/Ticketing"
            element={<TicketingTab />}
          />
          <Route
            path="Commercial/reservations/Reservations"
            element={<ReservationsTab />}
          />
          <Route path="Commercial/passes/Passes" element={<PassesTab />} />

          {/* Systems Routes */}
          <Route
            path="Systems/etmDevices/EtmDevices"
            element={<EtmDevicesTab />}
          />
          <Route
            path="Systems/financeWallet/FinanceWallet"
            element={<FinanceWalletTab />}
          />

          {/* Support Routes */}
          <Route
            path="Support/complaintsAlerts/ComplaintsAlerts"
            element={<SupportTab />}
          />
          <Route path="Support/reports/Reports" element={<ReportsTab />} />
          <Route
            path="Support/analytics/Analytics"
            element={<AnalyticsTab />}
          />
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
              background: T.ink,
              color: T.inkText,
              border: "1px solid " + T.inkBorder,
              borderRadius: "8px",
              fontSize: "13px",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
