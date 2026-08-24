import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface TaxConfiguration {
  textId: string
  textCode: string;
  textType: string;
  rate: string;
  description?: string;
}

export interface TaxConfigurationProps {
  data?: TaxConfiguration[];
  onAdd?: (item: TaxConfiguration) => void;
  onUpdate?: (item: TaxConfiguration) => void;
  onDelete?: (textId: string) => void;
}

const initialDefaultTaxConfigurations: TaxConfiguration[] = [
  { textId: "TX-GST5", textCode: "TX-GST5", textType: "GST — Local city service", rate: "5%", description: "GST for local city service" },
  { textId: "TX-GST12", textCode: "TX-GST12", textType: "GST — AC / Luxury service", rate: "12%", description: "GST for AC / Luxury service" },
  { textId: "TX-CESS", textCode: "TX-CESS", textType: "State road cess", rate: "1%", description: "State road cess" },
];

export function TaxConfiguration({ data: propData, onAdd, onUpdate, onDelete }: TaxConfigurationProps) {
  const [internalData, setInternalData] = useState<TaxConfiguration[]>(initialDefaultTaxConfigurations);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: TaxConfiguration } | null>(null);
  const [toDelete, setToDelete] = useState<TaxConfiguration | null>(null);
  const [formData, setFormData] = useState<Partial<TaxConfiguration>>({});

  const handleOpenAdd = () => {
    setFormData({ textId: "", textCode: "", textType: "", rate: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: TaxConfiguration) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.textId || !formData.textType) return;

    const newRecord: TaxConfiguration = {
      textId: formData.textId || "",
      textCode: formData.textCode || "",
      textType: formData.textType || "",
      rate: formData.rate || "",
      description: formData.description || "",
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(newRecord);
      } else {
        setInternalData((prev) => prev.map((item: TaxConfiguration) => (item.textId === modal.record!.textId ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.textId);
    } else {
      setInternalData((prev) => prev.filter((item: TaxConfiguration) => item.textId !== toDelete.textId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Tax configuration"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add tax
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th align="right">Rate</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: TaxConfiguration) => (
              <tr key={item.textId} className="stc-row">
                <Td mono>{item.textCode}</Td>
                <Td>{item.textType}</Td>
                <Td align="right">{item.rate}</Td>
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
                <Td colSpan={4}>No records yet — use Add tax to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Tax Configuration`}
            subtitle={modal.mode === "add" ? "Add a new tax rule" : "Update tax rule"}
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
                <label className="stc-field-label">Code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.textCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, textCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Type</label>
                <input
                  value={formData.textType || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, textType: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Rate</label>
                <input
                  value={formData.rate || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, rate: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Tax Configuration" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.textCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default TaxConfiguration;
