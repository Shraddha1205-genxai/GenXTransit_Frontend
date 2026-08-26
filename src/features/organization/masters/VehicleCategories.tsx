import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface VehicleCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  capacity: number;
  type: string;
  class: string;
  isActive: boolean;
}

export interface VehicleCategoriesProps {
  data?: VehicleCategory[];
  onAdd?: (item: VehicleCategory) => void;
  onUpdate?: (item: VehicleCategory) => void;
  onDelete?: (categoryId: string) => void;
}

const initialDefaultVehicleCategories: VehicleCategory[] = [
  { categoryId: "VC-SHIV", categoryCode: "VC-SHIV", categoryName: "AC Shivneri", capacity: 42, type: "AC", class: "Luxury", isActive: true },
  { categoryId: "VC-EXP", categoryCode: "VC-EXP", categoryName: "Express (ST)", capacity: 52, type: "AC", class: "Standard", isActive: true },
  { categoryId: "VC-ORD", categoryCode: "VC-ORD", categoryName: "Ordinary Local", capacity: 58, type: "AC", class: "Standard", isActive: true },
  { categoryId: "VC-DD", categoryCode: "VC-DD", categoryName: "Double-decker", capacity: 96, type: "Non AC", class: "City", isActive: true },
];

export function VehicleCategories({ data: propData, onAdd, onUpdate, onDelete }: VehicleCategoriesProps) {
  const [internalData, setInternalData] = useState<VehicleCategory[]>(initialDefaultVehicleCategories);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: VehicleCategory } | null>(null);
  const [toDelete, setToDelete] = useState<VehicleCategory | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleCategory>>({});

  const handleOpenAdd = () => {
    setFormData({ categoryCode: "", categoryName: "", capacity: 0, type: "Non AC", class: "Standard" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: VehicleCategory) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.categoryCode || !formData.categoryName) return;

    const newRecord: VehicleCategory = {
      categoryId: formData.categoryId  || "",
      categoryCode: formData.categoryCode || "",
      categoryName: formData.categoryName,
      capacity: Number(formData.capacity) || 0,
      type: formData.type || "Non AC",
      class: formData.class || "Standard",
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
        setInternalData((prev) => prev.map((item: VehicleCategory) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.categoryId);
    } else {
      setInternalData((prev) => prev.filter((item: VehicleCategory) => item.categoryId !== toDelete.categoryId));
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
              <Th align="center">Capacity</Th>
              <Th>Type</Th>
              <Th>Class</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: VehicleCategory) => (
              <tr key={item.categoryId} className="stc-row">
                <Td mono>{item.categoryCode}</Td>
                <Td>{item.categoryName}</Td>
                <Td align="center">{item.capacity}</Td>
                <Td>{item.type}</Td>
                <Td>{item.class}</Td>
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
                <Td colSpan={7}>No records yet — use Add category to create one.</Td>
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
              {modal.mode == "edit" && (<div className="stc-field">
                <label className="stc-field-label">Code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.categoryCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.categoryName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryName: e.target.value }))}
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
                <label className="stc-field-label">Type</label>
                <select
                  value={formData.type || "Non AC"}
                  onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
                >
                  <option value="Luxury">AC</option>
                  <option value="Standard">Non AC</option>
                </select>
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
          <Modal title="Delete — Vehicle Categories" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.categoryName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default VehicleCategories;
