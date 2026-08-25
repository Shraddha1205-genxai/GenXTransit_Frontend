import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, TableToolbar, Th, Td, Modal, Table, StatusBadge } from "../../../components/common";

export interface Region {
  regionId: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
  divisions: number;
  depots: number;
  stations: number;
  workshops: number;
}

export interface RegionPayload {
  regionId: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
}

export interface RegionPageProps {
  data?: Region[];
  onAdd?: (item: RegionPayload) => void;
  onUpdate?: (item: RegionPayload) => void;
  onDelete?: (regionId: string) => void;
}

const initialDefaultRegions: Region[] = [
  { regionId: "REG-ID-1001", regionCode: "REG-0001", divisions: 2, depots: 2, stations: 2, workshops: 3, regionName: "Pune Region", isActive: true },
  { regionId: "REG-ID-1002", regionCode: "REG-0002", divisions: 1, depots: 1, stations: 1, workshops: 2, regionName: "Mumbai Region", isActive: true },
  { regionId: "REG-ID-1003", regionCode: "REG-0003", divisions: 0, depots: 0, stations: 0, workshops: 0, regionName: "Nashik Region", isActive: true },
];

export function Regions({ data: propData, onAdd, onUpdate, onDelete }: RegionPageProps) {
  const [internalData, setInternalData] = useState<Region[]>(initialDefaultRegions);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Region } | null>(null);
  const [toDelete, setToDelete] = useState<Region | null>(null);

  const [formData, setFormData] = useState<Partial<Region>>({});
  const [search, setSearch] = useState("");

  const filteredData = data.filter((region) => [region.regionCode, region.regionName].some((value) => String(value).toLowerCase().includes(search.toLowerCase())));

  const handleOpenAdd = () => {
    setFormData({ regionId: "", regionCode: "", regionName: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Region) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.regionName) return;
    const newRecord: RegionPayload = {
      regionId: modal?.mode === "edit" && modal.record ? modal.record.regionId : "",
      regionCode: modal?.mode === "edit" && modal.record ? modal.record.regionCode : "",
      regionName: formData.regionName.trim(),
      isActive: formData.isActive ?? true,
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
        setInternalData((prev) => prev.map((item) => (item)));
      }
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.regionId);
    } else {
      setInternalData((prev) => prev.filter((item) => item.regionId !== toDelete.regionId));
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
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search regions..." />
        <Table>
          <thead>
            <tr>
              <Th>Region code</Th>
              <Th>Region Name</Th>
              <Th>Divisions</Th>
              <Th>Depots</Th>
              <Th>Stations</Th>
              <Th>Workshops</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((r: Region) => (
              <tr key={r.regionId} className="stc-row">
                <Td mono>{r.regionCode}</Td>
                <Td>{r.regionName}</Td>
                <Td><RouteChip>{r.divisions}</RouteChip></Td>
                <Td><RouteChip>{r.depots}</RouteChip></Td>
                <Td><RouteChip>{r.stations}</RouteChip></Td>
                <Td><RouteChip>{r.workshops}</RouteChip></Td>
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
            {filteredData.length === 0 && (
              <tr><Td colSpan={8}>{data.length === 0 ? "No records yet — use Add region to create one." : "No regions match the search."}</Td></tr>
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
                    <label className="stc-field-label">Region code</label>
                    <input value={formData.regionCode || ""} readOnly />
                  </div>
                </>
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
