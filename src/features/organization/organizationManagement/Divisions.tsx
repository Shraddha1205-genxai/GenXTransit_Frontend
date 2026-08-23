import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Division {
  id: string;
  divisionCode: string;
  divisionName: string;
  region: string;
  isActive: boolean;
}

export interface DivisionPageProps {
  data?: Division[];
  regionOptions?: string[];
  onAdd?: (item: Division) => void;
  onUpdate?: (id: string, item: Division) => void;
  onDelete?: (id: string) => void;
}

const initialDefaultDivisions: Division[] = [
  { id: "DIV-ID-1001", divisionCode: "DIV-0001", divisionName: "Pune Division", region: "REG-0001", isActive: true },
  { id: "DIV-ID-1002", divisionCode: "DIV-0002", divisionName: "Solapur Division", region: "REG-0001", isActive: true },
  { id: "DIV-ID-1003", divisionCode: "DIV-0003", divisionName: "Mumbai Division", region: "REG-0002", isActive: true },
];

const generateDivisionCode = (existing: Division[]) => {
  const numbers = existing
    .map((item) => Number((item.divisionCode.match(/(\d+)$/) ?? ["0", "0"])[1]))
    .filter((n) => Number.isFinite(n));
  const next = (Math.max(0, ...numbers) + 1).toString().padStart(4, "0");
  return `DIV-${next}`;
};

const defaultRegionOptions = ["REG-0001", "REG-0002", "REG-0003"];

export function Divisions({
  data: propData,
  regionOptions = defaultRegionOptions,
  onAdd,
  onUpdate,
  onDelete,
}: DivisionPageProps) {
  const [internalData, setInternalData] = useState<Division[]>(initialDefaultDivisions);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Division } | null>(null);
  const [toDelete, setToDelete] = useState<Division | null>(null);
  const [formData, setFormData] = useState<Partial<Division>>({});

  const handleOpenAdd = () => {
    setFormData({ id: `DIV-ID-${Date.now()}`, divisionCode: generateDivisionCode(data), divisionName: "", region: regionOptions[0] || "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Division) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.divisionName) return;
    const newRecord: Division = {
      id: modal?.mode === "edit" && modal.record ? modal.record.id : `DIV-ID-${Date.now()}`,
      divisionCode: modal?.mode === "edit" && modal.record ? modal.record.divisionCode : generateDivisionCode(data),
      divisionName: formData.divisionName.trim(),
      region: formData.region || regionOptions[0] || "",
      isActive: formData.isActive ?? true,
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.id, newRecord);
      } else {
        setInternalData((prev) => prev.map((item) => (item.id === modal.record!.id ? newRecord : item)));
      }
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.id);
    } else {
      setInternalData((prev) => prev.filter((item) => item.id !== toDelete.id));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Divisions"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add division
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Division Code</Th>
              <Th>Division Name</Th>
              <Th>Region</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: Division) => (
              <tr key={d.id} className="stc-row">
                <Td mono>{d.divisionCode}</Td>
                <Td>{d.divisionName}</Td>
                <Td mono>{d.region}</Td>
                <Td><StatusBadge status={d.isActive ? "Active" : "Inactive"} /></Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(d)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(d)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={5}>No records yet — use Add division to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Divisions`}
            subtitle={modal.mode === "add" ? "Create a new division" : "Update division details"}
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
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Division Code</label>
                  <input value={formData.divisionCode || ""} readOnly />
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Division Name</label>
                <input
                  value={formData.divisionName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, divisionName: e.target.value }))}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Region</label>
                <select
                  value={formData.region || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, region: e.target.value }))}
                >
                  {regionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
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
          <Modal title="Delete — Divisions" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.divisionName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Divisions;
