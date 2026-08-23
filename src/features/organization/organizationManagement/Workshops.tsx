import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface Workshop {
  code: string;
  name: string;
  regionCode: string;
  divisionCode: string;
  depotCode: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}

export interface WorkshopPageProps {
  data?: Workshop[];
  regionOptions?: string[];
  divisionOptions?: string[];
  depotOptions?: string[];
  onAdd?: (item: Workshop) => void;
  onUpdate?: (code: string, item: Workshop) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultWorkshops: Workshop[] = [
  { code: "WS-0001", name: "Swargate Central Workshop", regionCode: "REG-0001", divisionCode: "DIV-0001", depotCode: "MSRTC-PUN-01", workBays: 12, activeRepairJobs: 7, isActive: true },
  { code: "WS-0002", name: "Wadala Repair Workshop", regionCode: "REG-0002", divisionCode: "DIV-0003", depotCode: "BEST-MUM-04", workBays: 8, activeRepairJobs: 5, isActive: true },
  { code: "WS-0003", name: "PMPML Swargate Workshop", regionCode: "REG-0001", divisionCode: "DIV-0001", depotCode: "PMPML-PUN-02", workBays: 6, activeRepairJobs: 2, isActive: true },
];

const generateWorkshopCode = (existing: Workshop[]) => {
  const numbers = existing
    .map((item) => Number((item.code.match(/(\d+)$/) ?? ["0", "0"])[1]))
    .filter((n) => Number.isFinite(n));
  const next = (Math.max(0, ...numbers) + 1).toString().padStart(4, "0");
  return `WS-${next}`;
};

export function Workshops({ data: propData, regionOptions = [], divisionOptions = [], depotOptions = [], onAdd, onUpdate, onDelete }: WorkshopPageProps) {
  const [internalData, setInternalData] = useState<Workshop[]>(initialDefaultWorkshops);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Workshop } | null>(null);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<Partial<Workshop>>({});

  const handleOpenAdd = () => {
    setFormData({ code: generateWorkshopCode(data), name: "", regionCode: regionOptions[0] || "", divisionCode: divisionOptions[0] || "", depotCode: depotOptions[0] || "", workBays: 0, activeRepairJobs: 0, isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Workshop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.name) return;
    const newRecord: Workshop = {
      code: modal?.mode === "edit" && modal.record ? modal.record.code : generateWorkshopCode(data),
      name: formData.name,
      regionCode: formData.regionCode || regionOptions[0] || "",
      divisionCode: formData.divisionCode || divisionOptions[0] || "",
      depotCode: formData.depotCode || depotOptions[0] || "",
      workBays: Number(formData.workBays) || 0,
      activeRepairJobs: Number(formData.activeRepairJobs) || 0,
      isActive: modal?.mode === "edit" ? (formData.isActive ?? true) : true,
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
              <Th>WorkShop Code</Th>
              <Th>WorkShop Name</Th>
              <Th>Region Code</Th>
              <Th>Division Code</Th>
              <Th>Depot Code</Th>
              <Th>Work Bays</Th>
              <Th>Active Repair Jobs</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((w: Workshop) => (
              <tr key={w.code} className="stc-row">
                <Td mono><RouteChip>{w.code}</RouteChip></Td>
                <Td>{w.name}</Td>
                <Td mono>{w.regionCode}</Td>
                <Td mono>{w.divisionCode}</Td>
                <Td mono>{w.depotCode}</Td>
                <Td>{w.workBays}</Td>
                <Td>{w.activeRepairJobs}</Td>
                <Td><StatusBadge status={w.isActive ? "Active" : "Inactive"} /></Td>
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
              <tr><Td colSpan={9}>No records yet — use Add workshop to create one.</Td></tr>
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
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">WorkShop Code</label>
                  <input value={formData.code || ""} readOnly />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">WorkShop Name</label>
                <input
                  value={formData.name || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Region Code</label>
                <select value={formData.regionCode || ""} onChange={(e) => setFormData((s) => ({ ...s, regionCode: e.target.value }))}>
                  {regionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Division Code</label>
                <select value={formData.divisionCode || ""} onChange={(e) => setFormData((s) => ({ ...s, divisionCode: e.target.value }))}>
                  {divisionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depot Code</label>
                <select value={formData.depotCode || ""} onChange={(e) => setFormData((s) => ({ ...s, depotCode: e.target.value }))}>
                  {depotOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Work Bays</label>
                <input
                  type="number"
                  value={formData.workBays ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, workBays: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Active Repair Jobs</label>
                <input
                  type="number"
                  value={formData.activeRepairJobs ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, activeRepairJobs: Number(e.target.value) }))}
                />
              </div>
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select value={formData.isActive ? "Active" : "Inactive"} onChange={(e) => setFormData((s) => ({ ...s, isActive: e.target.value === "Active" }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
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
