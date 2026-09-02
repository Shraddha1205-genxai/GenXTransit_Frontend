import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderSearch, Pencil, Plus, Trash2 } from "lucide-react";
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
} from "../../../api/organization/userManagement/screenMaster/menuService";
import {
  sectionService,
  type SectionInsertPayload,
  type SectionRecordApi,
  type SectionUpdatePayload,
} from "../../../api/organization/userManagement/screenMaster/sectionService";
import {
  tabService,
  type TabInsertPayload,
  type TabRecordApi,
  type TabUpdatePayload,
} from "../../../api/organization/userManagement/screenMaster/tabService";

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

export const initialScreens: ScreenRecord[] = [];

type FormType = "section" | "menu" | "tab";

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

function SectionTreeRow({
  section,
  isExpanded,
  selectedMenuId,
  onToggle,
  onSelectMenu,
  onEditSection,
  onDeleteSection,
  onEditMenu,
  onDeleteMenu,
}: {
  section: SectionRecord;
  isExpanded: boolean;
  selectedMenuId: string | null;
  onToggle: () => void;
  onSelectMenu: (menu: MenuRecord, section: SectionRecord) => void;
  onEditSection: (s: SectionRecord) => void;
  onDeleteSection: (id: number) => void;
  onEditMenu: (m: MenuRecord) => void;
  onDeleteMenu: (id: number) => void;
}) {
  const { data: apiSectionMenus = [], isLoading: isLoadingMenus } = useQuery({
    queryKey: ["menu", section.sectionId, true],
    queryFn: () => menuService.getAll(Number(section.sectionId), true),
    enabled: isExpanded && !isNaN(Number(section.sectionId)),
    staleTime: 0,
  });

  const sectionMenus: MenuRecord[] = useMemo(() => {
    return apiSectionMenus.map((m: MenuRecordApi) => ({
      menuId: String(m.menuId ?? m.id ?? ""),
      menuName: m.menuName,
      iconName: m.iconName,
      sectionId: String(m.sectionId),
      sectionName: section.sectionName,
      sortOrder: m.sortOrder,
      isActive: m.isActive,
    }));
  }, [apiSectionMenus, section.sectionName]);

  return (
    <>
      <tr className="stc-row" style={{ background: T.hover }}>
        <Td>
          <button
            onClick={onToggle}
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
              fontSize: 13,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                color: T.blue,
                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.15s ease",
                fontSize: 11,
              }}
            >
              ▾
            </span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: T.blue,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span>{section.sectionName}</span>
          </button>
        </Td>
        <Td align="right">
          <button
            onClick={() => onEditSection(section)}
            title="Edit section"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 3,
              color: T.textSoft,
            }}
          >
            <Pencil size={13} color={T.textSoft} />
          </button>
          <button
            onClick={() => {
              const sId = Number(section.sectionId);
              if (sId) onDeleteSection(sId);
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
            <Trash2 size={13} color={T.red} />
          </button>
        </Td>
      </tr>

      {isExpanded && (
        <>
          {isLoadingMenus && (
            <tr className="stc-row">
              <Td colSpan={2}>
                <div style={{ paddingLeft: 22, color: T.textFaint, fontSize: 11 }}>
                  Loading menus...
                </div>
              </Td>
            </tr>
          )}

          {!isLoadingMenus && sectionMenus.length === 0 && (
            <tr className="stc-row">
              <Td colSpan={2}>
                <div style={{ paddingLeft: 22, color: T.textFaint, fontSize: 11 }}>
                  No menus found in this section
                </div>
              </Td>
            </tr>
          )}

          {!isLoadingMenus &&
            sectionMenus.map((menu) => {
              const isSelected = selectedMenuId === menu.menuId;
              return (
                <MenuTreeRow
                  key={menu.menuId}
                  section={section}
                  menu={menu}
                  isSelected={isSelected}
                  onSelectMenu={() => onSelectMenu(menu, section)}
                  onEditMenu={onEditMenu}
                  onDeleteMenu={onDeleteMenu}
                />
              );
            })}
        </>
      )}
    </>
  );
}

