import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface ParkingYard {
  code: string;
  name: string;
  depot: string;
  capacity: number;
  occupied: number;
}

export interface ParkingYardPageProps {
  data?: ParkingYard[];
  depotOptions?: string[];
  onAdd?: (item: ParkingYard) => void;
  onUpdate?: (code: string, item: ParkingYard) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultParkingYards: ParkingYard[] = [
  { code: "PY-PUN-01", name: "Swargate Overnight Yard", depot: "MSRTC-PUN-01", capacity: 110, occupied: 88 },
  { code: "PY-MUM-04", name: "Wadala Parking Yard", depot: "BEST-MUM-04", capacity: 85, occupied: 74 },
  { code: "PY-MUM-07", name: "Colaba Parking Yard", depot: "BEST-MUM-07", capacity: 52, occupied: 40 },
];

export function ParkingYards({ data: propData, depotOptions = [], onAdd, onUpdate, onDelete }: ParkingYardPageProps) {
  const [internalData, setInternalData] = useState<ParkingYard[]>(initialDefaultParkingYards);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: ParkingYard } | null>(null);
  const [toDelete, setToDelete] = useState<ParkingYard | null>(null);
  const [formData, setFormData] = useState<Partial<ParkingYard>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", depot: depotOptions[0] || "", capacity: 0, occupied: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ParkingYard) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: ParkingYard = {
      code: formData.code,
      name: formData.name,
      depot: formData.depot || depotOptions[0] || "",
      capacity: Number(formData.capacity) || 0,
      occupied: Number(formData.occupied) || 0,
    };

    if (modal?.mode === "add") {
      if (onAdd) onAdd(newRecord);
      else setInternalData((prev) => [...prev, newRecord]);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) onUpdate(modal.record.code, newRecord);
      else setInternalData((prev) => prev.map((item) => (item.code === modal.record!.code ? newRecord : item)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) onDelete(toDelete.code);
    else setInternalData((prev) => prev.filter((item) => item.code !== toDelete.code));
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Parking Yards"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add parking yard
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Yard code</Th>
              <Th>Name</Th>
              <Th>Depot connection</Th>
              <Th>Capacity</Th>
              <Th>Occupied</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((p: ParkingYard) => (
              <tr key={p.code} className="stc-row">
                <Td mono><RouteChip>{p.code}</RouteChip></Td>
                <Td>{p.name}</Td>
                <Td mono>{p.depot}</Td>
                <Td>{p.capacity}</Td>
                <Td>{p.occupied} ({p.capacity ? Math.round((p.occupied / p.capacity) * 100) : 0}%)</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(p)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(p)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={6}>No records yet — use Add parking yard to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Parking Yard`} onClose={() => setModal(null)}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Yard code</label>
              <input
                disabled={modal.mode === "edit"}
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.code || ""}
                onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Name</label>
              <input
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.name || ""}
                onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Depot connection</label>
              <select
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box", background: T.panel }}
                value={formData.depot || ""}
                onChange={(e) => setFormData((s) => ({ ...s, depot: e.target.value }))}
              >
                {depotOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Capacity</label>
              <input
                type="number"
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.capacity ?? 0}
                onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Occupied</label>
              <input
                type="number"
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.occupied ?? 0}
                onChange={(e) => setFormData((s) => ({ ...s, occupied: Number(e.target.value) }))}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={() => setModal(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.ink, color: "#F4F0E4", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Save
              </button>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Parking Yard" onClose={() => setToDelete(null)}>
            <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.5, margin: "0 0 18px" }}>
              This will permanently remove {toDelete.code} from the list. This can't be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setToDelete(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default ParkingYards;
