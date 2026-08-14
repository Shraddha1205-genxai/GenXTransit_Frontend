import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Workshop {
  code: string;
  name: string;
  depot: string;
  bays: number;
  activeJobs: number;
}

export interface WorkshopPageProps {
  data?: Workshop[];
  depotOptions?: string[];
  onAdd?: (item: Workshop) => void;
  onUpdate?: (code: string, item: Workshop) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultWorkshops: Workshop[] = [
  { code: "WS-PUN-01", name: "Swargate Central Workshop", depot: "MSRTC-PUN-01", bays: 12, activeJobs: 7 },
  { code: "WS-MUM-04", name: "Wadala Repair Workshop", depot: "BEST-MUM-04", bays: 8, activeJobs: 5 },
  { code: "WS-PUN-02", name: "PMPML Swargate Workshop", depot: "PMPML-PUN-02", bays: 6, activeJobs: 2 },
];

export function Workshops({ data: propData, depotOptions = [], onAdd, onUpdate, onDelete }: WorkshopPageProps) {
  const [internalData, setInternalData] = useState<Workshop[]>(initialDefaultWorkshops);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Workshop } | null>(null);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<Partial<Workshop>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", depot: depotOptions[0] || "", bays: 0, activeJobs: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Workshop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: Workshop = {
      code: formData.code,
      name: formData.name,
      depot: formData.depot || depotOptions[0] || "",
      bays: Number(formData.bays) || 0,
      activeJobs: Number(formData.activeJobs) || 0,
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
        title="Workshops"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add workshop
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Workshop code</Th>
              <Th>Name</Th>
              <Th>Depot connection</Th>
              <Th>Work bays</Th>
              <Th>Active repair jobs</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((w: Workshop) => (
              <tr key={w.code} className="stc-row">
                <Td mono><RouteChip>{w.code}</RouteChip></Td>
                <Td>{w.name}</Td>
                <Td mono>{w.depot}</Td>
                <Td>{w.bays}</Td>
                <Td>{w.activeJobs}</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(w)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(w)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={6}>No records yet — use Add workshop to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Workshop`} onClose={() => setModal(null)}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Workshop code</label>
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
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Work bays</label>
              <input
                type="number"
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.bays ?? 0}
                onChange={(e) => setFormData((s) => ({ ...s, bays: Number(e.target.value) }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Active repair jobs</label>
              <input
                type="number"
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.activeJobs ?? 0}
                onChange={(e) => setFormData((s) => ({ ...s, activeJobs: Number(e.target.value) }))}
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
          <Modal title="Delete — Workshop" onClose={() => setToDelete(null)}>
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

export default Workshops;