function MenuTreeRow({
  section,
  menu,
  isSelected,
  onSelectMenu,
  onEditMenu,
  onDeleteMenu,
}: {
  section: SectionRecord;
  menu: MenuRecord;
  isSelected: boolean;
  onSelectMenu: () => void;
  onEditMenu: (m: MenuRecord) => void;
  onDeleteMenu: (id: number) => void;
}) {
  return (
    <tr
      className="stc-row"
      onClick={onSelectMenu}
      style={{
        background: isSelected ? T.amberFill : "transparent",
        borderLeft: isSelected ? `3px solid ${T.amber}` : "3px solid transparent",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <Td>
        <div
          style={{
            paddingLeft: 18,
            color: isSelected ? T.amber : T.text,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: isSelected ? T.amber : T.textSoft, fontSize: 11 }}>↳</span>
          <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: 12 }}>
            {menu.menuName}
          </span>
          {isSelected && (
            <span
              style={{
                fontSize: 9,
                background: T.amber,
                color: "#101B26",
                padding: "1px 5px",
                borderRadius: 8,
                fontWeight: 700,
                marginLeft: 4,
              }}
            >
              Selected
            </span>
          )}
        </div>
      </Td>
      <Td align="right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditMenu(menu);
          }}
          title="Edit menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 3,
            color: T.textSoft,
          }}
        >
          <Pencil size={13} color={T.textSoft} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const mId = Number(menu.menuId);
            if (mId) onDeleteMenu(mId);
          }}
          title="Delete menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 3,
            color: T.red,
          }}
        >
          <Trash2 size={13} color={T.red} />
        </button>
      </Td>
    </tr>
  );
}

