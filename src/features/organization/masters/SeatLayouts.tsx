import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface SeatLayout {
  code: string;
  name: string;
  category: string;
}

export interface SeatLayoutsProps {
  data?: SeatLayout[];
  categoryOptions?: string[];
  onAdd?: (item: SeatLayout) => void;
  onUpdate?: (code: string, item: SeatLayout) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultSeatLayouts: SeatLayout[] = [
  { code: "SL-01", name: "2+2 Front Facing", category: "VC-STD" },
  { code: "SL-02", name: "3+2 Recliner", category: "VC-LUX" },
  { code: "SL-03", name: "City Bus Single Row", category: "VC-CITY" },
];

export function SeatLayouts({ data: propData, categoryOptions = [], onAdd, onUpdate, onDelete }: SeatLayoutsProps) {
  const [internalData, setInternalData] = useState<SeatLayout[]>(initialDefaultSeatLayouts);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: SeatLayout } | null>(null);
  const [toDelete, setToDelete] = useState<SeatLayout | null>(null);
  const [formData, setFormData] = useState<Partial<SeatLayout>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", category: categoryOptions[0] || "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: SeatLayout) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;

    const newRecord: SeatLayout = {
      code: formData.code,
      name: formData.name,
      category: formData.category || categoryOptions[0] || "",
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
        setInternalData((prev) => prev.map((item: SeatLayout) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item: SeatLayout) => item.code !== toDelete.code));
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
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: SeatLayout) => (
              <tr key={item.code} className="stc-row">
                <Td mono>{item.code}</Td>
                <Td>{item.name}</Td>
                <Td mono>{item.category}</Td>
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
                <Td colSpan={4}>No records yet — use Add layout to create one.</Td>
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
              <div className="stc-field">
                <label className="stc-field-label">Code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.code || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Layout description</label>
                <input
                  value={formData.name || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Vehicle category</label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, category: e.target.value }))}
                >
                  {categoryOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
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
              This will permanently remove {toDelete.code} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default SeatLayouts;
