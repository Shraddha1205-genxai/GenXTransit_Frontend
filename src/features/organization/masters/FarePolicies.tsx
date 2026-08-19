import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface FarePolicy {
  code: string;
  model: string;
  base: number;
  rate: string;
  route: string;
  status: string;
}

export interface FarePoliciesProps {
  data?: FarePolicy[];
  routeOptions?: string[];
  onAdd?: (item: FarePolicy) => void;
  onUpdate?: (code: string, item: FarePolicy) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultFarePolicies: FarePolicy[] = [
  { code: "FP-FIX-01", model: "Fixed", base: 350, rate: "Flat (Shivneri)", route: "MSRTC-9502", status: "Published" },
  { code: "FP-DIST-02", model: "Distance", base: 20, rate: "₹1.45/km", route: "MSRTC-7714", status: "Published" },
  { code: "FP-ZONE-03", model: "Zone", base: 15, rate: "Zone matrix", route: "MSRTC-8801", status: "Simulated" },
];

const modelOptions = ["Fixed", "Distance", "Zone"];
const statusOptions = ["Published", "Simulated", "Draft"];

export function FarePolicies({ data: propData, routeOptions = [], onAdd, onUpdate, onDelete }: FarePoliciesProps) {
  const [internalData, setInternalData] = useState<FarePolicy[]>(initialDefaultFarePolicies);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: FarePolicy } | null>(null);
  const [toDelete, setToDelete] = useState<FarePolicy | null>(null);
  const [formData, setFormData] = useState<Partial<FarePolicy>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", model: modelOptions[0], base: 0, rate: "", route: routeOptions[0] || "", status: statusOptions[0] });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: FarePolicy) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code) return;

    const newRecord: FarePolicy = {
      code: formData.code,
      model: formData.model || modelOptions[0],
      base: Number(formData.base) || 0,
      rate: formData.rate || "",
      route: formData.route || routeOptions[0] || "",
      status: formData.status || statusOptions[0],
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.code, newRecord);
      } else {
        setInternalData((prev) => prev.map((item: FarePolicy) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item: FarePolicy) => item.code !== toDelete.code));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Fare policies"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add policy
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Policy</Th>
              <Th>Model</Th>
              <Th>Base / rate</Th>
              <Th>Route</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: FarePolicy) => (
              <tr key={item.code} className="stc-row">
                <Td mono><RouteChip>{item.code}</RouteChip></Td>
                <Td>{item.model}</Td>
                <Td>₹{item.base} · {item.rate}</Td>
                <Td mono>{item.route}</Td>
                <Td><StatusBadge status={item.status} /></Td>
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
                <Td colSpan={6}>No records yet — use Add policy to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Fare Policies`}
            subtitle={modal.mode === "add" ? "Create a new fare policy" : "Update fare policy"}
            onClose={() => setModal(null)}
            width={640}
            footer={
              <>
                <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
              </>
            }
          >
            <div className="stc-form-grid">
              <div className="stc-field">
                <label className="stc-field-label">Policy code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.code || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Model</label>
                <select
                  value={formData.model || modelOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, model: e.target.value }))}
                >
                  {modelOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Status</label>
                <select
                  value={formData.status || statusOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value }))}
                >
                  {statusOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Base fare (₹)</label>
                <input
                  type="number"
                  value={formData.base ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, base: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.route || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, route: e.target.value }))}
                >
                  {routeOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Rate description</label>
                <input
                  value={formData.rate || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, rate: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Fare Policies" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
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

export default FarePolicies;
