import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Stop {
  stopId: string;
  stopCode: string;
  stopName: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  stopOrder: number;
  isActive: boolean;
}
export interface StopPayload {
  stopId: string;
  stopCode: string;
  stopName: string;
  routeId: string;
  stopOrder: number;
  isActive: boolean;
}
export interface StopProps {
  data?: Stop[];
  routeOptions?: {routeId: string; routeCode: string; routeName: string}[];
  onAdd?: (item: StopPayload) => void;
  onUpdate?: (item: StopPayload) => void;
  onDelete?: (stopId: string) => void;
}

const initialDefaultStops: Stop[] = [
  { stopId: "STP-0142", stopCode: "STP-0142", stopName: "Lonavala Ghat", routeId: "MSRTC-9502", routeCode: "MSRTC-9502", routeName: "Pune – Mumbai Shivneri (Expressway)", stopOrder: 4, isActive: true },
  { stopId: "STP-0143", stopCode: "STP-0143", stopName: "Panvel Junction", routeId: "MSRTC-8801", routeCode: "MSRTC-8801", routeName: "Pune – Nashik ST Express", stopOrder: 6, isActive: true },
  { stopId: "STP-0144", stopCode: "STP-0144", stopName: "Prabhadevi", routeId: "BEST-AC-84", routeCode: "BEST-AC-84", routeName: "Colaba – Bandra (via Worli Sea Face)", stopOrder: 9, isActive: true },
  { stopId: "STP-0145", stopCode: "STP-0145", stopName: "Wakad Chowk", routeId: "PMPML-56", routeCode: "PMPML-56", routeName: "Pune – Nashik Local", stopOrder: 3, isActive: true },
];

export function Stop({ data: propData, routeOptions = [], onAdd, onUpdate, onDelete }: StopProps) {
  const [internalData, setInternalData] = useState<Stop[]>(initialDefaultStops);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Stop } | null>(null);
  const [toDelete, setToDelete] = useState<Stop | null>(null);
  const [formData, setFormData] = useState<Partial<Stop>>({});

  const handleOpenAdd = () => {
    setFormData({ stopId: "", stopCode: "", stopName: "", routeId: routeOptions[0]?.routeId || "", stopOrder: 0, isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Stop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.stopCode || !formData.stopName) return;

    const newRecord: StopPayload = {
      stopId: formData.stopId || "",
      stopCode: formData.stopCode || "",
      stopName: formData.stopName,
      routeId: formData.routeId || routeOptions[0]?.routeId || "",
      stopOrder: Number(formData.stopOrder) || 0,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
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
        setInternalData((prev) => prev.map((item: Stop) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.stopId);
    } else {
      setInternalData((prev) => prev.filter((item: Stop) => item.stopId !== toDelete.stopId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Stops"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add stop
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Stop code</Th>
              <Th>Name</Th>
              <Th>Route</Th>
              <Th align="center">Stop Order</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Stop) => (
              <tr key={item.stopId} className="stc-row">
                <Td mono><RouteChip>{item.stopCode}</RouteChip></Td>
                <Td>{item.stopName}</Td>
                <Td mono>{item.routeName}</Td>
                <Td align="center">{item.stopOrder}</Td>
                <Td>{item.isActive ? "Active" : "Inactive"}</Td>
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
                <Td colSpan={6}>No records yet — use Add stop to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Stops`}
            subtitle={modal.mode === "add" ? "Add a new stop" : "Update stop details"}
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
              {modal.mode == "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Stop code</label>
                  <input
                    disabled={modal.mode === "edit"}
                    value={formData.stopCode || ""}
                    onChange={(e) => setFormData((s) => ({ ...s, stopCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.stopName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, stopName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.routeId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeId: e.target.value }))}
                >
                  {routeOptions.map((opt) => (
                    <option key={opt.routeId} value={opt.routeId}>
                      {opt.routeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Stop Order</label>
                <input
                  type="number"
                  value={formData.stopOrder ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, stopOrder: Number(e.target.value) }))}
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
          <Modal title="Delete — Stops" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.stopCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Stop;
