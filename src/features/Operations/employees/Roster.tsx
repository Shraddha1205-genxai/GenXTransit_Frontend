import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, StatusBadge, Table, Modal } from "../../../components/common";

export interface EmployeeRecord {
  empId: string;
  empCode: string;
  empName: string;
  role: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  shift: string;
  attendanceStatus: string; 
  isActive: boolean;
}
export interface EmployeeRecordPayload {
  empId: string;
  empCode: string;
  empName: string;
  role: string;
  depotId: string;
  shift: string;
  attendanceStatus: string; 
  isActive: boolean;
}
interface RosterProps {
  data: EmployeeRecord[];
  depotOptions?: {depotId: string; depotName: string; depotCode: string;}[];
  onAdd?: (item: EmployeeRecordPayload) => void;
  onUpdate?: (item: EmployeeRecordPayload) => void;
  onDelete?: (id: string) => void;
}

const ROLES = ["Driver", "Conductor", "Inspector", "Admin staff", "Mechanic", "Supervisor"];
const SHIFTS = [
  "Morning (06:00–14:00)",
  "Evening (14:00–22:00)",
  "Night (22:00–06:00)",
  "General (09:00–18:00)"
];
const ATTENDANCE_STATUSES = ["On duty", "On leave", "Absent", "Suspended"];

export function Roster({ data, depotOptions = [], onAdd, onUpdate, onDelete }: RosterProps) {
  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: EmployeeRecord } | null>(null);
  const [toDelete, setToDelete] = useState<EmployeeRecord | null>(null);
  const [formData, setFormData] = useState<Partial<EmployeeRecord>>({});

  const handleOpenAdd = () => {
    setFormData({
      empId: "",
      empCode: "",
      empName: "",
      role: ROLES[0],
      depotId: depotOptions[0].depotId || "MSRTC-PUN-01",
      shift: SHIFTS[0],
      attendanceStatus: ATTENDANCE_STATUSES[0],
      isActive: true
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (item: EmployeeRecord) => {
    setFormData({ ...item });
    setModal({ mode: "edit", record: item });
  };

  const handleSave = () => {
    if (!formData.empName) return;
    const record = formData as EmployeeRecord;
    if (modal?.mode === "add") {
      if (onAdd) onAdd(record);
    } else if (modal?.mode === "edit") {
      if (onUpdate) onUpdate(record);
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (toDelete && onDelete) {
      onDelete(toDelete.empId);
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Employee roster"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add employee
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Depot</Th>
              <Th>Shift</Th>
              <Th>Attendance Status</Th>
              <Th>Stuatus</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((e: EmployeeRecord) => (
              <tr key={e.empId} className="stc-row">
                <Td mono>{e.empCode}</Td>
                <Td>{e.empName}</Td>
                <Td>{e.role}</Td>
                <Td mono>{e.depotCode}</Td>
                <Td>{e.shift}</Td>
                <Td>
                  <StatusBadge status={e.attendanceStatus} />
                </Td>
                <Td>
                  <StatusBadge status={e.isActive ? "Active" : "InActive"} />
                </Td>
                <Td align="right">
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => handleOpenEdit(e)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(e)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} — Employee`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
            </>
          }
        >
          <div className="stc-form-grid">
            {modal.mode == "edit" && (<div className="stc-field">
            <label className="stc-field-label">Employee Code</label>
            <input
              disabled={modal.mode === "edit"}
              value={formData.empCode || ""}
              onChange={(e) => setFormData((s) => ({ ...s, empCode: e.target.value }))}
            />
          </div>)}
          <div className="stc-field">
            <label className="stc-field-label">Name</label>
            <input
              value={formData.empName || ""}
              onChange={(e) => setFormData((s) => ({ ...s, empName: e.target.value }))}
              placeholder="e.g. S. Jadhav"
            />
          </div>
          <div className="stc-field">
            <label className="stc-field-label">Role</label>
            <select
              value={formData.role || ""}
              onChange={(e) => setFormData((s) => ({ ...s, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="stc-field">
            <label className="stc-field-label">Depot</label>
            <select
              value={formData.depotId || ""}
              onChange={(e) => setFormData((s) => ({ ...s, depotId: e.target.value }))}
            >
              {depotOptions.length > 0 && depotOptions.map((d) => (
                <option key={d.depotId} value={d.depotId}>{d.depotCode}</option>
              ))}
            </select>
          </div>
          <div className="stc-field">
            <label className="stc-field-label">Shift</label>
            <select
              value={formData.shift || ""}
              onChange={(e) => setFormData((s) => ({ ...s, shift: e.target.value }))}
            >
              {SHIFTS.map((sh) => (
                <option key={sh} value={sh}>{sh}</option>
              ))}
            </select>
          </div>
          <div className="stc-field">
            <label className="stc-field-label">Status</label>
            <select
              value={formData.attendanceStatus || ""}
              onChange={(e) => setFormData((s) => ({ ...s, attendanceStatus: e.target.value }))}
            >
              {ATTENDANCE_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          {/* {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.isActive ? "Active" : "Inactive"}
                    onChange={(e) => setFormData((s) => ({ ...s, isActive: e.target.value === "Active" }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )} */}
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Delete — Employee"
          subtitle="This action cannot be undone"
          icon={<Trash2 size={20} color={T.red} />}
          iconVariant="danger"
          onClose={() => setToDelete(null)}
          width={420}
          footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }
        >
          <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
            This will permanently remove employee <strong>{toDelete.empName}</strong> ({toDelete.empId}) from the list. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Roster;
