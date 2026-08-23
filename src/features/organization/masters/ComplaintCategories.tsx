import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface ComplaintCategory {
  complaintId: string;
  complaintCode: string;
  complaintTitle: string;
  complaintCategory: string;
  sla: string;
  description?: string;
  isActive: boolean;
}

export interface ComplaintCategoriesProps {
  data?: ComplaintCategory[];
  onAdd?: (item: ComplaintCategory) => void;
  onUpdate?: (item: ComplaintCategory) => void;
  onDelete?: (complaintId: string) => void;
}

const initialDefaultComplaintCategories: ComplaintCategory[] = [
  { complaintId: "001", complaintCode: "CMP-001", complaintTitle: "Driver behavior", complaintCategory: "Behavioral", sla: "4h", isActive: true },
  { complaintId: "002", complaintCode: "CMP-002", complaintTitle: "Vehicle cleanliness", complaintCategory: "Cleanliness", sla: "8h", isActive: true },
  { complaintId: "003", complaintCode: "CMP-003", complaintTitle: "Ticketing issue", complaintCategory: "Fare Management", sla: "6h", isActive: true },
];

export function ComplaintCategories({ data: propData, onAdd, onUpdate, onDelete }: ComplaintCategoriesProps) {
  const [internalData, setInternalData] = useState<ComplaintCategory[]>(initialDefaultComplaintCategories);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: ComplaintCategory } | null>(null);
  const [toDelete, setToDelete] = useState<ComplaintCategory | null>(null);
  const [formData, setFormData] = useState<Partial<ComplaintCategory>>({});

  const handleOpenAdd = () => {
    setFormData({ complaintId: "", complaintCode: "", complaintTitle: "", sla: "", description: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ComplaintCategory) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.complaintCode || !formData.complaintTitle) return;

    const newRecord: ComplaintCategory = {
      complaintId: formData.complaintId || "",
      complaintCode: formData.complaintCode || "",
      complaintTitle: formData.complaintTitle || "",
      sla: formData.sla || "",
      complaintCategory: formData.complaintCategory || "",
      description: formData.description || "",
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
        setInternalData((prev) => prev.map((item: ComplaintCategory) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.complaintId);
    } else {
      setInternalData((prev) => prev.filter((item: ComplaintCategory) => item.complaintId !== toDelete.complaintId));
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
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>SLA</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: ComplaintCategory) => (
              <tr key={item.complaintId} className="stc-row">
                <Td mono>{item.complaintCode}</Td>
                <Td>{item.complaintTitle}</Td>
                <Td>{item.complaintCategory}</Td>
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
                <Td colSpan={5}>No records yet — use Add category to create one.</Td>
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
              {modal.mode === "edit" && (<div className="stc-field">
                <label className="stc-field-label">Code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.complaintCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, complaintCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Category</label>
                <input
                  value={formData.complaintCategory || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, complaintCategory: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Title</label>
                <input
                  value={formData.complaintTitle || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, complaintTitle: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">SLA</label>
                <input
                  value={formData.sla || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, sla: e.target.value }))}
                />
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
          <Modal title="Delete — Complaint Categories" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.complaintCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default ComplaintCategories;
