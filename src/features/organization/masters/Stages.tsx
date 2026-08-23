import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface Stage {
  stageId: string;
  stageCode: string;
  stageName: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  sectionFromId: string;
  sectionFromCode: string;
  sectionFromName: string;
  sectionToId: string;
  sectionToCode: string;
  sectionToName: string;
  distance: number;
  isActive: boolean;
}
export interface StagePayload {
  stageId: string;
  stageCode: string;
  stageName: string;
  routeId: string;
  sectionFromId: string;
  sectionToId: string;
  distance: number;
  isActive: boolean;
}
export interface StagesProps {
  data?: Stage[];
  routeOptions?: {routeId: string, routeCode: string, routeName: string}[];
  stopOptions?: {stopId: string, stopCode: string, stopName: string}[];
  onAdd?: (item: StagePayload) => void;
  onUpdate?: (item: StagePayload) => void;
  onDelete?: (stopId: string) => void;
}

const initialDefaultStages: Stage[] = [
  { stageId: "STG-001", stageCode: "STG-001", stageName: "Pune Section", routeId: "9502", routeCode: "MSRTC-9502", routeName: "MSRTC-9502", sectionFromId: "001", sectionFromCode: "SEC-001", sectionFromName: "Pune Section", sectionToId: "002", sectionToCode: "SEC-002", sectionToName: "Lonavala Section", distance: 40, isActive: true },
  { stageId: "STG-002", stageCode: "STG-002", stageName: "Lonavala Section", routeId: "9502", routeCode: "MSRTC-9502", routeName: "MSRTC-9502", sectionFromId: "002", sectionFromCode: "SEC-002", sectionFromName: "Lonavala Section", sectionToId: "003", sectionToCode: "SEC-003", sectionToName: "Colaba Section", distance: 82, isActive: true },
  { stageId: "STG-003", stageCode: "STG-003", stageName: "Colaba Section", routeId: "101", routeCode: "BEST-A-1", routeName: "BEST-A-1", sectionFromId: "003", sectionFromCode: "SEC-003", sectionFromName: "Colaba Section", sectionToId: "004", sectionToCode: "SEC-004", sectionToName: "Mumbai Section", distance: 6, isActive: true },
];

export function Stages({ data: propData, routeOptions = [], stopOptions = [], onAdd, onUpdate, onDelete }: StagesProps) {
  const [internalData, setInternalData] = useState<Stage[]>(initialDefaultStages);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Stage } | null>(null);
  const [toDelete, setToDelete] = useState<Stage | null>(null);
  const [formData, setFormData] = useState<Partial<Stage>>({});

  const handleOpenAdd = () => {
    setFormData({stageId: "", stageCode: "", routeId: routeOptions[0]?.routeId || "", stageName: "", sectionFromId: "", sectionToId: "", distance: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Stage) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.stageCode || !formData.stageName) return;

    const newRecord: StagePayload = {
      stageId: formData.stageCode,
      stageCode: formData.stageCode,
      stageName: formData.stageName,
      routeId: formData.routeId || "",
      sectionFromId: formData.sectionFromId || "",
      sectionToId: formData.sectionToId || "",
      distance: Number(formData.distance) || 0,
      isActive: true,
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(newRecord);
      } else {
        setInternalData((prev) => prev.map((item: Stage) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.stageId);
    } else {
      setInternalData((prev) => prev.filter((item: Stage) => item.stageId !== toDelete.stageId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Stage master"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add stage
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Stage code</Th>
              <Th>Route</Th>
              <Th>From Section</Th>
              <Th>To Section</Th>
              <Th align="right">Distance (km)</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Stage) => (
              <tr key={item.stageId} className="stc-row">
                <Td mono>{item.stageCode}</Td>
                <Td mono>{item.routeName}</Td>
                <Td mono>{item.sectionFromName}</Td>
                <Td mono>{item.sectionToName}</Td>
                <Td align="right">{item.distance}</Td>
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
                <Td colSpan={6}>No records yet — use Add stage to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Stages`}
            subtitle={modal.mode === "add" ? "Add a new stage" : "Update stage details"}
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
              {modal.mode === "edit" && (<div className="stc-field">
                <label className="stc-field-label">Stage code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.stageCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, stageCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Stage Name</label>
                <input
                  value={formData.stageName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, stageName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.routeId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeId: e.target.value }))}
                >
                  {routeOptions.map((opt) => <option key={opt.routeId} value={opt.routeName}>{opt.routeName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">From Section</label>
                <select
                  value={formData.sectionFromId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, sectionFromId: e.target.value }))}
                >
                  {stopOptions.map((opt) => <option key={opt.stopId} value={opt.stopId}>{opt.stopName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">To Section</label>
                <select
                  value={formData.sectionToId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, sectionToId: e.target.value }))}
                >
                  {stopOptions.map((opt) => <option key={opt.stopId} value={opt.stopId}>{opt.stopName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Distance (km)</label>
                <input
                  type="number"
                  value={formData.distance ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, distance: Number(e.target.value) }))}
                />
              </div>
              {modal.mode === "edit" && (
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
              )}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Stages" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.stageName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Stages;
