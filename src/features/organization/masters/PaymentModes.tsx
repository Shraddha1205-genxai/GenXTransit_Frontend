import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface PaymentMode {
  modeId: string;
  modeCode: string;
  modeName: string;
  modeStatus: string;
  description: string;
  isActive: boolean;
}

export interface PaymentModesProps {
  data?: PaymentMode[];
  onAdd?: (item: PaymentMode) => void;
  onUpdate?: (code: string, item: PaymentMode) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultPaymentModes: PaymentMode[] = [
  { modeId: "PM-CASH", modeCode: "PM-CASH", modeName: "Cash", modeStatus: "", description: "", isActive: true },
  { modeId: "PM-CARD", modeCode: "PM-CARD", modeName: "Debit / credit card", modeStatus: "", description: "", isActive: true },
  { modeId: "PM-NETBANK", modeCode: "PM-NETBANK", modeName: "Net banking", modeStatus: "", description: "", isActive: false },
];

export function PaymentModes({ data: propData, onAdd, onUpdate, onDelete }: PaymentModesProps) {
  const [internalData, setInternalData] = useState<PaymentMode[]>(initialDefaultPaymentModes);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: PaymentMode } | null>(null);
  const [toDelete, setToDelete] = useState<PaymentMode | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMode>>({});

  const handleOpenAdd = () => {
    setFormData({ modeId: "", modeCode: "", modeName: "", modeStatus:"", description: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: PaymentMode) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.modeCode || !formData.modeName) return;

    const newRecord: PaymentMode = {
      modeId: formData.modeId || "",
      modeCode: formData.modeCode || "",
      modeName: formData.modeName || "",
      modeStatus: formData.modeStatus || "",
      description: formData.description || "",
      isActive: formData.isActive || true,
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.modeCode, newRecord);
      } else {
        setInternalData((prev) => prev.map((item: PaymentMode) => (item.modeCode === modal.record!.modeCode ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.modeCode);
    } else {
      setInternalData((prev) => prev.filter((item: PaymentMode) => item.modeCode !== toDelete.modeCode));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Payment modes"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add mode
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: PaymentMode) => (
              <tr key={item.modeCode} className="stc-row">
                <Td mono>{item.modeCode}</Td>
                <Td>{item.modeName}</Td>
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
                <Td colSpan={4}>No records yet — use Add mode to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Payment Modes`}
            subtitle={modal.mode === "add" ? "Add a new payment mode" : "Update payment mode"}
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
              {modal.mode == "edit" && (<div className="stc-field">
                <label className="stc-field-label">Code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.modeCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, modeCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.modeName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, modeName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                  <label className="stc-field-label">Mode Status</label>
                  <select
                    value={formData.modeStatus ? "Active" : "Inactive"}
                    onChange={(e) => setFormData((s) => ({ ...s, modeStatus: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="stc-field">
                <label className="stc-field-label">Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
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
          <Modal title="Delete — Payment Modes" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.modeCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default PaymentModes;
