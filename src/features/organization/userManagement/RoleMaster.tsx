import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  roleService,
  type RoleRecord,
  type CreateRoleDto,
  type UpdateRoleDto,
} from "../../../api/organization/userManagement/roleService";

export interface RolePayload {
  roleId?: number;
  roleName: string;
  description: string;
  isActive: boolean;
}

export const initialRoles: RoleRecord[] = [
  {
    roleId: 1,
    roleName: "Super Admin",
    description: "Full access",
    isActive: true,
  },
  {
    roleId: 2,
    roleName: "Depot Manager",
    description: "Manages depot operations",
    isActive: true,
  },
  {
    roleId: 3,
    roleName: "Finance Officer",
    description: "Wallet and collection",
    isActive: true,
  },
  {
    roleId: 4,
    roleName: "Route Planner",
    description: "Routes and schedule",
    isActive: true,
  },
];

export default function RoleMaster() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: RoleRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<RoleRecord | null>(null);
  const [formData, setFormData] = useState<Partial<RolePayload>>({});

  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
    staleTime: 0,
  });

  const filteredData = roles.filter((role) => {
    const matchesSearch = `${role.roleName} ${role.description}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "Active" ? role.isActive : !role.isActive;
    return matchesSearch && matchesStatus;
  });

  const addMutation = useMutation({
    mutationFn: (payload: CreateRoleDto) => roleService.insert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role added successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateRoleDto) => roleService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => roleService.delete({ roleId }),
    onSuccess: (_, roleId) => {
      queryClient.setQueryData<RoleRecord[]>(["roles"], (previous = []) =>
        previous.map((role) =>
          role.roleId === roleId ? { ...role, isActive: false } : role,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully.");
      setToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete role");
    },
  });

  const handleOpenAdd = () => {
    setFormData({ roleName: "", description: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: RoleRecord) => {
    setFormData({
      roleId: record.roleId,
      roleName: record.roleName,
      description: record.description,
      isActive: record.isActive,
    });
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.roleName?.trim()) return;

    const basePayload = {
      roleName: formData.roleName.trim(),
      description: formData.description?.trim() || "",
    };

    if (modal?.mode === "edit" && formData.roleId) {
      updateMutation.mutate({
        roleId: Number(formData.roleId),
        ...basePayload,
        isActive: formData.isActive ?? true,
      });
      return;
    }

    addMutation.mutate(basePayload);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.roleId);
  };

  return (
    <Card
      title="Roles"
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
          <Plus size={13} /> Add role
        </button>
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles..."
        filters={[
          {
            key: "status",
            label: "",
            value: statusFilter,
            options: [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />
      {error && (
        <div style={{ color: T.red, padding: "12px 0", fontSize: 13 }}>
          {error instanceof Error ? error.message : "Failed to load roles"}
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <Th>Role Name</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            {statusFilter === "Active" && <Th align="right">Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td
                colSpan={statusFilter === "Active" ? 4 : 3}
                style={{ textAlign: "center", color: T.textSoft }}
              >
                Loading roles...
              </Td>
            </tr>
          ) : filteredData.length === 0 ? (
            <tr>
              <Td colSpan={statusFilter === "Active" ? 4 : 3}>
                No roles found.
              </Td>
            </tr>
          ) : (
            filteredData.map((role) => (
              <tr className="stc-row" key={role.roleId}>
                <Td>{role.roleName}</Td>
                <Td>{role.description}</Td>
                <Td>
                  <StatusBadge status={role.isActive ? "Active" : "Inactive"} />
                </Td>
                {statusFilter === "Active" && (
                  <Td align="right">
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => handleOpenEdit(role)}
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
                        onClick={() => setToDelete(role)}
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
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} - Role`}
          subtitle={
            modal.mode === "add" ? "Add a new role" : "Update role details"
          }
          onClose={() => setModal(null)}
          width={520}
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
              <label className="stc-field-label">Role Name</label>
              <input
                value={formData.roleName || ""}
                onChange={(event) =>
                  setFormData((state) => ({
                    ...state,
                    roleName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Description</label>
              <input
                value={formData.description || ""}
                onChange={(event) =>
                  setFormData((state) => ({
                    ...state,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Delete - Role"
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
            This will permanently remove {toDelete.roleName} from the list. This
            cannot be undone.
          </p>
        </Modal>
      )}
    </Card>
  );
}
