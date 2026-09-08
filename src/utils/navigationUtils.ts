import {
  LayoutDashboard,
  Building2,
  Database,
  ShieldCheck,
  Bus,
  Milestone,
  Radar,
  IndianRupee,
  Ticket,
  CalendarCheck,
  Armchair,
  Smartphone,
  Wallet,
  MessageSquareWarning,
  BarChart3,
  LineChart as LineChartIcon,
  HelpCircle,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface NavGroup {
  group: string | null;
  items: NavItem[];
}

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Database,
  ShieldCheck,
  Bus,
  Milestone,
  Radar,
  IndianRupee,
  Ticket,
  CalendarCheck,
  Armchair,
  Smartphone,
  Wallet,
  MessageSquareWarning,
  BarChart3,
  LineChart: LineChartIcon,
  LineChartIcon,
  HelpCircle,
  UserCog,
};


export function buildNavFromPermissions(permissions: any[]): NavGroup[] {

  const navGroups: NavGroup[] = [];

  const sortedSections = [...permissions].sort(
    (a, b) => (a.sectionId || 0) - (b.sectionId || 0)
  );

  sortedSections.forEach((section) => {
    const groupName = section.sectionName;

    const items: NavItem[] = [];

    const sortedMenus = Array.isArray(section.menuList)
      ? [...section.menuList].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        )
      : [];

    sortedMenus.forEach((menu) => {
      const sortedTabs = Array.isArray(menu.tabList)
        ? [...menu.tabList].sort(
            (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
          )
        : [];

      const visibleTabs = sortedTabs.filter((t) => Boolean(t.canView));

      if (visibleTabs.length > 0) {
        const iconComponent = ICON_MAP[menu.iconName] || Building2;
        const targetUrl = visibleTabs[0].url || "/";

        items.push({
          id: String(menu.menuId || menu.menuName),
          label: menu.menuName,
          icon: iconComponent,
          path: targetUrl,
        });
      }
    });

    if (items.length > 0) {
      navGroups.push({
        group: groupName,
        items,
      });
    }
  });

  // return navGroups.length > 0 ? navGroups : DEFAULT_NAV;
  return navGroups;

}
