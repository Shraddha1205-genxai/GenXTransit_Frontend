import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Region {
  code: string;
  name: string;
  divisions: number;
  depots: number;
  fleet: number;
}

export interface RegionPageProps {
  data?: Region[];
  onAdd?: (item: Region) => void;
  onUpdate?: (code: string, item: Region) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultRegions: Region[] = [
  { code: "REG-PUN", name: "Pune Region", divisions: 3, depots: 18, fleet: 612 },
  { code: "REG-MUM", name: "Mumbai Region", divisions: 2, depots: 11, fleet: 348 },
  { code: "REG-NAS", name: "Nashik Region", divisions: 2, depots: 9, fleet: 241 },
];

export function Regions({ data: propData, onAdd, onUpdate, onDelete }: RegionPageProps) {
  const [internalData, setInternalData] = useState<Region[]>(initialDefaultRegions);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Region } | null>(null);
  const [toDelete, setToDelete] = useState<Region | null>(null);

  const [formData, setFormData] = useState<Partial<Region>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", divisions: 0, depots: 0, fleet: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Region) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: Region = {
      code: formData.code,
      name: formData.name,
      divisions: Number(formData.divisions) || 0,
      depots: Number(formData.depots) || 0,
      fleet: Number(formData.fleet) || 0,
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
        title="Regions"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add region
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Region</Th>
              <Th>Name</Th>
              <Th>Divisions</Th>
              <Th>Depots</Th>
              <Th align="right">Fleet strength</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((r: Region) => (
              <tr key={r.code} className="stc-row">
                <Td mono><RouteChip>{r.code}</RouteChip></Td>
                <Td>{r.name}</Td>
                <Td>{r.divisions}</Td>
                <Td>{r.depots}</Td>
                <Td align="right" mono>{r.fleet}</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(r)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(r)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={6}>No records yet — use Add region to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Regions`}
            subtitle={modal.mode === "add" ? "Create a new region" : "Update region details"}
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
                <label className="stc-field-label">Region code</label>
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
                <label className="stc-field-label">Divisions</label>
                <input
                  type="number"
                  value={formData.divisions ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, divisions: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depots</label>
                <input
                  type="number"
                  value={formData.depots ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, depots: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Fleet strength</label>
                <input
                  type="number"
                  value={formData.fleet ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, fleet: Number(e.target.value) }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Regions" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
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

export default Regions;
