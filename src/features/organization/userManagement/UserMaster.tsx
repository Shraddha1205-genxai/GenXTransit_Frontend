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

export interface UserRecord {
  userId: string;
  code: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  isActive: boolean;
}

export interface UserPayload {
  userId: string;
  username: string;
  email: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive: boolean;
}

const roleOptions = [
  { roleId: "ROL-001", roleName: "Super Admin" },
  { roleId: "ROL-002", roleName: "Depot Manager" },
  { roleId: "ROL-003", roleName: "Finance Officer" },
  { roleId: "ROL-004", roleName: "Route Planner" },
];

const initialUsers: UserRecord[] = [
  {
    userId: "USR-ID-001",
    code: "USR-001",
    username: "amit.kulkarni",
    email: "amit.kulkarni@genxtransit.com",
    roleId: "ROL-001",
    roleName: "Super Admin",
    firstName: "Amit",
    lastName: "Kulkarni",
    mobileNo: "9876543210",
    isActive: true,
  },
  {
    userId: "USR-ID-002",
    code: "USR-002",
    username: "neha.jadhav",
    email: "neha.jadhav@genxtransit.com",
    roleId: "ROL-002",
    roleName: "Depot Manager",
    firstName: "Neha",
    lastName: "Jadhav",
    mobileNo: "9876543211",
    isActive: true,
  },
  {
    userId: "USR-ID-003",
    code: "USR-003",
    username: "rohan.more",
    email: "rohan.more@genxtransit.com",
    roleId: "ROL-003",
    roleName: "Finance Officer",
    firstName: "Rohan",
    lastName: "More",
    mobileNo: "9876543212",
    isActive: true,
  },
  {
    userId: "USR-ID-004",
    code: "USR-004",
    username: "priya.sawant",
    email: "priya.sawant@genxtransit.com",
    roleId: "ROL-004",
    roleName: "Route Planner",
    firstName: "Priya",
    lastName: "Sawant",
    mobileNo: "9876543213",
    isActive: false,
  },
];

export default function UserMaster() {
  const [data, setData] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: UserRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState<Partial<UserPayload>>({});

  const filteredData = data.filter((user) =>
    `${user.code} ${user.username} ${user.email} ${user.roleName} ${user.firstName} ${user.lastName} ${user.mobileNo}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setFormData({
      userId: "",
      username: "",
      email: "",
      mobileNo: "",
      firstName: "",
      lastName: "",
      roleId: roleOptions[0].roleId,
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: UserRecord) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (
      !formData.username?.trim() ||
      !formData.email?.trim() ||
      !formData.roleId
    )
      return;
    const selectedRole = roleOptions.find(
      (role) => role.roleId === formData.roleId,
    );
    const user: UserRecord = {
      userId:
        formData.userId || `USR-ID-${String(data.length + 1).padStart(3, "0")}`,
      code:
        modal?.record?.code ||
        `USR-${String(data.length + 1).padStart(3, "0")}`,
      username: formData.username.trim(),
      email: formData.email.trim(),
      mobileNo: formData.mobileNo?.trim() || "",
      firstName: formData.firstName?.trim() || "",
      lastName: formData.lastName?.trim() || "",
      roleId: formData.roleId,
      roleName: selectedRole?.roleName || "",
      isActive: formData.isActive ?? true,
    };

    if (modal?.mode === "edit") {
      setData((previous) =>
        previous.map((item) => (item.userId === user.userId ? user : item)),
      );
    } else {
      setData((previous) => [...previous, user]);
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    setData((previous) =>
      previous.filter((item) => item.userId !== toDelete.userId),
    );
    setToDelete(null);
  };

  const updateField = (field: keyof UserPayload, value: string | boolean) => {
    setFormData((state) => ({ ...state, [field]: value }));
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
      />
      <Table>
        <thead>
          <tr>
            <Th>Code</Th>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>Mobile No</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((user) => (
            <tr className="stc-row" key={user.userId}>
              <Td mono>{user.code}</Td>
              <Td>{user.username}</Td>
              <Td>{user.email}</Td>
              <Td>{user.roleName}</Td>
              <Td>{user.firstName}</Td>
              <Td>{user.lastName}</Td>
              <Td mono>{user.mobileNo}</Td>
              <Td>
                <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
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
                    onClick={() => handleOpenEdit(user)}
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
                    onClick={() => setToDelete(user)}
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
              <Td colSpan={9}>No users found.</Td>
            </tr>
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
              <label className="stc-field-label">Username</label>
              <input
                value={formData.username || ""}
                onChange={(event) =>
                  updateField("username", event.target.value)
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
                value={formData.roleId || ""}
                onChange={(event) => updateField("roleId", event.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName} ({role.roleId})
                  </option>
                ))}
              </select>
            </div>
            {modal.mode === "edit" && (
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
            )}
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
            This will permanently remove {toDelete.username} from the list. This
            cannot be undone.
          </p>
        </Modal>
      )}
    </Card>
  );
}
