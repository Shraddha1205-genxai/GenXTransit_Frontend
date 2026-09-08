import React, { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import { usePermissions } from "../../../hooks/usePermissions";
import { Card, Table, TableToolbar, Td, Th } from "../../../components/common";
import { apiClient } from "../../../api/apiClient";
import {
  roleService,
  type RoleRecord,
} from "../../../api/organization/userManagement/roleService";
 
export interface AuthorizationRecord {
  authId?: number | null;
  roleId: number;
  sectionId: number;
  menuId: number;
  tabId: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isDefault?: boolean;
  isDisableView?: boolean;
  isDisableAdd?: boolean;
  isDisableEdit?: boolean;
  isDisableDelete?: boolean;
  isDisableAction?: boolean;
  sectionName?: string;
  menuName?: string;
  tabName?: string;
}
 
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
  const { canAdd, canEdit, canDelete } = usePermissions("Authorization");
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
 
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
    staleTime: 0,
  });
 
  const roleOptions = roles.filter((role: RoleRecord) => role.isActive);
 
  React.useEffect(() => {
    if (!roleId && roleOptions.length) {
      setRoleId(String(roleOptions[0].roleId));
    }
  }, [roleId, roleOptions]);
 
  const selectedRoleId = Number(roleId || roleOptions[0]?.roleId || 0);
 
  const {
    data: authorizationData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authorization", selectedRoleId, search],
    enabled: !!selectedRoleId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRoleId) params.set("roleId", String(selectedRoleId));
      if (search.trim()) params.set("searchText", search.trim());
 
      const queryString = params.toString();
      const url = `/authorization${queryString ? `?${queryString}` : ""}`;
      const response = await apiClient.get<any[]>(url);
 
      return (response.data || []).map((record: any) => ({
        authId: record.authId ?? null,
        roleId: Number(record.roleId ?? selectedRoleId),
        sectionId: Number(record.sectionId ?? 0),
        menuId: Number(record.menuId ?? 0),
        tabId: Number(record.tabId ?? 0),
        canView: Boolean(record.canView),
        canAdd: Boolean(record.canAdd),
        canEdit: Boolean(record.canEdit),
        canDelete: Boolean(record.canDelete),
        isDefault: Boolean(record.isDefault ?? false),
        sectionName: record.sectionName ?? "",
        menuName: record.menuName ?? "",
        tabName: record.tabName ?? "",
        isDisableView: Boolean(record.isDisableView ?? false),
        isDisableAdd: Boolean(record.isDisableAdd ?? false),
        isDisableEdit: Boolean(record.isDisableEdit ?? false),
        isDisableDelete: Boolean(record.isDisableDelete ?? false),
        isDisableAction: Boolean(record.isDisableAction ?? false),
      }));
    },
    staleTime: 0,
  });
 
  const mergedData = useMemo<AuthorizationRecord[]>(() => {
    return authorizationData.map((record) => ({
      ...record,
      sectionName: record.sectionName || `Section ${record.sectionId}`,
      menuName: record.menuName || `Menu ${record.menuId}`,
      tabName: record.tabName || `Tab ${record.tabId}`,
    }));
  }, [authorizationData]);
 
  const filteredData = mergedData.filter((record) => {
    const matchesSearch =
      `${record.sectionName || ""} ${record.menuName || ""} ${record.tabName || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesSearch;
  });
 
  const updatePermission = (
    targetRecord: AuthorizationRecord,
    field: PermissionKey,
  ) => {
    setSaved(false);
 
    const isSettingDefaultToTrue = field === "isDefault" && !targetRecord.isDefault;
 
    const nextData = mergedData.map((item) => {
      const isTarget =
        targetRecord.authId != null && item.authId != null
          ? item.authId === targetRecord.authId
          : item.sectionId === targetRecord.sectionId &&
            item.menuId === targetRecord.menuId &&
            item.tabId === targetRecord.tabId;
 
      if (isTarget) {
        if (field === "canView" && item.canView) {
          // Unchecking "View" automatically unchecks Add, Edit, Delete, and Is Default
          return {
            ...item,
            canView: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
            isDefault: false,
          };
        }
 
        return {
          ...item,
          [field]: !item[field],
        };
      }
 
      if (isSettingDefaultToTrue && field === "isDefault") {
        return {
          ...item,
          isDefault: false,
        };
      }
 
      return item;
    });
 
    queryClient.setQueryData<AuthorizationRecord[]>(
      ["authorization", selectedRoleId, search],
      nextData,
    );
  };
 
  const saveAllPermissions = useMutation({
    mutationFn: async (items: AuthorizationRecord[]) => {
      const payload = items.map((item) => ({
        authId: item.authId ?? null,
        roleId: item.roleId,
        sectionId: item.sectionId,
        menuId: item.menuId,
        tabId: item.tabId,
        canView: item.canView,
        canAdd: item.canAdd,
        canEdit: item.canEdit,
        canDelete: item.canDelete,
        isDefault: Boolean(item.isDefault ?? false),
      }));
 
      await apiClient.post<boolean>("/authorization/saveall", payload);
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authorization", selectedRoleId],
      });
      setSaved(true);
      toast.success("Permissions saved successfully.");
      window.setTimeout(() => setSaved(false), 1800);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save permissions");
    },
  });
 
  return (
    <Card
      title="Authorization"
      action={
        canAdd ? (
          <button
            className="stc-btn stc-btn-primary"
            onClick={() => {
              if (!selectedRoleId) {
                toast.error("Please select a role before saving.");
                return;
              }
              if (!mergedData.length) {
                toast.error("No permissions to save.");
                return;
              }
              const defaultScreens = mergedData.filter((item) => item.isDefault);
              if (defaultScreens.length === 0) {
                toast.error("Please mark exactly one tab as the default screen.");
                return;
              }
              if (defaultScreens.length > 1) {
                toast.error("Only one tab can be marked as the default screen.");
                return;
              }
              const invalidRows = mergedData.filter(
                (item) =>
                  !item.isDisableAction &&
                  !item.isDisableView &&
                  (item.canAdd || item.canEdit || item.canDelete) &&
                  !item.canView,
              );
              if (invalidRows.length > 0) {
                toast.error(
                  `"View" permission must be enabled when Add/Edit/Delete is granted (${invalidRows[0].tabName || "a tab"}).`,
                );
                return;
              }
              saveAllPermissions.mutate(mergedData);
            }}
            disabled={saveAllPermissions.isPending || !mergedData.length}
          >
            <Save size={14} />{" "}
            {saved ? "Permissions saved" : "Save all permissions"}
          </button>
        ) : undefined
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sections, menus, or tabs..."
        filters={[
          {
            key: "role",
            label: "",
            value: roleId,
            options: roleOptions.map((role: RoleRecord) => ({
              value: String(role.roleId),
              label: role.roleName,
            })),
            clearable: false,
            onChange: (value) => {
              setRoleId(value);
              setSearch("");
            },
          },
        ]}
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
              <Th align="center">Is Default Screen</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td
                  colSpan={8}
                  style={{ textAlign: "center", color: T.textSoft }}
                >
                  Loading permissions...
                </Td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <Td colSpan={8}>No permissions found for this role.</Td>
              </tr>
            ) : (
              filteredData.map((record) => (
                <tr
                  className="stc-row"
                  key={
                    record.authId ??
                    `${record.roleId}-${record.sectionId}-${record.menuId}-${record.tabId}`
                  }
                >
                  <Td>{record.sectionName || record.sectionId}</Td>
                  <Td>{record.menuName || record.menuId}</Td>
                  <Td>{record.tabName || record.tabId}</Td>
                  {(
                    [
                      "canView",
                      "canAdd",
                      "canEdit",
                      "canDelete",
                      "isDefault",
                    ] as PermissionKey[]
                  ).map((field) => {
                    const isDisabled =
                      record.isDisableAction ||
                      (field === "canView" && record.isDisableView) ||
                      (field === "canAdd" && record.isDisableAdd) ||
                      (field === "canEdit" && record.isDisableEdit) ||
                      (field === "canDelete" && record.isDisableDelete);
 
                    return (
                      <Td align="center" key={field}>
                        {isDisabled ? (
                          <span style={{ color: T.textDisabled }}> </span>
                        ) : (
                          <PermissionCheckbox
                            label={`${record.tabName || record.tabId} ${field}`}
                            checked={Boolean(record[field])}
                            onChange={() => updatePermission(record, field)}
                          />
                        )}
                      </Td>
                    );
                  })}
                </tr>
              ))
            )}
            {error && (
              <tr>
                <Td colSpan={8} style={{ color: T.red }}>
                  {error instanceof Error
                    ? error.message
                    : "Failed to load permissions"}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}
 
 