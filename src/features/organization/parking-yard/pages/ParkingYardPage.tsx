import React, { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const T = {
  ink: "#101B26",
  panel: "#FFFFFF",
  canvas: "#EFEEE6",
  border: "#DEDBCF",
  text: "#16212B",
  textSoft: "#5B6672",
  textFaint: "#8B9098",
  amber: "#E5A339",
  amberDeep: "#8A5A14",
  amberFill: "#FBEBD1",
  red: "#C6453B",
};

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

function RouteChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="stc-mono" style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", background: T.amberFill, color: T.amberDeep, fontSize: 12, fontWeight: 600, borderRadius: 3, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
          <h3 className="stc-display" style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
          {action}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return <th style={{ textAlign: align || "left", fontSize: 11, fontWeight: 600, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.04em", padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>{children}</th>;
}

function Td({ children, align, mono }: { children: React.ReactNode; align?: "left" | "right" | "center"; mono?: boolean }) {
  return <td className={mono ? "stc-mono" : ""} style={{ textAlign: align || "left", fontSize: 13, color: T.text, padding: "10px", borderBottom: `1px solid ${T.border}` }}>{children}</td>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(16,27,38,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, borderRadius: 8, width: 460, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(16,27,38,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.panel }}>
          <h3 className="stc-display" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={17} color={T.textSoft} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

export function ParkingYardPage({ data: propData, depotOptions = [], onAdd, onUpdate, onDelete }: ParkingYardPageProps) {
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
      <Card title="Parking yards" action={<button onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}><Plus size={13} /> Add yard</button>}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Yard</Th>
              <Th>Name</Th>
              <Th>Linked depot</Th>
              <Th>Capacity</Th>
              <Th align="right">Occupied</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.code} className="stc-row">
                <Td mono><RouteChip>{item.code}</RouteChip></Td>
                <Td>{item.name}</Td>
                <Td mono>{item.depot}</Td>
                <Td>{item.capacity}</Td>
                <Td align="right">
                  <span style={{ color: item.occupied / item.capacity > 0.85 ? T.amberDeep : T.text, fontWeight: 600 }}>
                    {item.occupied} ({Math.round((item.occupied / item.capacity) * 100)}%)
                  </span>
                </Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><Pencil size={14} color={T.textSoft} /></button>
                    <button onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><Trash2 size={14} color={T.red} /></button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && <tr><Td colSpan={6}>No records yet — use Add yard to create one.</Td></tr>}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Parking Yard`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Yard code</label>
            <input disabled={modal.mode === "edit"} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.code || ""} onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Name</label>
            <input style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.name || ""} onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Linked depot</label>
            <select style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box", background: T.panel }} value={formData.depot || depotOptions[0] || ""} onChange={(e) => setFormData((s) => ({ ...s, depot: e.target.value }))}>
              {depotOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Capacity</label>
            <input type="number" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.capacity ?? 0} onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Occupied</label>
            <input type="number" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.occupied ?? 0} onChange={(e) => setFormData((s) => ({ ...s, occupied: Number(e.target.value) }))} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={() => setModal(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.ink, color: "#F4F0E4", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete — Parking Yard" onClose={() => setToDelete(null)}>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.5, margin: "0 0 18px" }}>This will permanently remove {toDelete.code} from the list. This can't be undone.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setToDelete(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleConfirmDelete} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ParkingYardPage;
