import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import {
  Card,
  Modal,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../../../components/common";

export interface ScreenRecord {
  screenId: string;
  pageKey: string;
  tabName: string;
  menuLabel: string;
  sectionId: string;
  sectionName: string;
  iconName: string;
  sortOrder: number;
  frontendUrl: string;
  isActive: boolean;
}

export interface ScreenPayload {
  tabName: string;
  menuLabel: string;
  sectionId: string;
  iconName: string;
  sortOrder: number;
  frontendUrl: string;
}

export interface ScreenEditPayload extends ScreenPayload {
  pageKey: string;
  screenId: string;
  isActive: boolean;
}

const sectionOptions = [
  { sectionId: "ORG", sectionName: "Organization" },
  { sectionId: "OPS", sectionName: "Operations" },
  { sectionId: "COM", sectionName: "Commercial" },
  { sectionId: "SYS", sectionName: "Systems" },
  { sectionId: "SUP", sectionName: "Support" },
];

const initialScreens: ScreenRecord[] = [
  {
    screenId: "SCR-ID-001",
    pageKey: "organization-management",
    tabName: "Organization",
    menuLabel: "Organization Management",
    sectionId: "ORG",
    sectionName: "Organization",
    iconName: "Building2",
    sortOrder: 1,
    frontendUrl: "/Organization/organizationManagement",
    isActive: true,
  },
  {
    screenId: "SCR-ID-002",
    pageKey: "master-data",
    tabName: "Master Data",
    menuLabel: "Master Data",
    sectionId: "ORG",
    sectionName: "Organization",
    iconName: "Database",
    sortOrder: 2,
    frontendUrl: "/Organization/masters",
    isActive: true,
  },
  {
    screenId: "SCR-ID-003",
    pageKey: "fleet-register",
    tabName: "Fleet",
    menuLabel: "Fleet Register",
    sectionId: "OPS",
    sectionName: "Operations",
    iconName: "Bus",
    sortOrder: 3,
    frontendUrl: "/Operations/fleet/VehicleRegister",
    isActive: true,
  },
  {
    screenId: "SCR-ID-004",
    pageKey: "finance-wallet",
    tabName: "Finance",
    menuLabel: "Finance & Wallet",
    sectionId: "SYS",
    sectionName: "Systems",
    iconName: "Wallet",
    sortOrder: 4,
    frontendUrl: "/Systems/financeWallet/FinanceWallet",
    isActive: true,
  },
];

export default function ScreenMaster() {
  const [data, setData] = useState<ScreenRecord[]>(initialScreens);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: ScreenRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<ScreenRecord | null>(null);
  const [formData, setFormData] = useState<Partial<ScreenEditPayload>>({});

  const filteredData = data.filter((screen) =>
    `${screen.pageKey} ${screen.menuLabel} ${screen.sectionName} ${screen.frontendUrl}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setFormData({
      tabName: "",
      menuLabel: "",
      sectionId: sectionOptions[0].sectionId,
      iconName: "",
      sortOrder: data.length + 1,
      frontendUrl: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ScreenRecord) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (
      !formData.tabName?.trim() ||
      !formData.menuLabel?.trim() ||
      !formData.sectionId ||
      !formData.frontendUrl?.trim()
    )
      return;
    const section = sectionOptions.find(
      (item) => item.sectionId === formData.sectionId,
    );
    const screen: ScreenRecord = {
      screenId:
        formData.screenId ||
        `SCR-ID-${String(data.length + 1).padStart(3, "0")}`,
      pageKey:
        formData.pageKey?.trim() ||
        formData.tabName.trim().toLowerCase().replace(/\s+/g, "-"),
      tabName: formData.tabName.trim(),
      menuLabel: formData.menuLabel.trim(),
      sectionId: formData.sectionId,
      sectionName: section?.sectionName || "",
      iconName: formData.iconName?.trim() || "",
      sortOrder: Number(formData.sortOrder) || data.length + 1,
      frontendUrl: formData.frontendUrl.trim(),
      isActive: formData.isActive ?? true,
    };

    if (modal?.mode === "edit")
      setData((previous) =>
        previous.map((item) =>
          item.screenId === screen.screenId ? screen : item,
        ),
      );
    else setData((previous) => [...previous, screen]);
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    setData((previous) =>
      previous.filter((item) => item.screenId !== toDelete.screenId),
    );
    setToDelete(null);
  };

  const updateField = (
    field: keyof ScreenEditPayload,
    value: string | number | boolean,
  ) => setFormData((state) => ({ ...state, [field]: value }));

  return (
    <Card
      title="Screens"
      action={
        <button
          onClick={handleOpenAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            color: T.amberDeep,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={13} /> Add screen
        </button>
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Page Key</Th>
            <Th>Menu Label</Th>
            <Th>Section</Th>
            <Th>Sorting Order</Th>
            <Th>URL</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((screen) => (
            <tr className="stc-row" key={screen.screenId}>
              <Td mono>{screen.pageKey}</Td>
              <Td>{screen.menuLabel}</Td>
              <Td>{screen.sectionName}</Td>
              <Td>{screen.sortOrder}</Td>
              <Td mono>{screen.frontendUrl}</Td>
              <Td>
                <StatusBadge status={screen.isActive ? "Active" : "Inactive"} />
              </Td>
              <Td align="right">
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleOpenEdit(screen)}
                    title="Edit"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                    }}
                  >
                    <Pencil size={14} color={T.textSoft} />
                  </button>
                  <button
                    onClick={() => setToDelete(screen)}
                    title="Delete"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                    }}
                  >
                    <Trash2 size={14} color={T.red} />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <Td colSpan={7}>No screens found.</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} - Screen`}
          subtitle={
            modal.mode === "add" ? "Add a new screen" : "Update screen details"
          }
          onClose={() => setModal(null)}
          width={620}
          footer={
            <>
              <button
                className="stc-btn stc-btn-ghost"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button className="stc-btn stc-btn-primary" onClick={handleSave}>
                Save changes
              </button>
            </>
          }
        >
          <div className="stc-form-grid">
            <div className="stc-field">
              <label className="stc-field-label">Tab Name</label>
              <input
                value={formData.tabName || ""}
                onChange={(event) => updateField("tabName", event.target.value)}
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Menu Label</label>
              <input
                value={formData.menuLabel || ""}
                onChange={(event) =>
                  updateField("menuLabel", event.target.value)
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Section</label>
              <select
                value={formData.sectionId || ""}
                onChange={(event) =>
                  updateField("sectionId", event.target.value)
                }
              >
                {sectionOptions.map((section) => (
                  <option key={section.sectionId} value={section.sectionId}>
                    {section.sectionName} ({section.sectionId})
                  </option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Icon Name</label>
              <input
                value={formData.iconName || ""}
                onChange={(event) =>
                  updateField("iconName", event.target.value)
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Sort Order</label>
              <input
                type="number"
                min="0"
                value={formData.sortOrder ?? ""}
                onChange={(event) =>
                  updateField("sortOrder", Number(event.target.value))
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Frontend URL</label>
              <input
                value={formData.frontendUrl || ""}
                onChange={(event) =>
                  updateField("frontendUrl", event.target.value)
                }
              />
            </div>
            {modal.mode === "edit" && (
              <>
                <div className="stc-field">
                  <label className="stc-field-label">Page Key</label>
                  <input disabled value={formData.pageKey || ""} />
                </div>
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.isActive ? "Active" : "Inactive"}
                    onChange={(event) =>
                      updateField("isActive", event.target.value === "Active")
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Delete - Screen"
          subtitle="This action cannot be undone"
          icon={<Trash2 size={20} color={T.red} />}
          iconVariant="danger"
          onClose={() => setToDelete(null)}
          width={420}
          footer={
            <>
              <button
                className="stc-btn stc-btn-ghost"
                onClick={() => setToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="stc-btn stc-btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <p
            style={{
              fontSize: 14,
              color: T.textSoft,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            This will permanently remove {toDelete.menuLabel} from the list.
            This cannot be undone.
          </p>
        </Modal>
      )}
    </Card>
  );
}
