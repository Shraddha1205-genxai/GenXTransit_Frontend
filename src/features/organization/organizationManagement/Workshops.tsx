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
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Workshop`}
            subtitle={modal.mode === "add" ? "Add a new workshop" : "Update workshop details"}
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
                <label className="stc-field-label">Workshop code</label>
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
                <label className="stc-field-label">Work bays</label>
                <input
                  type="number"
                  value={formData.bays ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, bays: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Active repair jobs</label>
                <input
                  type="number"
                  value={formData.activeJobs ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, activeJobs: Number(e.target.value) }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Workshop" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
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

export default Workshops;
