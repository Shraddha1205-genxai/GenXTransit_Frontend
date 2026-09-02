import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  Modal,
  StatusBadge,
  Table,
  TableToolbar,
  Td,
  Th,
} from "../../../components/common";
import {
  menuService,
  type MenuInsertPayload,
  type MenuRecordApi,
  type MenuUpdatePayload,
} from "../../../api/organization/userManagement/menuService";
import {
  sectionService,
  type SectionInsertPayload,
  type SectionRecordApi,
  type SectionUpdatePayload,
} from "../../../api/organization/userManagement/sectionService";
import {
  tabService,
  type TabInsertPayload,
  type TabRecordApi,
  type TabUpdatePayload,
} from "../../../api/organization/userManagement/tabService";

export interface SectionRecord {
  sectionId: string;
  sectionName: string;
  isActive: boolean;
}

export interface MenuRecord {
  menuId: string;
  menuName: string;
  iconName: string;
  sectionId: string;
  sectionName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ScreenRecord {
  screenId: string;
  pageKey: string;
  tabName: string;
  menuLabel: string;
  menuId: string;
  sectionId: string;
  sectionName: string;
  iconName: string;
  sortOrder: number;
  frontendUrl: string;
  isActive: boolean;
}

const MENU_SECTION_MAP: Record<number, string> = {
  1: "ORG",
  2: "OPS",
  3: "COM",
  4: "SYS",
  5: "SUP",
};

const MENU_SECTION_ID_MAP: Record<string, number> = {
  ORG: 1,
  OPS: 2,
  COM: 3,
  SYS: 4,
  SUP: 5,
};

const initialMenus: MenuRecord[] = [
  {
    menuId: "organization-management",
    menuName: "Organization Management",
    iconName: "Building2",
    sectionId: "ORG",
    sectionName: "Organization",
    sortOrder: 1,
    isActive: true,
  },
  {
    menuId: "master-data",
    menuName: "Master Data",
    iconName: "Database",
    sectionId: "ORG",
    sectionName: "Organization",
    sortOrder: 2,
    isActive: true,
  },
  {
    menuId: "user-management",
    menuName: "User Management",
    iconName: "ShieldCheck",
    sectionId: "ORG",
    sectionName: "Organization",
    sortOrder: 3,
    isActive: true,
  },
  {
    menuId: "fleet",
    menuName: "Fleet",
    iconName: "Bus",
    sectionId: "OPS",
    sectionName: "Operations",
    sortOrder: 1,
    isActive: true,
  },
  {
    menuId: "employees",
    menuName: "Employees",
    iconName: "UserCog",
    sectionId: "OPS",
    sectionName: "Operations",
    sortOrder: 2,
    isActive: true,
  },
  {
    menuId: "routes-schedule",
    menuName: "Routes & Schedule",
    iconName: "Milestone",
    sectionId: "OPS",
    sectionName: "Operations",
    sortOrder: 3,
    isActive: true,
  },
  {
    menuId: "live-tracking",
    menuName: "Live Tracking",
    iconName: "Radar",
    sectionId: "OPS",
    sectionName: "Operations",
    sortOrder: 4,
    isActive: true,
  },
  {
    menuId: "fare-management",
    menuName: "Fare Management",
    iconName: "IndianRupee",
    sectionId: "COM",
    sectionName: "Commercial",
    sortOrder: 1,
    isActive: true,
  },
  {
    menuId: "ticketing",
    menuName: "Ticketing",
    iconName: "Ticket",
    sectionId: "COM",
    sectionName: "Commercial",
    sortOrder: 2,
    isActive: true,
  },
  {
    menuId: "reservations",
    menuName: "Reservations",
    iconName: "CalendarCheck",
    sectionId: "COM",
    sectionName: "Commercial",
    sortOrder: 3,
    isActive: true,
  },
  {
    menuId: "passes",
    menuName: "Passes",
    iconName: "Armchair",
    sectionId: "COM",
    sectionName: "Commercial",
    sortOrder: 4,
    isActive: true,
  },
  {
    menuId: "etm-devices",
    menuName: "ETM Devices",
    iconName: "Smartphone",
    sectionId: "SYS",
    sectionName: "Systems",
    sortOrder: 1,
    isActive: true,
  },
  {
    menuId: "finance-wallet",
    menuName: "Finance & Wallet",
    iconName: "Wallet",
    sectionId: "SYS",
    sectionName: "Systems",
    sortOrder: 2,
    isActive: true,
  },
  {
    menuId: "complaints-alerts",
    menuName: "Complaints & Alerts",
    iconName: "MessageSquareWarning",
    sectionId: "SUP",
    sectionName: "Support",
    sortOrder: 1,
    isActive: true,
  },
  {
    menuId: "reports",
    menuName: "Reports",
    iconName: "BarChart3",
    sectionId: "SUP",
    sectionName: "Support",
    sortOrder: 2,
    isActive: true,
  },
  {
    menuId: "analytics",
    menuName: "Analytics",
    iconName: "LineChart",
    sectionId: "SUP",
    sectionName: "Support",
    sortOrder: 3,
    isActive: true,
  },
  {
    menuId: "users-roles",
    menuName: "Users & Roles",
    iconName: "ShieldCheck",
    sectionId: "SUP",
    sectionName: "Support",
    sortOrder: 4,
    isActive: true,
  },
  {
    menuId: "help",
    menuName: "Help",
    iconName: "HelpCircle",
    sectionId: "SUP",
    sectionName: "Support",
    sortOrder: 5,
    isActive: true,
  },
];

const makeScreen = (
  id: number,
  sectionId: string,
  sectionName: string,
  menuId: string,
  menuLabel: string,
  tabName: string,
  url: string,
  sortOrder = 1,
): ScreenRecord => ({
  screenId: `SCR-ID-${String(id).padStart(3, "0")}`,
  pageKey: tabName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  tabName,
  menuLabel,
  menuId,
  sectionId,
  sectionName,
  iconName: initialMenus.find((menu) => menu.menuId === menuId)?.iconName || "",
  sortOrder,
  frontendUrl: url,
  isActive: true,
});

export const initialScreens: ScreenRecord[] = [
  ...[
    "Corporation",
    "Regions",
    "Divisions",
    "Zone",
    "Depots",
    "Stations",
    "WorkShop",
    "Parking Yards",
  ].map((tab, index) =>
    makeScreen(
      index + 1,
      "ORG",
      "Organization",
      "organization-management",
      "Organization Management",
      tab,
      `/Organization/organizationManagement/${tab === "Corporation" ? "Corporations" : tab === "Zone" ? "Zone" : tab === "Stations" ? "Stations" : tab === "WorkShop" ? "WorkShop" : tab.replace(/ /g, "")}`,
      index + 1,
    ),
  ),
  ...[
    "Routes",
    "Stops",
    "Stages",
    "Fare Policies",
    "Ticket Types",
    "Payment Modes",
    "Vehicle Categories",
    "Seat Layouts",
    "Holiday Calendar",
    "Notification Templates",
    "Complaint Categories",
    "Tax Configuration",
  ].map((tab, index) =>
    makeScreen(
      index + 9,
      "ORG",
      "Organization",
      "master-data",
      "Master Data",
      tab,
      `/Organization/masters/${tab.replace(/[^a-zA-Z]/g, "")}`,
      index + 1,
    ),
  ),
  ...["Role Master", "User Master", "Screen Master", "Authorization"].map(
    (tab, index) =>
      makeScreen(
        index + 21,
        "ORG",
        "Organization",
        "user-management",
        "User Management",
        tab,
        `/Organization/userManagement/${tab.replace(/ /g, "")}`,
        index + 1,
      ),
  ),
  makeScreen(
    25,
    "OPS",
    "Operations",
    "fleet",
    "Fleet",
    "Vehicle Register",
    "/Operations/fleet/VehicleRegister",
  ),
  makeScreen(
    26,
    "OPS",
    "Operations",
    "employees",
    "Employees",
    "Roster",
    "/Operations/employees/Roster",
  ),
  makeScreen(
    27,
    "OPS",
    "Operations",
    "employees",
    "Employees",
    "Attendance",
    "/Operations/employees/Attendance",
    2,
  ),
  makeScreen(
    28,
    "OPS",
    "Operations",
    "routes-schedule",
    "Routes & Schedule",
    "Routes & Schedule",
    "/Operations/routesAndSchedule/RoutesAndSchedule",
  ),
  makeScreen(
    29,
    "OPS",
    "Operations",
    "live-tracking",
    "Live Tracking",
    "Live Tracking",
    "/Operations/liveTracking/LiveTracking",
  ),
  ...["Fare Management", "Ticketing", "Reservations", "Passes"].map(
    (tab, index) =>
      makeScreen(
        index + 30,
        "COM",
        "Commercial",
        tab.toLowerCase().replace(/ /g, "-"),
        tab,
        tab,
        `/Commercial/${tab.toLowerCase().replace(/ /g, "")}/${tab.replace(/ /g, "")}`,
      ),
  ),
  makeScreen(
    34,
    "SYS",
    "Systems",
    "etm-devices",
    "ETM Devices",
    "ETM Devices",
    "/Systems/etmDevices/EtmDevices",
  ),
  makeScreen(
    35,
    "SYS",
    "Systems",
    "finance-wallet",
    "Finance & Wallet",
    "Finance & Wallet",
    "/Systems/financeWallet/FinanceWallet",
  ),
  ...[
    "Complaints & Alerts",
    "Reports",
    "Analytics",
    "Users & Roles",
    "Help",
  ].map((tab, index) =>
    makeScreen(
      index + 36,
      "SUP",
      "Support",
      tab.toLowerCase().replace(/[^a-z]+/g, "-"),
      tab,
      tab,
      `/Support/${tab.toLowerCase().replace(/[^a-z]+/g, "")}/${tab.replace(/ /g, "")}`,
    ),
  ),
];

type FormType = "section" | "menu" | "tab";

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        minHeight: 38,
        padding: "0 16px",
        borderRadius: 7,
        border: `1px solid ${T.amber}`,
        fontSize: 12,
        fontWeight: 700,
        color: T.amberDeep,
        background: T.amberFill,
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <Plus size={15} /> {label}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="stc-field">
      <label className="stc-field-label">{label}</label>
      {children}
    </div>
  );
}

