import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface ComplaintCategory {
  code: string;
  name: string;
  sla: string;
}

export interface ComplaintCategoriesProps {
  data?: ComplaintCategory[];
  onAdd?: (item: ComplaintCategory) => void;
  onUpdate?: (code: string, item: ComplaintCategory) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultComplaintCategories: ComplaintCategory[] = [
  { code: "CMP-001", name: "Driver behavior", sla: "4h" },
  { code: "CMP-002", name: "Vehicle cleanliness", sla: "8h" },
  { code: "CMP-003", name: "Ticketing issue", sla: "6h" },
];

export function ComplaintCategories({ data: propData, onAdd, onUpdate, onDelete }: ComplaintCategoriesProps) {
  const [internalData, setInternalData] = useState<ComplaintCategory[]>(initialDefaultComplaintCategories);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: ComplaintCategory } | null>(null);
  const [toDelete, setToDelete] = useState<ComplaintCategory | null>(null);
  const [formData, setFormData] = useState<Partial<ComplaintCategory>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", sla: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ComplaintCategory) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;

    const newRecord: ComplaintCategory = {
      code: formData.code,
      name: formData.name,
      sla: formData.sla || "",
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
        setInternalData((prev) => prev.map((item: ComplaintCategory) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item: ComplaintCategory) => item.code !== toDelete.code));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Complaint categories"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add category
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Category</Th>
              <Th>SLA</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: ComplaintCategory) => (
              <tr key={item.code} className="stc-row">
                <Td mono>{item.code}</Td>
                <Td>{item.name}</Td>
                <Td>{item.sla}</Td>
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
                <Td colSpan={4}>No records yet — use Add category to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Complaint Categories`}
            subtitle={modal.mode === "add" ? "Add a new category" : "Update category"}
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
                <label className="stc-field-label">Category</label>
                <input
                  value={formData.name || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">SLA</label>
                <input
                  value={formData.sla || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, sla: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Complaint Categories" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
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

export default ComplaintCategories;
