import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface SeatLayout {
  layoutId: string;
  layoutCode: string;
  categoryCode: string;
  categoryId: string;
  description?: string;
  isActive: boolean
}
export interface SeatLayoutPayload {
  layoutId: string;
  layoutCode: string;
  categoryId: string;
  description?: string;
  isActive: boolean;
}
export interface SeatLayoutsProps {
  data?: SeatLayout[];
  categoryOptions?: {categoryId: string; categoryCode: string}[];
  onAdd?: (item: SeatLayoutPayload) => void;
  onUpdate?: (item: SeatLayoutPayload) => void;
  onDelete?: (layoutId: string) => void;
}

const initialDefaultSeatLayouts: SeatLayout[] = [
  { layoutId: "SL-01", layoutCode: "SL-01", description: "2+2 Front Facing", categoryCode: "VC-STD", categoryId: "VC-STD", isActive: true },
  { layoutId: "SL-02", layoutCode: "SL-02", description: "3+2 Recliner", categoryCode: "VC-LUX", categoryId: "VC-LUX", isActive: true },
  { layoutId: "SL-03", layoutCode: "SL-03", description: "City Bus Single Row", categoryCode: "VC-CITY", categoryId: "VC-CITY", isActive: true },
];

export function SeatLayouts({ data: propData, categoryOptions = [], onAdd, onUpdate, onDelete }: SeatLayoutsProps) {
  const [internalData, setInternalData] = useState<SeatLayout[]>(initialDefaultSeatLayouts);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: SeatLayout } | null>(null);
  const [toDelete, setToDelete] = useState<SeatLayout | null>(null);
  const [formData, setFormData] = useState<Partial<SeatLayout>>({});

  const handleOpenAdd = () => {
    setFormData({ layoutId: "", layoutCode: "", categoryId: categoryOptions[0].categoryId || "", description: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: SeatLayout) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.layoutCode || !formData.description) return;

    const newRecord: SeatLayoutPayload = {
      layoutId: formData.layoutId || "",
      layoutCode: formData.layoutCode || "",
      categoryId: formData.categoryId || categoryOptions[0].categoryId || "",
      description: formData.description,
      isActive: formData.isActive ?? true
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
        setInternalData((prev) => prev.map((item: SeatLayout) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.categoryId);
    } else {
      setInternalData((prev) => prev.filter((item: SeatLayout) => item.categoryId !== toDelete.categoryId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Seat layouts"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add layout
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Layout</Th>
              <Th>Vehicle category</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: SeatLayout) => (
              <tr key={item.layoutId} className="stc-row">
                <Td mono>{item.layoutCode}</Td>
                <Td>{item.description}</Td>
                <Td mono>{item.categoryCode}</Td>
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
                <Td colSpan={5}>No records yet — use Add layout to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Seat Layouts`}
            subtitle={modal.mode === "add" ? "Add a new seat layout" : "Update seat layout"}
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
                  value={formData.layoutCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, layoutCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Vehicle category</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryId: e.target.value }))}
                >
                  {categoryOptions.map((opt) => <option key={opt.categoryId} value={opt.categoryId}>{opt.categoryCode}</option>)}
                </select>
              </div>
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Layout Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              {/* {modal.mode === "edit" && (
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
              )} */}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Seat Layouts" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.layoutCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default SeatLayouts;
