import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface PaymentMode {
  code: string;
  name: string;
  status: string;
}

export interface PaymentModesProps {
  data?: PaymentMode[];
  onAdd?: (item: PaymentMode) => void;
  onUpdate?: (code: string, item: PaymentMode) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultPaymentModes: PaymentMode[] = [
  { code: "PM-CASH", name: "Cash", status: "Active" },
  { code: "PM-CARD", name: "Debit / credit card", status: "Active" },
  { code: "PM-NETBANK", name: "Net banking", status: "Disabled" },
];

export function PaymentModes({ data: propData, onAdd, onUpdate, onDelete }: PaymentModesProps) {
  const [internalData, setInternalData] = useState<PaymentMode[]>(initialDefaultPaymentModes);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: PaymentMode } | null>(null);
  const [toDelete, setToDelete] = useState<PaymentMode | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMode>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", status: "Active" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: PaymentMode) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;

    const newRecord: PaymentMode = {
      code: formData.code,
      name: formData.name,
      status: formData.status || "Active",
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
        setInternalData((prev) => prev.map((item: PaymentMode) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item: PaymentMode) => item.code !== toDelete.code));
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
              <tr key={item.code} className="stc-row">
                <Td mono>{item.code}</Td>
                <Td>{item.name}</Td>
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
              <div className="stc-field">
                <label className="stc-field-label">Code</label>
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
                <label className="stc-field-label">Status</label>
                <select
                  value={formData.status || "Active"}
                  onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
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
              This will permanently remove {toDelete.code} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default PaymentModes;
