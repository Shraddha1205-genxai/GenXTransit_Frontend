import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDebounce } from "../../../hooks/useDebounce";
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
  userService,
  type User,
  type AddUserPayload,
  type UpdateUserPayload,
} from "../../../api/organization/userManagement/userService";
import {
  roleService,
  type RoleRecord,
} from "../../../api/organization/userManagement/roleService";

const PAGE_SIZE = 10;

interface UserFormData {
  userId?: number;
  userName?: string;
  email?: string;
  mobileNo?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
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
}

export default function UserMaster() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
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

  const filteredUsers = users;
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
    });
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (
      !formData.userName?.trim() ||
      !formData.email?.trim() ||
      !formData.mobileNo?.trim() ||
      !formData.firstName?.trim() ||
      !formData.lastName?.trim() ||
      !formData.roleId
    ) {
      toast.error("Please fill required fields.");
      return;
    }
    const roleId = String(formData.roleId ?? defaultRoleId);

    if (modal?.mode === "edit" && formData.userId) {
      updateMutation.mutate({
        userId: formData.userId,
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        mobileNo: formData.mobileNo?.trim() || "",
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        roleId,
      });
    } else {
      addMutation.mutate({
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        mobileNo: formData.mobileNo?.trim() || "",
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        roleId,
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
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        filters={[
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
          },
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
            <Th>Status</Th>
            {showActionsColumn && <Th align="right">Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td
                colSpan={showActionsColumn ? 8 : 7}
                style={{ textAlign: "center", color: T.textSoft }}
              >
                Loading users...
              </Td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <Td colSpan={showActionsColumn ? 8 : 7}>No users found.</Td>
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
                  <option value="" disabled>No roles available</option>
                ) : (
                  roleOptions.map((role: RoleRecord) => (
                    <option key={role.roleId} value={String(role.roleId)}>
                      {role.roleName}
                    </option>
                  ))
                )}
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
