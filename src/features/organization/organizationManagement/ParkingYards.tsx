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
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Parking Yard`}
            subtitle={modal.mode === "add" ? "Add a new parking yard" : "Update yard details"}
            onClose={() => setModal(null)}
            width={520}
            footer={
              <>
                <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
              </>
            }
          >
            <div className="stc-form-grid">
              <div className="stc-field">
                <label className="stc-field-label">Yard code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.code || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.name || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depot connection</label>
                <select
                  value={formData.depot || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, depot: e.target.value }))}
                >
                  {depotOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Occupied</label>
                <input
                  type="number"
                  value={formData.occupied ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, occupied: Number(e.target.value) }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Parking Yard" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.code} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default ParkingYards;
