import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Region {
  id: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
}

export interface RegionPageProps {
  data?: Region[];
  onAdd?: (item: Region) => void;
  onUpdate?: (id: string, item: Region) => void;
  onDelete?: (id: string) => void;
}

const initialDefaultRegions: Region[] = [
  { id: "REG-ID-1001", regionCode: "REG-0001", regionName: "Pune Region", isActive: true },
  { id: "REG-ID-1002", regionCode: "REG-0002", regionName: "Mumbai Region", isActive: true },
  { id: "REG-ID-1003", regionCode: "REG-0003", regionName: "Nashik Region", isActive: true },
];

const generateRegionCode = (existing: Region[]) => {
  const numbers = existing
    .map((item) => Number((item.regionCode.match(/(\d+)$/) ?? ["0", "0"])[1]))
    .filter((n) => Number.isFinite(n));
  const next = (Math.max(0, ...numbers) + 1).toString().padStart(4, "0");
  return `REG-${next}`;
};

export function Regions({ data: propData, onAdd, onUpdate, onDelete }: RegionPageProps) {
  const [internalData, setInternalData] = useState<Region[]>(initialDefaultRegions);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Region } | null>(null);
  const [toDelete, setToDelete] = useState<Region | null>(null);

  const [formData, setFormData] = useState<Partial<Region>>({});

  const handleOpenAdd = () => {
    setFormData({ id: `REG-ID-${Date.now()}`, regionCode: generateRegionCode(data), regionName: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Region) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.regionName) return;
    const newRecord: Region = {
      id: modal?.mode === "edit" && modal.record ? modal.record.id : `REG-ID-${Date.now()}`,
      regionCode: modal?.mode === "edit" && modal.record ? modal.record.regionCode : generateRegionCode(data),
      regionName: formData.regionName.trim(),
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
              <Th>Region ID</Th>
              <Th>Region code</Th>
              <Th>Region Name</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((r: Region) => (
              <tr key={r.id} className="stc-row">
                <Td mono>{r.id}</Td>
                <Td mono>{r.regionCode}</Td>
                <Td>{r.regionName}</Td>
                <Td><StatusBadge status={r.isActive ? "Active" : "Inactive"} /></Td>
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
              <tr><Td colSpan={5}>No records yet — use Add region to create one.</Td></tr>
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
              {modal.mode === "edit" && (
                <>
                  <div className="stc-field">
                    <label className="stc-field-label">Region ID</label>
                    <input value={formData.id || ""} readOnly />
                  </div>
                  <div className="stc-field">
                    <label className="stc-field-label">Region code</label>
                    <input value={formData.regionCode || ""} readOnly />
                  </div>
                </>
              )}

              {modal.mode === "add" && (
                <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 12, color: T.textSoft, padding: "8px 10px", borderRadius: 6, background: T.grayFill }}>
                    Auto-generated region code: <strong>{formData.regionCode || "REG-0001"}</strong>
                  </div>
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Region Name</label>
                <input
                  value={formData.regionName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, regionName: e.target.value }))}
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
          <Modal title="Delete — Regions" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.regionName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Regions;