export default function ScreenMaster() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState<FormType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [sectionName, setSectionName] = useState("");

  const [selectedMenu, setSelectedMenu] = useState<{
    menuId: string;
    sectionId: string;
    menuName: string;
    sectionName: string;
  } | null>(null);

  // Global Sections query with isActive=true
  const { data: apiSections = [] } = useQuery({
    queryKey: ["section", true],
    queryFn: () => sectionService.getAll(true),
    staleTime: 0,
  });

  const sections = useMemo<SectionRecord[]>(() => {
    if (!apiSections.length) return [];
    return apiSections.map((section: SectionRecordApi) => ({
      sectionId: String(section.sectionId),
      sectionName: section.sectionName,
      isActive: section.isActive,
    }));
  }, [apiSections]);

  // Global Menus query with isActive=true for forms
  const { data: apiMenus = [] } = useQuery({
    queryKey: ["menu", true],
    queryFn: () => menuService.getAll(undefined, true),
    staleTime: 0,
  });

  const menus = useMemo<MenuRecord[]>(() => {
    if (!apiMenus.length) return [];
    return apiMenus.map((menu: MenuRecordApi) => {
      const backendSectionId = String(menu.sectionId);
      const sectionFromApi = sections.find(
        (item) => String(item.sectionId) === backendSectionId,
      );

      return {
        menuId: String(menu.menuId ?? menu.id ?? ""),
        menuName: menu.menuName,
        iconName: menu.iconName,
        sectionId: String(sectionFromApi?.sectionId ?? backendSectionId),
        sectionName: sectionFromApi?.sectionName ?? "",
        sortOrder: menu.sortOrder,
        isActive: menu.isActive,
      };
    });
  }, [apiMenus, sections]);

  // Fetch tabs ONLY for selected menu
  const { data: apiConfiguredTabs = [], isLoading: isLoadingTabs } = useQuery({
    queryKey: ["configuredTabs", selectedMenu?.menuId, selectedMenu?.sectionId, true],
    queryFn: () =>
      selectedMenu
        ? tabService.getAll(Number(selectedMenu.menuId), Number(selectedMenu.sectionId), true)
        : Promise.resolve([]),
    enabled: !!selectedMenu,
    staleTime: 0,
  });

  const screens = useMemo<ScreenRecord[]>(() => {
    if (!selectedMenu || !apiConfiguredTabs.length) return [];
    return apiConfiguredTabs.map((tab: TabRecordApi) => {
      const safeTabName = tab.tabName || "";
      const safeUrl = tab.url || "";
      return {
        screenId: String(tab.tabId),
        pageKey: safeTabName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tabName: safeTabName,
        menuLabel: selectedMenu.menuName,
        menuId: String(tab.menuId),
        sectionId: String(tab.sectionId),
        sectionName: selectedMenu.sectionName,
        iconName: menus.find((m) => m.menuId === selectedMenu.menuId)?.iconName || "",
        sortOrder: tab.sortOrder ?? 1,
        frontendUrl: safeUrl,
        isActive: tab.isActive ?? true,
      };
    });
  }, [apiConfiguredTabs, selectedMenu]);

  const filteredScreens = useMemo(() => {
    if (!search.trim()) return screens;
    const q = search.toLowerCase();
    return screens.filter((screen) =>
      `${screen.tabName || ""} ${screen.frontendUrl || ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [screens, search]);

  const sectionInsertMutation = useMutation({
    mutationFn: (payload: SectionInsertPayload) => sectionService.insert(payload),
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
    mutationFn: (payload: SectionUpdatePayload) => sectionService.update(payload),
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
    mutationFn: (payload: { sectionId: number }) => sectionService.delete(payload),
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

  const menuDeleteMutation = useMutation({
    mutationFn: (payload: { id: number }) => menuService.delete(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete menu");
    },
  });

  const tabInsertMutation = useMutation({
    mutationFn: (payload: TabInsertPayload) => tabService.insert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tab"] });
      queryClient.invalidateQueries({ queryKey: ["configuredTabs"] });
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
      queryClient.invalidateQueries({ queryKey: ["configuredTabs"] });
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
      queryClient.invalidateQueries({ queryKey: ["configuredTabs"] });
      toast.success("Tab deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete tab");
    },
  });

  const [menuForm, setMenuForm] = useState({
    menuName: "",
    iconName: "",
    sectionId: "",
    sortOrder: 1,
  });

  const [tabForm, setTabForm] = useState({
    sectionId: "",
    menuId: "",
    tabName: "",
    sortOrder: 1,
    frontendUrl: "",
  });

  const activeSections = sections.filter((item) => item.isActive);
  const activeMenus = menus.filter((item) => item.isActive);

  const tabFormOptions = useMemo(() => {
    if (!tabForm.sectionId) return activeMenus;
    return activeMenus.filter((item) => item.sectionId === tabForm.sectionId);
  }, [activeMenus, tabForm.sectionId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const handleSelectMenu = (menu: MenuRecord, section: SectionRecord) => {
    setSelectedMenu({
      menuId: menu.menuId,
      sectionId: menu.sectionId || section.sectionId,
      menuName: menu.menuName,
      sectionName: section.sectionName,
    });
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
            sectionId: selectedMenu?.sectionId || "",
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
            sectionId: selectedMenu?.sectionId || "",
            menuId: selectedMenu?.menuId || "",
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
      if (!name) {
        toast.error("Section name is required");
        return;
      }

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
      if (!menuForm.menuName.trim() || !menuForm.sectionId) {
        toast.error("Please select a section and enter a menu name");
        return;
      }

      const payload = {
        iconName: menuForm.iconName.trim(),
        sectionId: Number(menuForm.sectionId),
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
      if (!tabForm.tabName.trim() || !tabForm.sectionId || !tabForm.menuId || !tabForm.frontendUrl.trim()) {
        toast.error("Please fill in all required tab fields");
        return;
      }

      const payload = {
        sectionId: Number(tabForm.sectionId),
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

  return (
    <Card title="Screen Master">
      {/* Visual Hierarchy Flow Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: T.hover,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "8px 14px",
          marginBottom: 14,
        }}
      >
        <strong style={{ color: T.text, fontSize: 12 }}>Hierarchy Flow:</strong>
        <span
          style={{
            background: T.blueFill,
            color: T.blue,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 9px",
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 800 }}>1.</span> Expand Section
        </span>
        <span style={{ color: T.textFaint, fontWeight: 700 }}>➔</span>
        <span
          style={{
            background: T.amberFill,
            color: T.amberDeep,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 9px",
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 800 }}>2.</span> Select Menu
        </span>
        <span style={{ color: T.textFaint, fontWeight: 700 }}>➔</span>
        <span
          style={{
            background: T.greenFill,
            color: T.green,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 9px",
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 800 }}>3.</span> View & Manage Tabs
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px minmax(0, 1fr)",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* Left Panel: Navigation Tree */}
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            overflow: "hidden",
            background: T.panel,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              borderBottom: `1px solid ${T.border}`,
              background: T.hover,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <strong style={{ color: T.text, fontSize: 13 }}>Navigation</strong>
              <span
                style={{
                  background: T.panel,
                  color: T.textSoft,
                  border: `1px solid ${T.border}`,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 10,
                }}
              >
                {activeSections.length}S • {activeMenus.length}M
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => openSection()}
                title="Add Section"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  height: 24,
                  padding: "0 7px",
                  borderRadius: 5,
                  border: `1px solid ${T.blue}`,
                  background: T.blueFill,
                  color: T.blue,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={12} /> Section
              </button>
              <button
                onClick={() => openMenu()}
                title="Add Menu"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  height: 24,
                  padding: "0 7px",
                  borderRadius: 5,
                  border: `1px solid ${T.amber}`,
                  background: T.amberFill,
                  color: T.amberDeep,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={12} /> Menu
              </button>
            </div>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>STRUCTURE</Th>
                <Th align="right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {activeSections.map((section) => (
                <SectionTreeRow
                  key={section.sectionId}
                  section={section}
                  isExpanded={!!expandedSections[section.sectionId]}
                  selectedMenuId={selectedMenu?.menuId || null}
                  onToggle={() => toggleSection(section.sectionId)}
                  onSelectMenu={handleSelectMenu}
                  onEditSection={openSection}
                  onDeleteSection={(id) => sectionDeleteMutation.mutate({ sectionId: id })}
                  onEditMenu={openMenu}
                  onDeleteMenu={(id) => menuDeleteMutation.mutate({ id })}
                />
              ))}
              {activeSections.length === 0 && (
                <tr>
                  <Td colSpan={3}>No sections available.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Right Panel: Configured Tabs Table */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Configured tabs</span>
                {selectedMenu && (
                  <span
                    style={{
                      background: T.amberFill,
                      color: T.amberDeep,
                      border: `1px solid ${T.amber}`,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    {selectedMenu.menuName} ({selectedMenu.sectionName})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => openTab()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                height: 28,
                padding: "0 12px",
                borderRadius: 6,
                border: `1px solid ${T.green}`,
                background: T.greenFill,
                color: T.green,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Plus size={13} /> Add tab
            </button>
          </div>
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search tabs..."
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
              {!selectedMenu ? (
                <tr>
                  <Td colSpan={7}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 16px",
                        color: T.textSoft,
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: T.hover,
                          border: `1px solid ${T.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: T.textFaint,
                        }}
                      >
                        <FolderSearch size={22} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                        Please select a menu from Navigation to view its tab records.
                      </div>
                    </div>
                  </Td>
                </tr>
              ) : isLoadingTabs ? (
                <tr>
                  <Td colSpan={7}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px 16px",
                        color: T.textFaint,
                        fontSize: 13,
                      }}
                    >
                      Loading tabs...
                    </div>
                  </Td>
                </tr>
              ) : filteredScreens.length > 0 ? (
                filteredScreens.map((screen) => (
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
                ))
              ) : (
                <tr>
                  <Td colSpan={7}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px 16px",
                        color: T.textSoft,
                        fontSize: 13,
                      }}
                    >
                      No tabs found for this menu.
                    </div>
                  </Td>
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
                <Field label="Menu Name">
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
                    <option value="">Select Section</option>
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
                      setTabForm((form) => ({
                        ...form,
                        sectionId,
                        menuId: "",
                      }));
                    }}
                  >
                    <option value="">Select Section</option>
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
                    <option value="">Select Menu</option>
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
