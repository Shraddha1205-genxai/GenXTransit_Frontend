import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface VehicleCategory {
  code: string;
  name: string;
  capacity: number;
  class: string;
}

export interface VehicleCategoriesProps {
  data?: VehicleCategory[];
  onAdd?: (item: VehicleCategory) => void;
  onUpdate?: (code: string, item: VehicleCategory) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultVehicleCategories: VehicleCategory[] = [
  { code: "VC-SHIV", name: "AC Shivneri", capacity: 42, class: "Luxury" },
  { code: "VC-EXP", name: "Express (ST)", capacity: 52, class: "Standard" },
  { code: "VC-ORD", name: "Ordinary Local", capacity: 58, class: "Standard" },
  { code: "VC-DD", name: "Double-decker", capacity: 96, class: "City" },
];

export function VehicleCategories({ data: propData, onAdd, onUpdate, onDelete }: VehicleCategoriesProps) {
  const [internalData, setInternalData] = useState<VehicleCategory[]>(initialDefaultVehicleCategories);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: VehicleCategory } | null>(null);
  const [toDelete, setToDelete] = useState<VehicleCategory | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleCategory>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", capacity: 0, class: "Standard" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: VehicleCategory) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;

    const newRecord: VehicleCategory = {
      code: formData.code,
      name: formData.name,
      capacity: Number(formData.capacity) || 0,
      class: formData.class || "Standard",
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
        setInternalData((prev) => prev.map((item: VehicleCategory) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item: VehicleCategory) => item.code !== toDelete.code));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Vehicle categories"
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
              <Th>Name</Th>
              <Th align="right">Capacity</Th>
              <Th>Class</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: VehicleCategory) => (
              <tr key={item.code} className="stc-row">
                <Td mono>{item.code}</Td>
                <Td>{item.name}</Td>
                <Td align="right">{item.capacity}</Td>
                <Td>{item.class}</Td>
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
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Vehicle Categories`}
            subtitle={modal.mode === "add" ? "Add a new vehicle category" : "Update vehicle category"}
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
                <label className="stc-field-label">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Class</label>
                <select
                  value={formData.class || "Standard"}
                  onChange={(e) => setFormData((s) => ({ ...s, class: e.target.value }))}
                >
                  <option value="Luxury">Luxury</option>
                  <option value="Standard">Standard</option>
                  <option value="City">City</option>
                </select>
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Vehicle Categories" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
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

export default VehicleCategories;
