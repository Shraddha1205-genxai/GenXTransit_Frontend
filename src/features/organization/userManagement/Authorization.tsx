import React, { useMemo, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
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
import { initialRoles } from "./RoleMaster";
import {
  initialScreens,
  sectionOptions as screenSectionOptions,
} from "./ScreenMaster";

const roleOptions = initialRoles.map((role) => ({
  roleId: role.roleId,
  roleName: role.roleName,
}));

const sectionOptions = screenSectionOptions;

const menuOptions = Array.from(
  new Map(
    initialScreens.map((screen) => {
      const menuKey = `${screen.sectionId}:${screen.menuLabel}`;
      return [
        menuKey,
        {
          menuId: menuKey
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          sectionId: screen.sectionId,
          menuName: screen.menuLabel,
        },
      ];
    }),
  ).values(),
);

const tabOptions = initialScreens.map((screen) => ({
  tabId: screen.pageKey,
  menuId: `${screen.sectionId}:${screen.menuLabel}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  tabName: screen.tabName,
}));

export interface AuthorizationRecord {
  id: string;
  roleId: string;
  roleName: string;
  sectionId: string;
  sectionName: string;
  menuId: string;
  menuName: string;
  tabId: string;
  tabName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isDefault: boolean;
  disableView: boolean;
  disableAdd: boolean;
  disableEdit: boolean;
  disableDelete: boolean;
}

interface AuthorizationFormState {
  roleId: string;
  sectionId: string;
  menuId: string;
  tabId: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isDefault: boolean;
  disableView: boolean;
  disableAdd: boolean;
  disableEdit: boolean;
  disableDelete: boolean;
}

const initialAuthorizations: AuthorizationRecord[] = [
  {
    id: "AUT-001",
    roleId: "ROL-001",
    roleName: "Super Admin",
    sectionId: "ORG",
    sectionName: "Organization",
    menuId: "user-management",
    menuName: "User Management",
    tabId: "role-master",
    tabName: "Role Master",
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: true,
    isDefault: true,
    disableView: false,
    disableAdd: false,
    disableEdit: false,
    disableDelete: false,
  },
  {
    id: "AUT-002",
    roleId: "ROL-002",
    roleName: "Depot Manager",
    sectionId: "OPS",
    sectionName: "Operations",
    menuId: "fleet",
    menuName: "Fleet",
    tabId: "vehicle-register",
    tabName: "Vehicle Register",
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
    isDefault: false,
    disableView: false,
    disableAdd: false,
    disableEdit: false,
    disableDelete: true,
  },
  {
    id: "AUT-003",
    roleId: "ROL-003",
    roleName: "Finance Officer",
    sectionId: "SYS",
    sectionName: "Systems",
    menuId: "finance-wallet",
    menuName: "Finance & Wallet",
    tabId: "wallet",
    tabName: "Finance & Wallet",
    canView: true,
    canAdd: false,
    canEdit: true,
    canDelete: false,
    isDefault: false,
    disableView: false,
    disableAdd: true,
    disableEdit: false,
    disableDelete: true,
  },
  {
    id: "AUT-004",
    roleId: "ROL-004",
    roleName: "Route Planner",
    sectionId: "COM",
    sectionName: "Commercial",
    menuId: "routes-schedule",
    menuName: "Routes & Schedule",
    tabId: "routes-and-schedule",
    tabName: "Routes & Schedule",
    canView: true,
    canAdd: true,
    canEdit: false,
    canDelete: false,
    isDefault: false,
    disableView: false,
    disableAdd: false,
    disableEdit: true,
    disableDelete: true,
  },
];

const getSectionName = (sectionId: string) =>
  sectionOptions.find((section) => section.sectionId === sectionId)
    ?.sectionName || "";

const getMenuName = (menuId: string) =>
  menuOptions.find((menu) => menu.menuId === menuId)?.menuName || "";

const getTabName = (tabId: string) =>
  tabOptions.find((tab) => tab.tabId === tabId)?.tabName || "";

const getDefaultFormState = (
  record?: AuthorizationRecord,
): AuthorizationFormState => {
  const initialSectionId = record?.sectionId || sectionOptions[0].sectionId;
  const initialMenuId =
    record?.menuId ||
    menuOptions.find((menu) => menu.sectionId === initialSectionId)?.menuId ||
    menuOptions[0].menuId;
  const initialTabId =
    record?.tabId ||
    tabOptions.find((tab) => tab.menuId === initialMenuId)?.tabId ||
    tabOptions[0].tabId;

  return {
    roleId: record?.roleId || roleOptions[0].roleId,
    sectionId: initialSectionId,
    menuId: initialMenuId,
    tabId: initialTabId,
    canView: record?.canView ?? true,
    canAdd: record?.canAdd ?? true,
    canEdit: record?.canEdit ?? true,
    canDelete: record?.canDelete ?? true,
    isDefault: record?.isDefault ?? false,
    disableView: record?.disableView ?? false,
    disableAdd: record?.disableAdd ?? false,
    disableEdit: record?.disableEdit ?? false,
    disableDelete: record?.disableDelete ?? false,
  };
};

function PermissionCell({ value }: { value: boolean }) {
  return (
    <span
      style={{
        color: value ? T.green : T.textFaint,
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 14px",
        alignItems: "center",
        gap: 12,
        width: "100%",
        minHeight: 26,
        cursor: "pointer",
        color: T.text,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.3,
          color: T.text,
          whiteSpace: "normal",
        }}
      >
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: 14,
          height: 14,
          margin: 0,
          accentColor: T.primary,
          cursor: "pointer",
          justifySelf: "end",
        }}
      />
    </label>
  );
}

export default function Authorization() {
  const [data, setData] = useState<AuthorizationRecord[]>(
    initialAuthorizations,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: AuthorizationRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<AuthorizationRecord | null>(null);
  const [formData, setFormData] = useState<AuthorizationFormState>(() =>
    getDefaultFormState(),
  );

  const filteredData = data.filter((record) =>
    `${record.roleName} ${record.sectionName} ${record.menuName} ${record.tabName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const sectionMenus = useMemo(
    () => menuOptions.filter((menu) => menu.sectionId === formData.sectionId),
    [formData.sectionId],
  );

  const menuTabs = useMemo(
    () => tabOptions.filter((tab) => tab.menuId === formData.menuId),
    [formData.menuId],
  );

  const updateField = (
    field: keyof AuthorizationFormState,
    value: string | boolean,
  ) => {
    setFormData((state) => {
      const next = { ...state, [field]: value } as AuthorizationFormState;

      if (field === "sectionId") {
        const nextMenu =
          menuOptions.find((menu) => menu.sectionId === value) ||
          menuOptions[0];
        next.menuId = nextMenu.menuId;
        const nextTab =
          tabOptions.find((tab) => tab.menuId === nextMenu.menuId) ||
          tabOptions[0];
        next.tabId = nextTab.tabId;
      }

      if (field === "menuId") {
        const nextTab =
          tabOptions.find((tab) => tab.menuId === value) || tabOptions[0];
        next.tabId = nextTab.tabId;
      }

      return next;
    });
  };

  const handleOpenAdd = () => {
    setFormData(getDefaultFormState());
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: AuthorizationRecord) => {
    setFormData(getDefaultFormState(record));
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (
      !formData.roleId ||
      !formData.sectionId ||
      !formData.menuId ||
      !formData.tabId
    ) {
      return;
    }

    const selectedRole = roleOptions.find(
      (role) => role.roleId === formData.roleId,
    );
    const selectedSection = getSectionName(formData.sectionId);
    const selectedMenu = getMenuName(formData.menuId);
    const selectedTab = getTabName(formData.tabId);

    const record: AuthorizationRecord = {
      id:
        modal?.record?.id || `AUT-${String(data.length + 1).padStart(3, "0")}`,
      roleId: formData.roleId,
      roleName: selectedRole?.roleName || "",
      sectionId: formData.sectionId,
      sectionName: selectedSection,
      menuId: formData.menuId,
      menuName: selectedMenu,
      tabId: formData.tabId,
      tabName: selectedTab,
      canView: formData.canView,
      canAdd: formData.canAdd,
      canEdit: formData.canEdit,
      canDelete: formData.canDelete,
      isDefault: formData.isDefault,
      disableView: formData.disableView,
      disableAdd: formData.disableAdd,
      disableEdit: formData.disableEdit,
      disableDelete: formData.disableDelete,
    };

    if (modal?.mode === "edit") {
      setData((previous) =>
        previous.map((item) => (item.id === record.id ? record : item)),
      );
    } else {
      setData((previous) => [...previous, record]);
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    setData((previous) => previous.filter((item) => item.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <Card
      title="Authorization"
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
          <Plus size={13} /> Add authorization
        </button>
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search authorization..."
      />

      <Table>
        <thead>
          <tr>
            <Th>Role</Th>
            <Th>Section</Th>
            <Th>Menu</Th>
            <Th>Tab Name</Th>
            <Th>View</Th>
            <Th>Add</Th>
            <Th>Edit</Th>
            <Th>Delete</Th>
            <Th>Default</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((record) => (
            <tr className="stc-row" key={record.id}>
              <Td>{record.roleName}</Td>
              <Td>{record.sectionName}</Td>
              <Td>{record.menuName}</Td>
              <Td>{record.tabName}</Td>
              <Td>
                <PermissionCell value={record.canView} />
              </Td>
              <Td>
                <PermissionCell value={record.canAdd} />
              </Td>
              <Td>
                <PermissionCell value={record.canEdit} />
              </Td>
              <Td>
                <PermissionCell value={record.canDelete} />
              </Td>
              <Td>
                <StatusBadge
                  status={record.isDefault ? "Active" : "Inactive"}
                />
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
                    onClick={() => handleOpenEdit(record)}
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
                    onClick={() => setToDelete(record)}
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
              <Td colSpan={10}>No authorizations found.</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} - Authorization`}
          subtitle={
            modal.mode === "add"
              ? "Add a new role authorization"
              : "Update role authorization"
          }
          onClose={() => setModal(null)}
          width={760}
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
              <label className="stc-field-label">Role</label>
              <select
                value={formData.roleId}
                onChange={(event) => updateField("roleId", event.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Section</label>
              <select
                value={formData.sectionId}
                onChange={(event) =>
                  updateField("sectionId", event.target.value)
                }
              >
                {sectionOptions.map((section) => (
                  <option key={section.sectionId} value={section.sectionId}>
                    {section.sectionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Menu</label>
              <select
                value={formData.menuId}
                onChange={(event) => updateField("menuId", event.target.value)}
              >
                {sectionMenus.map((menu) => (
                  <option key={menu.menuId} value={menu.menuId}>
                    {menu.menuName}
                  </option>
                ))}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Tab</label>
              <select
                value={formData.tabId}
                onChange={(event) => updateField("tabId", event.target.value)}
              >
                {menuTabs.map((tab) => (
                  <option key={tab.tabId} value={tab.tabId}>
                    {tab.tabName}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="stc-field"
              style={{ gridColumn: "1 / -1", marginTop: 6 }}
            >
              <label className="stc-field-label">Permissions</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
                  columnGap: 28,
                  rowGap: 10,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <CheckboxRow
                  label="View"
                  checked={formData.canView}
                  onChange={() => updateField("canView", !formData.canView)}
                />
                <CheckboxRow
                  label="Add"
                  checked={formData.canAdd}
                  onChange={() => updateField("canAdd", !formData.canAdd)}
                />
                <CheckboxRow
                  label="Delete"
                  checked={formData.canDelete}
                  onChange={() => updateField("canDelete", !formData.canDelete)}
                />
                <CheckboxRow
                  label="Edit"
                  checked={formData.canEdit}
                  onChange={() => updateField("canEdit", !formData.canEdit)}
                />
                <CheckboxRow
                  label="Is default"
                  checked={formData.isDefault}
                  onChange={() => updateField("isDefault", !formData.isDefault)}
                />
              </div>
            </div>

            {modal.mode === "edit" && (
              <>
                <div
                  className="stc-field"
                  style={{ gridColumn: "1 / -1", marginTop: 8 }}
                >
                  <label className="stc-field-label">Disable access</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
                      columnGap: 28,
                      rowGap: 10,
                      marginTop: 10,
                      alignItems: "center",
                    }}
                  >
                    <CheckboxRow
                      label="Disable View"
                      checked={formData.disableView}
                      onChange={() =>
                        updateField("disableView", !formData.disableView)
                      }
                    />
                    <CheckboxRow
                      label="Disable Add"
                      checked={formData.disableAdd}
                      onChange={() =>
                        updateField("disableAdd", !formData.disableAdd)
                      }
                    />
                    <CheckboxRow
                      label="Disable Delete"
                      checked={formData.disableDelete}
                      onChange={() =>
                        updateField("disableDelete", !formData.disableDelete)
                      }
                    />
                    <CheckboxRow
                      label="Disable Edit"
                      checked={formData.disableEdit}
                      onChange={() =>
                        updateField("disableEdit", !formData.disableEdit)
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Delete - Authorization"
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
            This will permanently remove the authorization for{" "}
            {toDelete.roleName} on {toDelete.menuName} / {toDelete.tabName}.
            This cannot be undone.
          </p>
        </Modal>
      )}
    </Card>
  );
}
