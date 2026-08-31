import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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

export interface RoleRecord {
  roleId: string;
  roleName: string;
  description: string;
  isActive: boolean;
}

export interface RolePayload {
  roleId: string;
  roleName: string;
  description: string;
  isActive: boolean;
}

export const initialRoles: RoleRecord[] = [
  {
    roleId: "ROL-001",
    roleName: "Super Admin",
    description: "Full access across the platform",
    isActive: true,
  },
  {
    roleId: "ROL-002",
    roleName: "Depot Manager",
    description: "Manages an assigned depot and staff",
    isActive: true,
  },
  {
    roleId: "ROL-003",
    roleName: "Finance Officer",
    description: "Reviews collections and wallet activity",
    isActive: true,
  },
  {
    roleId: "ROL-004",
    roleName: "Route Planner",
    description: "Maintains routes and operating schedules",
    isActive: false,
  },
];

export default function RoleMaster() {
  const [data, setData] = useState<RoleRecord[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: RoleRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<RoleRecord | null>(null);
  const [formData, setFormData] = useState<Partial<RolePayload>>({});

  const filteredData = data.filter((role) => {
    const matchesSearch = `${role.roleName} ${role.description}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "Active" ? role.isActive : !role.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({ roleId: "", roleName: "", description: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: RoleRecord) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.roleName?.trim()) return;

    const role: RolePayload = {
      roleId:
        formData.roleId || `ROL-${String(data.length + 1).padStart(3, "0")}`,
      roleName: formData.roleName.trim(),
      description: formData.description?.trim() || "",
      isActive: formData.isActive ?? true,
    };

    if (modal?.mode === "edit") {
      setData((previous) =>
        previous.map((item) => (item.roleId === role.roleId ? role : item)),
      );
    } else {
      setData((previous) => [...previous, role]);
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    setData((previous) =>
      previous.filter((item) => item.roleId !== toDelete.roleId),
    );
    setToDelete(null);
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
            label: "Status",
            value: statusFilter,
            options: [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Role Name</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((role) => (
            <tr className="stc-row" key={role.roleId}>
              <Td>{role.roleName}</Td>
              <Td>{role.description}</Td>
              <Td>
                <StatusBadge status={role.isActive ? "Active" : "Inactive"} />
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
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <Td colSpan={4}>No roles found.</Td>
            </tr>
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
            This will permanently remove {toDelete.roleName} from the list. This
            cannot be undone.
          </p>
        </Modal>
      )}
    </Card>
  );
}
