import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface BusStation {
  code: string;
  name: string;
  depot: string;
  platforms: number;
  footfall: string;
}

export interface BusStationPageProps {
  data?: BusStation[];
  depotOptions?: string[];
  onAdd?: (item: BusStation) => void;
  onUpdate?: (code: string, item: BusStation) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultBusStations: BusStation[] = [
  { code: "BS-PUN-SWG", name: "Swargate Bus Station", depot: "MSRTC-PUN-01", platforms: 14, footfall: "38,000/day" },
  { code: "BS-MUM-CST", name: "Mumbai Central Bus Terminus", depot: "MSRTC-MUM-03", platforms: 10, footfall: "22,500/day" },
  { code: "BS-MUM-COL", name: "Colaba Bus Depot Stand", depot: "BEST-MUM-07", platforms: 6, footfall: "9,200/day" },
];

export function BusStation({ data: propData, depotOptions = [], onAdd, onUpdate, onDelete }: BusStationPageProps) {
  const [internalData, setInternalData] = useState<BusStation[]>(initialDefaultBusStations);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: BusStation } | null>(null);
  const [toDelete, setToDelete] = useState<BusStation | null>(null);
  const [formData, setFormData] = useState<Partial<BusStation>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", depot: depotOptions[0] || "", platforms: 0, footfall: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: BusStation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: BusStation = {
      code: formData.code,
      name: formData.name,
      depot: formData.depot || depotOptions[0] || "",
      platforms: Number(formData.platforms) || 0,
      footfall: formData.footfall || "",
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
        title="Bus Stations"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add bus station
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Station code</Th>
              <Th>Name</Th>
              <Th>Homed depot</Th>
              <Th>Platforms</Th>
              <Th>Daily footfall</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((b: BusStation) => (
              <tr key={b.code} className="stc-row">
                <Td mono><RouteChip>{b.code}</RouteChip></Td>
                <Td>{b.name}</Td>
                <Td mono>{b.depot}</Td>
                <Td>{b.platforms}</Td>
                <Td>{b.footfall}</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(b)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(b)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={6}>No records yet — use Add bus station to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Bus Station`} onClose={() => setModal(null)}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Station code</label>
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
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Homed depot</label>
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
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Platforms</label>
              <input
                type="number"
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.platforms ?? 0}
                onChange={(e) => setFormData((s) => ({ ...s, platforms: Number(e.target.value) }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Daily footfall</label>
              <input
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.footfall || ""}
                onChange={(e) => setFormData((s) => ({ ...s, footfall: e.target.value }))}
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
          <Modal title="Delete — Bus Station" onClose={() => setToDelete(null)}>
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

export default BusStation;
