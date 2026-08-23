import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table, StatusBadge } from "../../../components/common";

export interface Zone {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  districts: string[];
  isActive: boolean;
}
export interface ZonePayload {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  regionId: string;
  districts: string[];
  isActive: boolean;
}
export interface RegionOption {
  regionId: string;
  regionCode: string;
  regionName?: string;
}
export interface ZonesProps {
  data?: Zone[];
  regionOptions?: RegionOption[];
  onAdd?: (item: ZonePayload) => void;
  onUpdate?: (item: ZonePayload) => void;
  onDelete?: (id: string) => void;
}

const initialDefaultZones: Zone[] = [
  { zoneId: "ZN-ID-1001", zoneCode: "ZN-0001", zoneName: "Pune Metropolitan Zone", regionId: "0001", regionCode: "REG-0001", regionName: "Pune Region", districts: ["Pune", "Pimpri-Chinchwad"], isActive: true },
  { zoneId: "ZN-ID-1002", zoneCode: "ZN-0002", zoneName: "Mumbai Zone", regionId: "0002", regionCode: "REG-0002", regionName: "Mumbai Region", districts: ["Mumbai", "Thane"], isActive: true },
  { zoneId: "ZN-ID-1003", zoneCode: "ZN-0003", zoneName: "Nashik Zone", regionId: "0003", regionCode: "REG-0003", regionName: "Nashik Region", districts: ["Nashik", "Ahmednagar"], isActive: true },
];

export function Zones({ data: propData, regionOptions = [], onAdd, onUpdate, onDelete }: ZonesProps) {
  const [internalData, setInternalData] = useState<Zone[]>(initialDefaultZones);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Zone } | null>(null);
  const [toDelete, setToDelete] = useState<Zone | null>(null);
  const [formData, setFormData] = useState<Partial<Zone>>({});

  const handleOpenAdd = () => {
    setFormData({ zoneName: "", regionId: regionOptions?.[0]?.regionId || "", districts: [] });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Zone) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.zoneName || !formData.regionId) return;

    const isEdit = modal?.mode === "edit" && modal.record;

    const newRecord: ZonePayload = {
      zoneId: isEdit ? modal!.record!.zoneId : `ZN-ID-${Date.now()}`,
      zoneCode: isEdit ? modal!.record!.zoneCode : `ZN-${String(data.length + 1).padStart(4, "0")}`,
      zoneName: formData.zoneName.trim(),
      regionId: formData.regionId || regionOptions?.[0]?.regionId || "",
      districts: Array.isArray(formData.districts)
        ? formData.districts
        : formData.districts
        ? String(formData.districts).split(",").map((v) => v.trim()).filter(Boolean)
        : [],
      isActive: formData.isActive ?? true,
    };

    const selectedRegion = regionOptions?.find((r) => r.regionId === newRecord.regionId);

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [
          ...prev,
          {
            ...newRecord,
            regionCode: selectedRegion?.regionCode || "",
            regionName: selectedRegion?.regionName || "",
          },
        ]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(newRecord);
      } else {
        setInternalData((prev) =>
          prev.map((item) =>
            item.zoneId === newRecord.zoneId
              ? {
                  ...item,
                  ...newRecord,
                  regionCode: selectedRegion?.regionCode || item.regionCode,
                  regionName: selectedRegion?.regionName || item.regionName,
                }
              : item
          )
        );
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.zoneId);
    } else {
      setInternalData((prev) => prev.filter((item: Zone) => item.zoneId !== toDelete.zoneId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Zone"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add zone
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Zone Code</Th>
              <Th>Zone Name</Th>
              <Th>Region Name</Th>
              <Th>Districts</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Zone) => (
              <tr key={item.zoneId} className="stc-row">
                <Td mono>{item.zoneCode}</Td>
                <Td>{item.zoneName}</Td>
                <Td mono>{item.regionName}</Td>
                <Td>{item.districts?.join(", ")}</Td>
                <Td><StatusBadge status={item.isActive ? "Active" : "Inactive"} /></Td>
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
                <Td colSpan={6}>No records yet — use Add zone to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Zone`}
            subtitle={modal.mode === "add" ? "Add a new zone" : "Update zone details"}
            onClose={() => setModal(null)}
            width={620}
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
                  <label className="stc-field-label">Zone Code</label>
                  <input value={formData.zoneCode || ""} readOnly />
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Zone Name</label>
                <input
                  value={formData.zoneName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, zoneName: e.target.value }))}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Region Code</label>
                <select value={formData.regionId || ""} onChange={(e) => setFormData((s) => ({ ...s, regionId: e.target.value }))}>
                  {regionOptions && regionOptions.length > 0 &&
                    regionOptions.map((opt) => (
                      <option key={opt.regionId} value={opt.regionId}>
                        {opt.regionCode}
                      </option>
                    ))}
                </select>
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Districts</label>
                <input
                  value={Array.isArray(formData.districts) ? formData.districts.join(", ") : (formData.districts || "")}
                  onChange={(e) => setFormData((s) => ({ ...s, districts: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) }))}
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
          <Modal title="Delete — Zone" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.zoneName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Zones;