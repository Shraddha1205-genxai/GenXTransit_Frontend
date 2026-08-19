import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Division {
  code: string;
  name: string;
  region: string;
  depots: number;
}

export interface DivisionPageProps {
  data?: Division[];
  regionOptions?: string[];
  onAdd?: (item: Division) => void;
  onUpdate?: (code: string, item: Division) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultDivisions: Division[] = [
  { code: "DIV-PUN-01", name: "Pune Division", region: "REG-PUN", depots: 7 },
  { code: "DIV-PUN-02", name: "Solapur Division", region: "REG-PUN", depots: 6 },
  { code: "DIV-MUM-01", name: "Mumbai Division", region: "REG-MUM", depots: 5 },
  { code: "DIV-MUM-02", name: "Thane Division", region: "REG-MUM", depots: 6 },
];

const defaultRegionOptions = ["REG-PUN", "REG-MUM", "REG-NAS"];

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
    setFormData({ code: "", name: "", region: regionOptions[0] || "", depots: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Division) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: Division = {
      code: formData.code,
      name: formData.name,
      region: formData.region || regionOptions[0] || "",
      depots: Number(formData.depots) || 0,
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
        setInternalData((prev) => prev.map((item) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item) => item.code !== toDelete.code));
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
              <Th>Division</Th>
              <Th>Name</Th>
              <Th>Region</Th>
              <Th>Depots</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: Division) => (
              <tr key={d.code} className="stc-row">
                <Td mono><RouteChip>{d.code}</RouteChip></Td>
                <Td>{d.name}</Td>
                <Td mono>{d.region}</Td>
                <Td>{d.depots}</Td>
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
              <div className="stc-field">
                <label className="stc-field-label">Division code</label>
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
              <div className="stc-field">
                <label className="stc-field-label">Depots</label>
                <input
                  type="number"
                  value={formData.depots ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, depots: Number(e.target.value) }))}
                />
              </div>
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
              This will permanently remove {toDelete.code} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Divisions;
