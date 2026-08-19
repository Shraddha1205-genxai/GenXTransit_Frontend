import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface FleetVehicleRecord {
  reg: string;
  category: string;
  depot: string;
  status: string;
  nextService: string;
  docExpiry: string;
}

export interface FleetManagementPageProps {
  data?: FleetVehicleRecord[];
  depotOptions?: string[];
  onAdd?: (item: FleetVehicleRecord) => void;
  onUpdate?: (reg: string, item: FleetVehicleRecord) => void;
  onDelete?: (reg: string) => void;
}

const initialDefaultFleetVehicles: FleetVehicleRecord[] = [
  { reg: "MH-12-AB-4421", category: "AC Shivneri", depot: "MSRTC-PUN-01", status: "Active", nextService: "12 Aug 2026", docExpiry: "Fitness · 18 Aug 2026" },
  { reg: "MH-12-CD-1187", category: "Express (ST)", depot: "MSRTC-PUN-01", status: "Active", nextService: "22 Aug 2026", docExpiry: "Insurance · 02 Sep 2026" },
  { reg: "MH-01-EF-7702", category: "AC Local (BEST)", depot: "BEST-MUM-04", status: "Under maintenance", nextService: "In progress", docExpiry: "PUC · 09 Aug 2026" },
];

export function VehicleRegister({ data: propData, depotOptions = [], onAdd, onUpdate, onDelete }: FleetManagementPageProps) {
  const [internalData, setInternalData] = useState<FleetVehicleRecord[]>(initialDefaultFleetVehicles);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: FleetVehicleRecord } | null>(null);
  const [toDelete, setToDelete] = useState<FleetVehicleRecord | null>(null);
  const [formData, setFormData] = useState<Partial<FleetVehicleRecord>>({});

  const handleOpenAdd = () => {
    setFormData({ reg: "", category: "", depot: depotOptions[0] || "", status: "Active", nextService: "", docExpiry: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: FleetVehicleRecord) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.reg || !formData.category) return;

    const newRecord: FleetVehicleRecord = {
      reg: formData.reg,
      category: formData.category,
      depot: formData.depot || depotOptions[0] || "",
      status: formData.status || "Active",
      nextService: formData.nextService || "",
      docExpiry: formData.docExpiry || "",
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.reg, newRecord);
      } else {
        setInternalData((prev) => prev.map((item) => (item.reg === modal.record!.reg ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.reg);
    } else {
      setInternalData((prev) => prev.filter((item) => item.reg !== toDelete.reg));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Vehicle register"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add vehicle
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Registration</Th>
              <Th>Category</Th>
              <Th>Home depot</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: FleetVehicleRecord) => (
              <tr key={item.reg} className="stc-row">
                <Td mono>{item.reg}</Td>
                <Td>{item.category}</Td>
                <Td mono>{item.depot}</Td>
                <Td>{item.status}</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <Td colSpan={5}>No records yet — use Add vehicle to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Vehicle`} onClose={() => setModal(null)}>
            <div className="stc-field">
              <label className="stc-field-label">Registration</label>
              <input
                disabled={modal.mode === "edit"}
                value={formData.reg || ""}
                onChange={(e) => setFormData((s) => ({ ...s, reg: e.target.value }))}
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Category</label>
              <input
                value={formData.category || ""}
                onChange={(e) => setFormData((s) => ({ ...s, category: e.target.value }))}
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Home depot</label>
              <select
                value={formData.depot || depotOptions[0] || ""}
                onChange={(e) => setFormData((s) => ({ ...s, depot: e.target.value }))}
              >
                {depotOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Status</label>
              <select
                value={formData.status || "Active"}
                onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Under maintenance">Under maintenance</option>
                <option value="Breakdown">Breakdown</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Next service</label>
              <input
                value={formData.nextService || ""}
                onChange={(e) => setFormData((s) => ({ ...s, nextService: e.target.value }))}
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Document expiry</label>
              <input
                value={formData.docExpiry || ""}
                onChange={(e) => setFormData((s) => ({ ...s, docExpiry: e.target.value }))}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Vehicle" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.reg} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default VehicleRegister;
