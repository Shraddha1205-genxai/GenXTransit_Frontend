import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface Workshop {
  workShopId: string;
  workShopCode: string;
  workShopName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}
export interface WorkshopPayload {
  workShopId: string;
  workShopCode: string;
  workShopName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}
export interface WorkshopPageProps {
  data?: Workshop[];
  regionOptions?: {regionId: string, regionName: string, regionCode: string}[];
  divisionOptions?: {divisionId: string, divisionName: string, divisionCode: string}[];
  depotOptions?: {depotId: string, depotName: string, depotCode: string}[];
  onAdd?: (item: WorkshopPayload) => void;
  onUpdate?: (item: WorkshopPayload) => void;
  onDelete?: (workShopId: string) => void;
}

const initialDefaultWorkshops: Workshop[] = [
  { workShopId: "WS-0001", workShopCode: "WS-0001", workShopName: "Swargate Central Workshop", regionId: "REG-0001", regionCode: "REG-0001", regionName: "Region 1", divisionId: "DIV-0001", divisionCode: "DIV-0001", divisionName: "Division 1", depotId: "MSRTC-PUN-01", depotCode: "MSRTC-PUN-01", depotName: "Depot 1", workBays: 12, activeRepairJobs: 7, isActive: true },
  { workShopId: "WS-0002", workShopCode: "WS-0002", workShopName: "Wadala Repair Workshop", regionId: "REG-0002", regionCode: "REG-0002", regionName: "Region 2", divisionId: "DIV-0003", divisionCode: "DIV-0003", divisionName: "Division 3", depotId: "BEST-MUM-04", depotCode: "BEST-MUM-04", depotName: "Depot 4", workBays: 8, activeRepairJobs: 5, isActive: true },
  { workShopId: "WS-0003", workShopCode: "WS-0003", workShopName: "PMPML Swargate Workshop", regionId: "REG-0001", regionCode: "REG-0001", regionName: "Region 1", divisionId: "DIV-₀₀₀₁", divisionCode: "DIV-₀₀₀₁", divisionName: "Division 1", depotId: "PMPML-PUN-₀₂", depotCode: "PMPML-PUN-₀₂", depotName: "Depot 2", workBays: 6, activeRepairJobs: 2, isActive: true },
];

export function Workshops({ data: propData, regionOptions = [], divisionOptions = [], depotOptions = [], onAdd, onUpdate, onDelete }: WorkshopPageProps) {
  const [internalData, setInternalData] = useState<Workshop[]>(initialDefaultWorkshops);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Workshop } | null>(null);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<Partial<Workshop>>({});

  const handleOpenAdd = () => {
    setFormData({ workShopName: "", regionId: regionOptions[0]?.regionId || "", divisionId: divisionOptions[0]?.divisionId || "", depotId: depotOptions[0]?.depotId || "", workBays: 0, activeRepairJobs: 0, isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Workshop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.workShopName) return;
    const newRecord: WorkshopPayload = {
      workShopId: modal?.mode === "edit" && modal.record ? modal.record.workShopId : "",
      workShopCode: modal?.mode === "edit" && modal.record ? modal.record.workShopCode : "",
      workShopName: formData.workShopName.trim(),
      regionId: formData.regionId || regionOptions[0]?.regionId || "",
      divisionId: formData.divisionId || divisionOptions[0]?.divisionId || "",
      depotId: formData.depotId || depotOptions[0]?.depotId || "",
      workBays: Number(formData.workBays) || 0,
      activeRepairJobs: Number(formData.activeRepairJobs) || 0,
      isActive: modal?.mode === "edit" ? (formData.isActive ?? true) : true,
    };

    if (modal?.mode === "add") {
      if (onAdd) onAdd(newRecord);
      else setInternalData((prev) => [...prev]);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) onUpdate(newRecord);
      else setInternalData((prev) => prev.map((item) => (item)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) onDelete(toDelete.workShopId);
    else setInternalData((prev) => prev.filter((item) => item.workShopId !== toDelete.workShopId));
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
              <tr key={w.workShopCode} className="stc-row">
                <Td mono><RouteChip>{w.workShopCode}</RouteChip></Td>
                <Td>{w.workShopName}</Td>
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
                  <input value={formData.workShopCode || ""} readOnly />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">WorkShop Name</label>
                <input
                  value={formData.workShopName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, workShopName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Region Code</label>
                <select value={formData.regionCode || ""} onChange={(e) => setFormData((s) => ({ ...s, regionCode: e.target.value }))}>
                  {regionOptions.map((opt) => <option key={opt.regionId} value={opt.regionId}>{opt.regionName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Division Code</label>
                <select value={formData.divisionCode || ""} onChange={(e) => setFormData((s) => ({ ...s, divisionCode: e.target.value }))}>
                  {divisionOptions.map((opt) => <option key={opt.divisionId} value={opt.divisionId}>{opt.divisionName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depot Code</label>
                <select value={formData.depotCode || ""} onChange={(e) => setFormData((s) => ({ ...s, depotCode: e.target.value }))}>
                  {depotOptions.map((opt) => <option key={opt.depotId} value={opt.depotId}>{opt.depotName}</option>)}
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
              This will permanently remove {toDelete.workShopName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Workshops;
