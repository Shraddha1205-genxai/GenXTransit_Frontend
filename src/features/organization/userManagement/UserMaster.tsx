import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDebounce } from "../../../hooks/useDebounce";
import { T } from "../../../constants/theme";
import { usePermissions } from "../../../hooks/usePermissions";
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
  userService,
  type User,
  type AddUserPayload,
  type UpdateUserPayload,
} from "../../../api/organization/userManagement/userService";
import {
  roleService,
  type RoleRecord,
} from "../../../api/organization/userManagement/roleService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { divisionService } from "../../../api/organization/organizationManagement/divisionService";
import { depotService } from "../../../api/organization/organizationManagement/depotService";

const PAGE_SIZE = 10;

interface UserFormData {
  userId?: number;
  userName?: string;
  email?: string;
  mobileNo?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  address?: string;
  regionId?: string;
  divisionId?: string;
  depotId?: string;
}

interface UserRow {
  userId: number;
  userName: string;
  email: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  isFirstLogin: boolean;
  createdDate: string;
  address?: string | null;
  regionId?: number;
  regionName?: string | null;
  divisionId?: number;
  divisionName?: string | null;
  depotId?: number;
  depotName?: string | null;
}

export default function UserMaster() {
  const { canAdd, canEdit, canDelete } = usePermissions("UserMaster");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [roleFilter, setRoleFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [depotFilter, setDepotFilter] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: UserRow;
  } | null>(null);
  const [toDelete, setToDelete] = useState<UserRow | null>(null);
  const [formData, setFormData] = useState<UserFormData>({});

  const debouncedSearch = useDebounce(search, 500);

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
    staleTime: 0,
  });

  const roleOptions = roles.filter((role) => role.isActive);
  const defaultRoleId = String(roleOptions[0]?.roleId ?? 1);

  const { data: regions = [] } = useQuery({
    queryKey: ["regions", "user-master"],
    queryFn: () => regionService.getAll(undefined, true),
    staleTime: 0,
  });
  const { data: divisions = [] } = useQuery({
    queryKey: ["divisions", "user-master"],
    queryFn: () => divisionService.getAll(undefined, undefined, true),
    staleTime: 0,
  });
  const { data: depots = [] } = useQuery({
    queryKey: ["depots", "user-master"],
    queryFn: () =>
      depotService.getAll(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      ),
    staleTime: 0,
  });

  const isActiveParam =
    statusFilter === "Active"
      ? true
      : statusFilter === "Inactive"
        ? false
        : undefined;

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", debouncedSearch, statusFilter],
    queryFn: () =>
      userService.getAll({
        searchText: debouncedSearch || undefined,
        isActive: isActiveParam,
      }),
    staleTime: 0,
  });

  const filteredUsers = users.filter((user) => {
    const matchesRole = !roleFilter || Number(user.roleId) === Number(roleFilter);
    const matchesRegion =
      !regionFilter || Number(user.regionId ?? 0) === Number(regionFilter);
    const matchesDivision =
      !divisionFilter ||
      Number(user.divisionId ?? 0) === Number(divisionFilter);
    const matchesDepot =
      !depotFilter || Number(user.depotId ?? 0) === Number(depotFilter);

    return matchesRole && matchesRegion && matchesDivision && matchesDepot;
  });
  const showActionsColumn =
    statusFilter === "Active" || statusFilter === "Both";

  const addMutation = useMutation({
    mutationFn: (payload: AddUserPayload) => userService.add(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User added successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => userService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => userService.delete({ userId }),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<User[]>(["users"], (previous = []) =>
        previous.map((user) =>
          user.userId === userId ? { ...user, isActive: false } : user,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully.");
      setToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  const items: UserRow[] = filteredUsers.map((user) => {
    const parsedRoleId = Number(user.roleId ?? 0);
    const matchedRole = roles.find((role) => role.roleId === parsedRoleId);

    return {
      ...user,
      roleId: parsedRoleId,
      roleName:
        matchedRole?.roleName || user.roleName || `Role ${parsedRoleId}`,
    };
  });

  const handleOpenAdd = () => {
    setFormData({
      userName: "",
      email: "",
      mobileNo: "",
      firstName: "",
      lastName: "",
      roleId: "",
      address: "",
      regionId: "",
      divisionId: "",
      depotId: "",
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: UserRow) => {
    setFormData({
      userId: record.userId,
      userName: record.userName,
      email: record.email,
      mobileNo: record.mobileNo,
      firstName: record.firstName,
      lastName: record.lastName,
      roleId: String(record.roleId || ""),
      address: record.address || "",
      regionId: String(record.regionId || ""),
      divisionId: String(record.divisionId || ""),
      depotId: String(record.depotId || ""),
    });
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    const userName = formData.userName?.trim() ?? "";
    const email = formData.email?.trim() ?? "";
    const mobileNo = formData.mobileNo?.trim() ?? "";
    const firstName = formData.firstName?.trim() ?? "";
    const lastName = formData.lastName?.trim() ?? "";

    if (!userName) { toast.error("Username is required."); return; }
    if (/\s/.test(userName)) { toast.error("Username must not contain spaces."); return; }
    if (userName.length < 3) { toast.error("Username must be at least 3 characters."); return; }

    if (!email) { toast.error("Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email address."); return; }

    if (!mobileNo) { toast.error("Mobile number is required."); return; }
    if (!/^\d{10}$/.test(mobileNo)) { toast.error("Mobile number must be exactly 10 digits."); return; }

    if (!firstName) { toast.error("First name is required."); return; }
    if (!/^[a-zA-Z\s'-]+$/.test(firstName)) { toast.error("First name must contain only letters."); return; }

    if (!lastName) { toast.error("Last name is required."); return; }
    if (!/^[a-zA-Z\s'-]+$/.test(lastName)) { toast.error("Last name must contain only letters."); return; }

    if (!formData.roleId) { toast.error("Please select a role."); return; }
    if (!formData.regionId) { toast.error("Please select a region."); return; }
    if (!formData.divisionId) { toast.error("Please select a division."); return; }
    if (!formData.depotId) { toast.error("Please select a depot."); return; }

    const roleId = Number(formData.roleId ?? defaultRoleId);
    const regionId = Number(formData.regionId);
    const divisionId = Number(formData.divisionId);
    const depotId = Number(formData.depotId);

    if (modal?.mode === "edit" && formData.userId) {
      updateMutation.mutate({
        userId: formData.userId,
        userName,
        email,
        mobileNo,
        firstName,
        lastName,
        roleId,
        address: formData.address?.trim() || "",
        regionId,
        divisionId,
        depotId,
      });
    } else {
      addMutation.mutate({
        userName,
        email,
        mobileNo,
        firstName,
        lastName,
        roleId,
        address: formData.address?.trim() || "",
        regionId,
        divisionId,
        depotId,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.userId);
  };

  const updateField = (field: keyof UserFormData, value: string | number) => {
    setFormData((state) => ({
      ...state,
      [field]: field === "roleId" ? String(value) : value,
    }));
  };

  return (
    <Card
      title="Users"
      action={
        canAdd ? (
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
            <Plus size={13} /> Add user
          </button>
        ) : undefined
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        filters={[
          {
            key: "role",
            label: "Role",
            value: roleFilter,
            options: roleOptions.map((role) => ({
              value: String(role.roleId),
              label: role.roleName,
            })),
            clearable: false,
            onChange: setRoleFilter,
          },
          {
            key: "region",
            label: "Region",
            value: regionFilter,
            options: regions.map((region) => ({
              value: String(region.regionId),
              label: region.regionName,
            })),
            clearable: false,
            onChange: (value) => {
              setRegionFilter(value);
              setDivisionFilter("");
              setDepotFilter("");
            },
          },
          {
            key: "division",
            label: "Division",
            value: divisionFilter,
            options: divisions
              .filter(
                (division) =>
                  !regionFilter ||
                  Number(division.regionId) === Number(regionFilter),
              )
              .map((division) => ({
                value: String(division.divisionId),
                label: division.divisionName,
              })),
            clearable: false,
            disabled: !regionFilter,
            onChange: (value) => {
              setDivisionFilter(value);
              setDepotFilter("");
            },
          },
          {
            key: "depot",
            label: "Depot",
            value: depotFilter,
            options: depots
              .filter(
                (depot) =>
                  !divisionFilter ||
                  Number(depot.divisionId) === Number(divisionFilter),
              )
              .map((depot) => ({
                value: String(depot.depotId),
                label: depot.depotName,
              })),
            clearable: false,
            disabled: !divisionFilter,
            onChange: setDepotFilter,
          },
          {
            key: "status",
            label: "",
            value: statusFilter,
            options: [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Both", label: "Both" },
            ],
            onChange: setStatusFilter,
          }
        ]}
      />
      {error && (
        <div style={{ color: T.red, padding: "12px 0", fontSize: 13 }}>
          {error instanceof Error ? error.message : "Failed to load users"}
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>Mobile No</Th>
            <Th>Region</Th>
            <Th>Division</Th>
            <Th>Depot</Th>
            <Th>Status</Th>
            {showActionsColumn && <Th align="right">Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td
                colSpan={showActionsColumn ? 11 : 10}
                style={{ textAlign: "center", color: T.textSoft }}
              >
                Loading users...
              </Td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <Td colSpan={showActionsColumn ? 11 : 10}>No users found.</Td>
            </tr>
          ) : (
            items.map((user) => (
              <tr className="stc-row" key={user.userId}>
                <Td>{user.userName}</Td>
                <Td>{user.email}</Td>
                <Td>{user.roleName}</Td>
                <Td>{user.firstName}</Td>
                <Td>{user.lastName}</Td>
                <Td mono>{user.mobileNo}</Td>
                <Td>{user.regionName || "-"}</Td>
                <Td>{user.divisionName || "-"}</Td>
                <Td>{user.depotName || "-"}</Td>
                <Td>
                  <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
                </Td>
                {showActionsColumn && (
                  <Td align="right">
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                      }}
                    >
                      {canEdit && (
                        <button
                          onClick={() => user.isActive && handleOpenEdit(user)}
                          title="Edit"
                          disabled={!user.isActive}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: user.isActive ? "pointer" : "not-allowed",
                            padding: 2,
                            display: "flex",
                            opacity: user.isActive ? 1 : 0.35,
                          }}
                        >
                          <Pencil size={14} color={T.textSoft} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => user.isActive && setToDelete(user)}
                          title="Delete"
                          disabled={!user.isActive}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: user.isActive ? "pointer" : "not-allowed",
                            padding: 2,
                            display: "flex",
                            opacity: user.isActive ? 1 : 0.35,
                          }}
                        >
                          <Trash2 size={14} color={T.red} />
                        </button>
                      )}
                    </div>
                  </Td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} - User`}
          subtitle={
            modal.mode === "add" ? "Add a new user" : "Update user details"
          }
          onClose={() => setModal(null)}
          width={620}
          footer={
            <>
              <button
                className="stc-btn stc-btn-ghost"
                onClick={() => setModal(null)}
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="stc-btn stc-btn-primary"
                onClick={handleSave}
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </>
          }
        >
          <div className="stc-form-grid">
            <div className="stc-field">
              <label className="stc-field-label">Username</label>
              <input
                value={formData.userName || ""}
                onChange={(event) =>
                  updateField("userName", event.target.value)
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Mobile No</label>
              <input
                value={formData.mobileNo || ""}
                onChange={(event) =>
                  updateField("mobileNo", event.target.value)
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">First Name</label>
              <input
                value={formData.firstName || ""}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Last Name</label>
              <input
                value={formData.lastName || ""}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Role</label>
              <select
                value={String(formData.roleId || "")}
                onChange={(event) => updateField("roleId", event.target.value)}
              >
                <option value="">Select Role</option>
                {roleOptions.length === 0 ? (
                  <option value="" disabled>
                    No roles available
                  </option>
                ) : (
                  roleOptions.map((role: RoleRecord) => (
                    <option key={role.roleId} value={String(role.roleId)}>
                      {role.roleName}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Address</label>
              <input
                value={formData.address || ""}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Region</label>
              <select
                value={String(formData.regionId || "")}
                onChange={(event) => {
                  updateField("regionId", event.target.value);
                  updateField("divisionId", "");
                  updateField("depotId", "");
                }}
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region.regionId} value={String(region.regionId)}>
                    {region.regionName}
                  </option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Division</label>
              <select
                value={String(formData.divisionId || "")}
                onChange={(event) => {
                  updateField("divisionId", event.target.value);
                  updateField("depotId", "");
                }}
              >
                <option value="">Select Division</option>
                {divisions
                  .filter(
                    (division) =>
                      !formData.regionId ||
                      Number(division.regionId) === Number(formData.regionId),
                  )
                  .map((division) => (
                    <option
                      key={division.divisionId}
                      value={String(division.divisionId)}
                    >
                      {division.divisionName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Depot</label>
              <select
                value={String(formData.depotId || "")}
                onChange={(event) => updateField("depotId", event.target.value)}
              >
                <option value="">Select Depot</option>
                {depots
                  .filter(
                    (depot) =>
                      !formData.divisionId ||
                      Number(depot.divisionId) === Number(formData.divisionId),
                  )
                  .map((depot) => (
                    <option key={depot.depotId} value={String(depot.depotId)}>
                      {depot.depotName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Delete - User"
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
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="stc-btn stc-btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
            This will permanently remove {toDelete.userName} from the list. This
            cannot be undone.
          </p>
        </Modal>
      )}
    </Card>
  );
}
