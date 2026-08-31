import React, { useState } from "react";
import { Save } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Table, TableToolbar, Td, Th } from "../../../components/common";
import { initialRoles } from "./RoleMaster";
import { initialScreens } from "./ScreenMaster";

const roleOptions = initialRoles.map((role) => ({
  roleId: role.roleId,
  roleName: role.roleName,
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
}

const initialAuthorizations: AuthorizationRecord[] = initialScreens.map(
  (screen, index) => ({
    id: `AUT-${String(index + 1).padStart(3, "0")}`,
    roleId: roleOptions[index % roleOptions.length]?.roleId || "",
    roleName: roleOptions[index % roleOptions.length]?.roleName || "",
    sectionId: screen.sectionId,
    sectionName: screen.sectionName,
    menuId: screen.menuId,
    menuName: screen.menuLabel,
    tabId: screen.pageKey,
    tabName: screen.tabName,
    canView: true,
    canAdd: index % 3 !== 2,
    canEdit: index % 4 !== 3,
    canDelete: false,
    isDefault: index === 0,
  }),
);

type PermissionKey =
  | "canView"
  | "canAdd"
  | "canEdit"
  | "canDelete"
  | "isDefault";

function PermissionCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <input
      aria-label={label}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: 15,
        height: 15,
        margin: 0,
        accentColor: T.blue,
        cursor: "pointer",
      }}
    />
  );
}

export default function Authorization() {
  const [data, setData] = useState<AuthorizationRecord[]>(
    initialAuthorizations,
  );
  const [roleId, setRoleId] = useState(roleOptions[0]?.roleId || "");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredData = data.filter((record) => {
    const matchesRole = record.roleId === roleId;
    const matchesSearch =
      `${record.sectionName} ${record.menuName} ${record.tabName}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const updatePermission = (id: string, field: PermissionKey) => {
    setSaved(false);
    setData((items) =>
      items.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item,
      ),
    );
  };

  const saveAllPermissions = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Card
      title="Authorization"
      action={
        <button
          className="stc-btn stc-btn-primary"
          onClick={saveAllPermissions}
        >
          <Save size={14} />{" "}
          {saved ? "Permissions saved" : "Save all permissions"}
        </button>
      }
    >
      <div
        className="authorization-role-panel"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 16px",
          marginBottom: 16,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          background: T.hover,
        }}
      >
        <div className="authorization-role-field">
          <label className="stc-field-label" htmlFor="authorization-role">
            Role
          </label>
          <select
            className="authorization-role-select"
            id="authorization-role"
            value={roleId}
            onChange={(event) => {
              setRoleId(event.target.value);
              setSearch("");
            }}
          >
            {roleOptions.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>
        <div style={{ color: T.textSoft, fontSize: 12, paddingBottom: 9 }}>
          Manage permissions for the selected role.
        </div>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sections, menus, or tabs..."
      />

      <div className="authorization-table-shell">
        <Table>
          <thead>
            <tr>
              <Th>Section</Th>
              <Th>Menu</Th>
              <Th>Tab</Th>
              <Th align="center">View</Th>
              <Th align="center">Add</Th>
              <Th align="center">Edit</Th>
              <Th align="center">Delete</Th>
              <Th align="center">Default</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr className="stc-row" key={record.id}>
                <Td>{record.sectionName}</Td>
                <Td>{record.menuName}</Td>
                <Td>{record.tabName}</Td>
                {(
                  [
                    "canView",
                    "canAdd",
                    "canEdit",
                    "canDelete",
                    "isDefault",
                  ] as PermissionKey[]
                ).map((field) => (
                  <Td align="center" key={field}>
                    <PermissionCheckbox
                      label={`${record.tabName} ${field}`}
                      checked={record[field]}
                      onChange={() => updatePermission(record.id, field)}
                    />
                  </Td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <Td colSpan={8}>No permissions found for this role.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}
