import { useMemo } from "react";

export interface PagePermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PermissionTab {
  tabId: number;
  tabName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  url: string;
  sectionName?: string;
  menuName?: string;
}

export function flattenPermissions(rawList: any[]): PermissionTab[] {
  if (!Array.isArray(rawList)) return [];
  const result: PermissionTab[] = [];

  rawList.forEach((item) => {
    if (item && Array.isArray(item.menuList)) {
      item.menuList.forEach((menu: any) => {
        if (menu && Array.isArray(menu.tabList)) {
          menu.tabList.forEach((tab: any) => {
            result.push({
              tabId: tab.tabId,
              tabName: tab.tabName || "",
              canView: Boolean(tab.canView),
              canAdd: Boolean(tab.canAdd),
              canEdit: Boolean(tab.canEdit),
              canDelete: Boolean(tab.canDelete),
              url: tab.url || "",
              sectionName: item.sectionName,
              menuName: menu.menuName,
            });
          });
        }
      });
    } else if (item && (item.tabName || item.menuName || item.canView !== undefined)) {
      result.push({
        tabId: item.tabId || 0,
        tabName: item.tabName || "",
        canView: Boolean(item.canView),
        canAdd: Boolean(item.canAdd),
        canEdit: Boolean(item.canEdit),
        canDelete: Boolean(item.canDelete),
        url: item.url || "",
        sectionName: item.sectionName,
        menuName: item.menuName,
      });
    }
  });

  return result;
}

const ALIAS_MAP: Record<string, string[]> = {
  corporation: ["corporations", "corporation"],
  regions: ["regions", "region"],
  divisions: ["divisions", "division"],
  zone: ["zones", "zone"],
  depots: ["depots", "depot"],
  stations: ["stations", "busstation", "busstations", "station"],
  workshop: ["workshop", "workshops"],
  parkingyards: ["parkingyards", "parkingyard", "parking yards"],
  routes: ["routes", "route"],
  stops: ["stops", "stop"],
  stages: ["stages", "stage"],
  farepolicies: ["farepolicies", "fare policy", "fare policies"],
  tickettypes: ["tickettypes", "ticket types", "ticket type"],
  paymentmodes: ["paymentmodes", "payment modes", "payment mode"],
  vehiclecategories: ["vehiclecategories", "vehicle categories", "vehicle category"],
  seatlayouts: ["seatlayouts", "seat layouts", "seat layout"],
  holidaycalendar: ["holidaycalendar", "holiday calendar"],
  notificationtemplates: ["notificationtemplates", "notification templates", "notification template"],
  complaintcategories: ["complaintcategories", "complaint categories", "complaint category"],
  taxconfiguration: ["taxconfiguration", "tax configuration"],
  rolemaster: ["rolemaster", "role master", "roles"],
  usermaster: ["usermaster", "user master", "users"],
  screenmaster: ["screenmaster", "screen master", "screens"],
  authorization: ["authorization", "auth"],
  vehicleregister: ["vehicleregister", "vehicle register", "fleet"],
  vehicleservice: ["vehicleservice", "vehicle service"],
  tripschedule: ["tripschedule", "trip schedule", "trips"],
  livetracking: ["livetracking", "live tracking", "tracking"],
  dashboard: ["dashboard", "dasboard", "overview"],
};

export function usePermissions(screenName?: string): PagePermissions & {
  permissions: PermissionTab[];
  getPermissionsForScreen: (name: string) => PagePermissions;
} {
  const rawPermissions = localStorage.getItem("permissions");
  const permissions: PermissionTab[] = useMemo(() => {
    try {
      if (!rawPermissions) return [];
      const parsed = JSON.parse(rawPermissions);
      return flattenPermissions(parsed);
    } catch {
      return [];
    }
  }, [rawPermissions]);

  const getPermissionsForScreen = (name: string): PagePermissions => {
    if (!permissions || permissions.length === 0) {
      // Default: Full access if no permissions array is stored
      return { canView: true, canAdd: true, canEdit: true, canDelete: true };
    }

    const clean = (str?: string | null) =>
      (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const targetKey = clean(name);
    const aliases = ALIAS_MAP[targetKey] || [targetKey];

    const found = permissions.find((p) => {
      const tName = clean(p.tabName);
      const mName = clean(p.menuName);
      const pUrl = clean(p.url);

      return (
        pUrl === targetKey ||
        aliases.includes(tName) ||
        aliases.includes(mName) ||
        tName === targetKey ||
        mName === targetKey
      );
    });

    if (found) {
      return {
        canView: Boolean(found.canView),
        canAdd: Boolean(found.canAdd),
        canEdit: Boolean(found.canEdit),
        canDelete: Boolean(found.canDelete),
      };
    }

    return { canView: true, canAdd: true, canEdit: true, canDelete: true };
  };

  const currentPermissions = screenName
    ? getPermissionsForScreen(screenName)
    : { canView: true, canAdd: true, canEdit: true, canDelete: true };

  return {
    permissions,
    getPermissionsForScreen,
    canView: currentPermissions.canView,
    canAdd: currentPermissions.canAdd,
    canEdit: currentPermissions.canEdit,
    canDelete: currentPermissions.canDelete,
  };
}
