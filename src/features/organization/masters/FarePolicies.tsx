import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface FarePolicy {
  policyId: string;
  policyCode: string;
  model: string;
  policyStatus: string;
  categoryId: string;
  categoryCode: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  baseFare: number;
  rateDescription: string;
  isActive: boolean;
}
export interface FarePolicyPayload {
  policyId: string;
  policyCode: string;
  model: string;
  policyStatus: string;
  categoryId: string;
  routeId: string;
  baseFare: number;
  rateDescription: string;
  isActive: boolean;
}
export interface FarePoliciesProps {
  data?: FarePolicy[];
  routeOptions?: { routeId: string; routeCode: string; routeName: string }[];
  categoryOptions?: { categoryId: string; categoryCode: string; }[];
  onAdd?: (item: FarePolicyPayload) => void;
  onUpdate?: (item: FarePolicyPayload) => void;
  onDelete?: (policyCode: string) => void;
}

const initialDefaultFarePolicies: FarePolicy[] = [
  { policyId: "01", policyCode: "FP-FIX-01", model: "Fixed", categoryId:"01", categoryCode: "CAT-FIX-01", baseFare: 350, rateDescription: "Flat (Shivneri)", routeId: "MSRTC-9502", routeCode: "MSRTC-9502", routeName: "Pune – Mumbai Shivneri (Expressway)",policyStatus: "Published", isActive: true },
  { policyId: "02", policyCode: "FP-DIST-02", model: "Distance", categoryId:"02", categoryCode: "CAT-DIST-02", baseFare: 20, rateDescription: "₹1.45/km", routeId: "MSRTC-7714", routeCode: "MSRTC-7714", routeName: "Pune – Nashik ST Express", policyStatus: "Simulated", isActive: true },
  { policyId: "03", policyCode: "FP-ZONE-03", model: "Zone", categoryId:"03", categoryCode: "CAT-ZONE-03", baseFare: 15, rateDescription: "Zone matrix", routeId: "MSRTC-8801", routeCode: "MSRTC-8801", routeName: "Pune – Nashik Local", policyStatus: "Draft", isActive: false },
];

const modelOptions = ["Fixed", "Distance", "Zone"];
const statusOptions = ["Published", "Simulated", "Draft"];

export function FarePolicies({ data: propData, routeOptions = [], categoryOptions = [], onAdd, onUpdate, onDelete }: FarePoliciesProps) {
  const [internalData, setInternalData] = useState<FarePolicy[]>(initialDefaultFarePolicies);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: FarePolicy } | null>(null);
  const [toDelete, setToDelete] = useState<FarePolicy | null>(null);
  const [formData, setFormData] = useState<Partial<FarePolicy>>({});

  const handleOpenAdd = () => {
    setFormData({ policyId: "", policyCode: "", model: modelOptions[0], baseFare: 0, rateDescription: "", routeId: routeOptions[0]?.routeId || "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: FarePolicy) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.policyCode) return;

    const newRecord: FarePolicyPayload = {
      policyId: formData.policyId || "",
      policyCode: formData.policyCode,
      model: formData.model || modelOptions[0],
      policyStatus: formData.policyStatus || "Draft",
      categoryId: formData.categoryId || "",
      baseFare: Number(formData.baseFare) || 0,
      rateDescription: formData.rateDescription || "",
      routeId: formData.routeId || routeOptions[0]?.routeId || "",
      isActive: formData.isActive ?? true,
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
        setInternalData((prev) => prev.map((item: FarePolicy) => (item)));
      }
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.policyId);
    } else {
      setInternalData((prev) => prev.filter((item: FarePolicy) => item.policyId !== toDelete.policyId));
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
              <Th>Base</Th>
              <Th>Category</Th>
              <Th>Route</Th>
              <Th>Policy Status</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: FarePolicy) => (
              <tr key={item.policyCode} className="stc-row">
                <Td mono><RouteChip>{item.policyCode}</RouteChip></Td>
                <Td>{item.model}</Td>
                <Td>₹{item.baseFare}</Td>
                <Td mono>{item.categoryCode}</Td>
                <Td mono>{item.routeName}</Td>
                <Td>{item.policyStatus}</Td>
                <Td><StatusBadge status={item.isActive ? "Active" : "Inactive"} /></Td>
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
              {modal.mode == "edit" && (<div className="stc-field">
                <label className="stc-field-label">Policy policyCode</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.policyCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, policyCode: e.target.value }))}
                />
              </div>)}
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
                <label className="stc-field-label">Category</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryId: e.target.value }))}
                >
                  {categoryOptions.map((opt: any) => <option key={opt.categoryId} value={opt.categoryId}>{opt.categoryName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Status</label>
                <select
                  value={formData.policyStatus || statusOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, policyStatus: e.target.value }))}
                >
                  {statusOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Base fare (₹)</label>
                <input
                  type="number"
                  value={formData.baseFare ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, baseFare: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.routeId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeId: e.target.value }))}
                >
                  {routeOptions.map((opt: any) => <option key={opt.routeId} value={opt.routeId}>{opt.routeName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Rate description</label>
                <input
                  value={formData.rateDescription || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, rateDescription: e.target.value }))}
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
          <Modal title="Delete — Fare Policies" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.policyCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default FarePolicies;