export default function ScreenMaster() {
  const queryClient = useQueryClient();
  const [screens, setScreens] = useState<ScreenRecord[]>(initialScreens);
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState<FormType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [sectionName, setSectionName] = useState("");
  const { data: apiSections = [] } = useQuery({
    queryKey: ["section"],
    queryFn: () => sectionService.getAll(),
    staleTime: 0,
  });

  const mappedSections = useMemo<SectionRecord[]>(() => {
    if (!apiSections.length) return [];

    return apiSections.map((section: SectionRecordApi) => ({
      sectionId: String(section.sectionId),
      sectionName: section.sectionName,
      isActive: section.isActive,
    }));
  }, [apiSections]);

  const [sections, setSections] = useState<SectionRecord[]>(mappedSections);
  React.useEffect(() => {
    setSections(mappedSections);
    setExpandedSections((current) => {
      const nextState: Record<string, boolean> = {};
      mappedSections.forEach((section) => {
        nextState[section.sectionId] =
          current[section.sectionId] ?? section.isActive;
      });
      return nextState;
    });
  }, [mappedSections]);

  const { data: apiMenus = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: () => menuService.getAll(),
    staleTime: 0,
  });

  const mappedMenus = useMemo<MenuRecord[]>(() => {
    if (!apiMenus.length) return [];

    return apiMenus.map((menu: MenuRecordApi) => {
      const backendSectionId = String(menu.sectionId);
      const sectionFromApi = sections.find(
        (item) => String(item.sectionId) === backendSectionId,
      );

      return {
        menuId: String(menu.id),
        menuName: menu.menuName,
        iconName: menu.iconName,
        sectionId: String(sectionFromApi?.sectionId ?? backendSectionId),
        sectionName: sectionFromApi?.sectionName ?? "",
        sortOrder: menu.sortOrder,
        isActive: menu.isActive,
      };
    });
  }, [apiMenus, sections]);

  const [menus, setMenus] = useState<MenuRecord[]>(mappedMenus);
  React.useEffect(() => {
    setMenus(mappedMenus);
  }, [mappedMenus]);

  const { data: apiTabs = [] } = useQuery({
    queryKey: ["tab"],
    queryFn: () => tabService.getAll(),
    staleTime: 0,
  });

  const mappedTabs = useMemo<ScreenRecord[]>(() => {
    if (!apiTabs.length) return [];

    return apiTabs.map((tab: TabRecordApi) => {
      const section = sections.find(
        (item) => item.sectionId === String(tab.sectionId),
      );
      const menu = menus.find((item) => item.menuId === String(tab.menuId));

      return {
        screenId: String(tab.tabId),
        pageKey: tab.tabName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tabName: tab.tabName,
        menuLabel: menu?.menuName || "",
        menuId: String(tab.menuId),
        sectionId: String(tab.sectionId),
        sectionName: section?.sectionName || "",
        iconName: menu?.iconName || "",
        sortOrder: tab.sortOrder,
        frontendUrl: tab.url,
        isActive: tab.isActive,
      };
    });
  }, [apiTabs, sections, menus]);

  React.useEffect(() => {
    if (apiTabs.length) {
      setScreens(mappedTabs);
    }
  }, [apiTabs, mappedTabs]);

  const sectionInsertMutation = useMutation({
    mutationFn: (payload: SectionInsertPayload) =>
      sectionService.insert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section"] });
      toast.success("Section added successfully.");
      closeForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add section");
    },
  });

  const sectionUpdateMutation = useMutation({
    mutationFn: (payload: SectionUpdatePayload) =>
      sectionService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section"] });
      toast.success("Section updated successfully.");
      closeForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update section");
    },
  });

  const sectionDeleteMutation = useMutation({
    mutationFn: (payload: { sectionId: number }) =>
      sectionService.delete(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section"] });
      toast.success("Section deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete section");
    },
  });

  const menuInsertMutation = useMutation({
    mutationFn: (payload: MenuInsertPayload) => menuService.insert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu added successfully.");
      closeForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add menu");
    },
  });

  const menuUpdateMutation = useMutation({
    mutationFn: (payload: MenuUpdatePayload) => menuService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu updated successfully.");
      closeForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update menu");
    },
  });

  const tabInsertMutation = useMutation({
    mutationFn: (payload: TabInsertPayload) => tabService.insert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tab"] });
      toast.success("Tab added successfully.");
      closeForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add tab");
    },
  });

  const tabUpdateMutation = useMutation({
    mutationFn: (payload: TabUpdatePayload) => tabService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tab"] });
      toast.success("Tab updated successfully.");
      closeForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update tab");
    },
  });

  const tabDeleteMutation = useMutation({
    mutationFn: (payload: { tabId: number }) => tabService.delete(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tab"] });
      toast.success("Tab deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete tab");
    },
  });

  const [menuForm, setMenuForm] = useState({
    menuName: "",
    iconName: "",
    sectionId: "ORG",
    sortOrder: 1,
  });
  const [tabForm, setTabForm] = useState({
    sectionId: "ORG",
    menuId: "organization-management",
    tabName: "",
    sortOrder: 1,
    frontendUrl: "",
  });

  const activeSections = sections.filter((item) => item.isActive);
  const activeMenus = menus.filter((item) => item.isActive);
  const menuFormOptions = activeMenus.filter(
    (item) => item.sectionId === menuForm.sectionId,
  );
  const tabFormOptions = activeMenus.filter(
    (item) => item.sectionId === tabForm.sectionId,
  );
  const filteredScreens = screens.filter((screen) =>
    `${screen.tabName} ${screen.menuLabel} ${screen.sectionName} ${screen.frontendUrl}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !(current[sectionId] ?? true),
    }));
  };

  const openSection = (section?: SectionRecord) => {
    setEditingId(section?.sectionId || null);
    setSectionName(section?.sectionName || "");
    setFormType("section");
  };
  const openMenu = (menu?: MenuRecord) => {
    setEditingId(menu?.menuId || null);
    setMenuForm(
      menu
        ? {
            menuName: menu.menuName,
            iconName: menu.iconName,
            sectionId: menu.sectionId,
            sortOrder: menu.sortOrder,
          }
        : {
            menuName: "",
            iconName: "",
            sectionId: activeSections[0]?.sectionId || "",
            sortOrder: activeMenus.length + 1,
          },
    );
    setFormType("menu");
  };
  const openTab = (screen?: ScreenRecord) => {
    setEditingId(screen?.screenId || null);
    setTabForm(
      screen
        ? {
            sectionId: screen.sectionId,
            menuId: screen.menuId,
            tabName: screen.tabName,
            sortOrder: screen.sortOrder,
            frontendUrl: screen.frontendUrl,
          }
        : {
            sectionId: activeSections[0]?.sectionId || "",
            menuId: activeMenus[0]?.menuId || "",
            tabName: "",
            sortOrder: screens.length + 1,
            frontendUrl: "",
          },
    );
    setFormType("tab");
  };
  const closeForm = () => {
    setFormType(null);
    setEditingId(null);
  };

  const saveForm = () => {
    if (formType === "section") {
      const name = sectionName.trim();
      if (!name) return;

      if (editingId) {
        sectionUpdateMutation.mutate({
          sectionId: Number(editingId),
          sectionName: name,
          isActive: true,
        });
        return;
      }

      sectionInsertMutation.mutate({
        sectionName: name,
        isActive: true,
      });
      return;
    }
    if (formType === "menu") {
      if (!menuForm.menuName.trim() || !menuForm.sectionId) return;

      const payload = {
        iconName: menuForm.iconName.trim(),
        sectionId: MENU_SECTION_ID_MAP[menuForm.sectionId] ?? 1,
        sortOrder: Number(menuForm.sortOrder) || 1,
        menuName: menuForm.menuName.trim(),
        isActive: true,
      };

      if (editingId) {
        menuUpdateMutation.mutate({
          id: Number(editingId),
          ...payload,
        });
        return;
      }

      menuInsertMutation.mutate(payload);
      return;
    }
    if (formType === "tab") {
      if (
        !tabForm.tabName.trim() ||
        !tabForm.menuId ||
        !tabForm.frontendUrl.trim()
      )
        return;

      const payload = {
        sectionId: Number(tabForm.sectionId || sections[0]?.sectionId || 1),
        menuId: Number(tabForm.menuId),
        tabName: tabForm.tabName.trim(),
        sortOrder: Number(tabForm.sortOrder) || 1,
        url: tabForm.frontendUrl.trim(),
        isActive: true,
      };

      if (editingId) {
        tabUpdateMutation.mutate({
          tabId: Number(editingId),
          ...payload,
        });
        return;
      }

      tabInsertMutation.mutate(payload);
      return;
    }
    closeForm();
  };

  const workflowCards = [
    {
      key: "section",
      title: "Sections",
      description: "Top-level navigation areas",
      count: activeSections.length,
      buttonLabel: "Add section",
      onClick: () => openSection(),
      color: T.blue,
    },
    {
      key: "menu",
      title: "Menus",
      description: "Navigation groups within sections",
      count: activeMenus.length,
      buttonLabel: "Add menu",
      onClick: () => openMenu(),
      color: T.amber,
    },
    {
      key: "tab",
      title: "Tabs",
      description: "Screens users can open",
      count: screens.length,
      buttonLabel: "Add tab",
      onClick: () => openTab(),
      color: T.green,
    },
  ];

  return (
    <Card title="Screen Master">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              color: T.text,
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 5,
            }}
          >
            Navigation structure
          </div>
          <div style={{ color: T.textSoft, fontSize: 13 }}>
            Build the sidebar flow in order: section, menu, then tab.
          </div>
        </div>
        <div
          style={{
            color: T.textFaint,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            paddingTop: 5,
          }}
        >
          Live catalog
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        {workflowCards.map((card) => (
          <div
            key={card.key}
            style={{
              textAlign: "left",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "14px 15px",
              background: T.hover,
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  color: card.color,
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {card.count}
              </span>
            </div>
            <div
              style={{
                color: T.text,
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              {card.title}
            </div>
            <div style={{ color: T.textSoft, fontSize: 11, marginBottom: 12 }}>
              {card.description}
            </div>
            <button
              onClick={card.onClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                width: "100%",
                minHeight: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: `1px solid ${card.color}`,
                background: "transparent",
                color: card.color,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              {card.buttonLabel}
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px minmax(0, 1fr)",
          gap: 16,
          alignItems: "flex-start",
          marginTop: 8,
        }}
      >
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            overflow: "hidden",
            background: T.panel,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderBottom: `1px solid ${T.border}`,
              background: T.hover,
            }}
          >
            <strong style={{ color: T.text, fontSize: 13 }}>Navigation</strong>
            <span style={{ color: T.textFaint, fontSize: 11 }}>
              {activeSections.length + activeMenus.length} items
            </span>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Section</Th>
                <Th>Menu</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {activeSections.map((section) => {
                const isExpanded = expandedSections[section.sectionId] ?? true;
                const sectionMenus = activeMenus.filter(
                  (menu) => menu.sectionId === section.sectionId,
                );

                return (
                  <React.Fragment key={section.sectionId}>
                    <tr className="stc-row" style={{ background: T.hover }}>
                      <Td>
                        <button
                          onClick={() => toggleSection(section.sectionId)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: 0,
                            background: "transparent",
                            border: "none",
                            color: T.text,
                            textAlign: "left",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 16,
                              height: 16,
                              color: T.textSoft,
                              transform: isExpanded
                                ? "rotate(0deg)"
                                : "rotate(-90deg)",
                              transition: "transform 0.15s ease",
                            }}
                          >
                            ▾
                          </span>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: T.blue,
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span>{section.sectionName}</span>
                        </button>
                      </Td>
                      <Td>—</Td>
                      <Td align="right">
                        <button
                          onClick={() => openSection(section)}
                          title="Edit section"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 3,
                            color: T.textSoft,
                          }}
                        >
                          <Pencil size={14} color={T.textSoft} />
                        </button>
                        <button
                          onClick={() => {
                            const sectionId = Number(section.sectionId);
                            if (sectionId) {
                              sectionDeleteMutation.mutate({ sectionId });
                            }
                          }}
                          title="Delete section"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 3,
                            color: T.red,
                          }}
                        >
                          <Trash2 size={14} color={T.red} />
                        </button>
                      </Td>
                    </tr>
                    {isExpanded &&
                      sectionMenus.map((menu) => (
                        <tr className="stc-row" key={menu.menuId}>
                          <Td>
                            <div
                              style={{
                                paddingLeft: 22,
                                color: T.textSoft,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span>↳</span>
                              <span>{menu.menuName}</span>
                            </div>
                          </Td>
                          <Td>
                            <div style={{ color: T.textSoft }}>
                              {menu.sectionName}
                            </div>
                          </Td>
                          <Td align="right">
                            <button
                              onClick={() => openMenu(menu)}
                              title="Edit menu"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 3,
                                color: T.textSoft,
                              }}
                            >
                              <Pencil size={14} color={T.textSoft} />
                            </button>
                          </Td>
                        </tr>
                      ))}
                    {!isExpanded && sectionMenus.length > 0 && (
                      <tr className="stc-row">
                        <Td colSpan={3}>
                          <div
                            style={{
                              paddingLeft: 22,
                              color: T.textFaint,
                              fontSize: 11,
                            }}
                          >
                            {sectionMenus.length} menu
                            {sectionMenus.length > 1 ? "s" : ""} hidden
                          </div>
                        </Td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>
                Configured tabs
              </div>
              <div style={{ color: T.textSoft, fontSize: 12, marginTop: 3 }}>
                Every tab mapped to its parent menu and section.
              </div>
            </div>
          </div>
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search tabs, menus, or sections..."
          />
          <Table>
            <thead>
              <tr>
                <Th>Tab Name</Th>
                <Th>Menu</Th>
                <Th>Section</Th>
                <Th>Sort Order</Th>
                <Th>URL</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredScreens.map((screen) => (
                <tr className="stc-row" key={screen.screenId}>
                  <Td>
                    <strong style={{ fontWeight: 600 }}>
                      {screen.tabName}
                    </strong>
                  </Td>
                  <Td>{screen.menuLabel}</Td>
                  <Td>{screen.sectionName}</Td>
                  <Td>{screen.sortOrder}</Td>
                  <Td mono>{screen.frontendUrl}</Td>
                  <Td>
                    <StatusBadge status="Active" />
                  </Td>
                  <Td align="right">
                    <button
                      onClick={() => openTab(screen)}
                      title="Edit tab"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 3,
                      }}
                    >
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button
                      onClick={() => {
                        const tabId = Number(screen.screenId);
                        if (tabId) {
                          tabDeleteMutation.mutate({ tabId });
                        }
                      }}
                      title="Delete tab"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 3,
                      }}
                    >
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </Td>
                </tr>
              ))}
              {!filteredScreens.length && (
                <tr>
                  <Td colSpan={7}>No screens found.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {formType && (
        <Modal
          title={`${editingId ? "Edit" : "Add"} - ${formType === "tab" ? "Tab" : formType === "menu" ? "Menu" : "Section"}`}
          subtitle={
            formType === "section"
              ? "Create a navigation section"
              : formType === "menu"
                ? "Create a menu inside a section"
                : "Create a tab inside a menu"
          }
          onClose={closeForm}
          width={620}
          footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button className="stc-btn stc-btn-primary" onClick={saveForm}>
                Save changes
              </button>
            </>
          }
        >
          <div className="stc-form-grid">
            {formType === "section" && (
              <Field label="Section Name">
                <input
                  autoFocus
                  value={sectionName}
                  onChange={(event) => setSectionName(event.target.value)}
                  placeholder="e.g. Administration"
                />
              </Field>
            )}
            {formType === "menu" && (
              <>
                <Field label="Menu">
                  <input
                    autoFocus
                    value={menuForm.menuName}
                    onChange={(event) =>
                      setMenuForm((form) => ({
                        ...form,
                        menuName: event.target.value,
                      }))
                    }
                    placeholder="e.g. User Management"
                  />
                </Field>
                <Field label="Icon">
                  <input
                    value={menuForm.iconName}
                    onChange={(event) =>
                      setMenuForm((form) => ({
                        ...form,
                        iconName: event.target.value,
                      }))
                    }
                    placeholder="e.g. ShieldCheck"
                  />
                </Field>
                <Field label="Section">
                  <select
                    value={menuForm.sectionId}
                    onChange={(event) =>
                      setMenuForm((form) => ({
                        ...form,
                        sectionId: event.target.value,
                      }))
                    }
                  >
                    {activeSections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.sectionName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sort Order">
                  <input
                    type="number"
                    min="1"
                    value={menuForm.sortOrder}
                    onChange={(event) =>
                      setMenuForm((form) => ({
                        ...form,
                        sortOrder: Number(event.target.value),
                      }))
                    }
                  />
                </Field>
              </>
            )}
            {formType === "tab" && (
              <>
                <Field label="Section">
                  <select
                    value={tabForm.sectionId}
                    onChange={(event) => {
                      const sectionId = event.target.value;
                      const firstMenu = activeMenus.find(
                        (menu) => menu.sectionId === sectionId,
                      );
                      setTabForm((form) => ({
                        ...form,
                        sectionId,
                        menuId: firstMenu?.menuId || "",
                      }));
                    }}
                  >
                    {activeSections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.sectionName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Menu">
                  <select
                    value={tabForm.menuId}
                    onChange={(event) =>
                      setTabForm((form) => ({
                        ...form,
                        menuId: event.target.value,
                      }))
                    }
                  >
                    {tabFormOptions.map((menu) => (
                      <option key={menu.menuId} value={menu.menuId}>
                        {menu.menuName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tab Name">
                  <input
                    autoFocus
                    value={tabForm.tabName}
                    onChange={(event) =>
                      setTabForm((form) => ({
                        ...form,
                        tabName: event.target.value,
                      }))
                    }
                    placeholder="e.g. Role Master"
                  />
                </Field>
                <Field label="Sort Order">
                  <input
                    type="number"
                    min="1"
                    value={tabForm.sortOrder}
                    onChange={(event) =>
                      setTabForm((form) => ({
                        ...form,
                        sortOrder: Number(event.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="URL">
                  <input
                    value={tabForm.frontendUrl}
                    onChange={(event) =>
                      setTabForm((form) => ({
                        ...form,
                        frontendUrl: event.target.value,
                      }))
                    }
                    placeholder="/Organization/userManagement/RoleMaster"
                  />
                </Field>
              </>
            )}
          </div>
        </Modal>
      )}
    </Card>
  );
}
