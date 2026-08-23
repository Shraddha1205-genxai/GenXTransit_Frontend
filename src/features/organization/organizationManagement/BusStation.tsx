import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface BusStation {
  code: string;
  name: string;
  regionCode: string;
  divisionCode: string;
  depotCode: string;
  platforms: number;
  dailyFootfall: number;
  isActive: boolean;
}

export interface BusStationPageProps {
  data?: BusStation[];
  regionOptions?: string[];
  divisionOptions?: string[];
  depotOptions?: string[];
  onAdd?: (item: BusStation) => void;
  onUpdate?: (code: string, item: BusStation) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultBusStations: BusStation[] = [
  { code: "STN-0001", name: "Swargate Bus Station", regionCode: "REG-0001", divisionCode: "DIV-0001", depotCode: "MSRTC-PUN-01", platforms: 14, dailyFootfall: 38000, isActive: true },
  { code: "STN-0002", name: "Mumbai Central Bus Terminus", regionCode: "REG-0002", divisionCode: "DIV-0003", depotCode: "MSRTC-MUM-03", platforms: 10, dailyFootfall: 22500, isActive: true },
  { code: "STN-0003", name: "Colaba Bus Depot Stand", regionCode: "REG-0002", divisionCode: "DIV-0003", depotCode: "BEST-MUM-07", platforms: 6, dailyFootfall: 9200, isActive: true },
];

const generateStationCode = (existing: BusStation[]) => {
  const numbers = existing
    .map((item) => Number((item.code.match(/(\d+)$/) ?? ["0", "0"])[1]))
    .filter((n) => Number.isFinite(n));
  const next = (Math.max(0, ...numbers) + 1).toString().padStart(4, "0");
  return `STN-${next}`;
};

export function BusStation({ data: propData, regionOptions = [], divisionOptions = [], depotOptions = [], onAdd, onUpdate, onDelete }: BusStationPageProps) {
  const [internalData, setInternalData] = useState<BusStation[]>(initialDefaultBusStations);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: BusStation } | null>(null);
  const [toDelete, setToDelete] = useState<BusStation | null>(null);
  const [formData, setFormData] = useState<Partial<BusStation>>({});

  const handleOpenAdd = () => {
    setFormData({ code: generateStationCode(data), name: "", regionCode: regionOptions[0] || "", divisionCode: divisionOptions[0] || "", depotCode: depotOptions[0] || "", platforms: 0, dailyFootfall: 0, isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: BusStation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.name) return;
    const newRecord: BusStation = {
      code: modal?.mode === "edit" && modal.record ? modal.record.code : generateStationCode(data),
      name: formData.name,
      regionCode: formData.regionCode || regionOptions[0] || "",
      divisionCode: formData.divisionCode || divisionOptions[0] || "",
      depotCode: formData.depotCode || depotOptions[0] || "",
      platforms: Number(formData.platforms) || 0,
      dailyFootfall: Number(formData.dailyFootfall) || 0,
      isActive: modal?.mode === "edit" ? (formData.isActive ?? true) : true,
    };

    if (modal?.mode === "add") {
      if (onAdd) onAdd(newRecord);
      else setInternalData((prev) => [...prev, newRecord]);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) onUpdate(modal.record.code, newRecord);
      else setInternalData((prev) => prev.map((item) => (item.code === modal.record!.code ? newRecord : item)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) onDelete(toDelete.code);
    else setInternalData((prev) => prev.filter((item) => item.code !== toDelete.code));
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Bus Stations"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add bus station
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Station Code</Th>
              <Th>Station Name</Th>
              <Th>Region Code</Th>
              <Th>Division Code</Th>
              <Th>Depot Code</Th>
              <Th>Platforms</Th>
              <Th>Daily Footfall</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((b: BusStation) => (
              <tr key={b.code} className="stc-row">
                <Td mono><RouteChip>{b.code}</RouteChip></Td>
                <Td>{b.name}</Td>
                <Td mono>{b.regionCode}</Td>
                <Td mono>{b.divisionCode}</Td>
                <Td mono>{b.depotCode}</Td>
                <Td>{b.platforms}</Td>
                <Td>{b.dailyFootfall}</Td>
                <Td><StatusBadge status={b.isActive ? "Active" : "Inactive"} /></Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(b)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(b)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={9}>No records yet — use Add bus station to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Bus Station`}
            subtitle={modal.mode === "add" ? "Add a new bus station" : "Update station details"}
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
                  <label className="stc-field-label">Station Code</label>
                  <input value={formData.code || ""} readOnly />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Station Name</label>
                <input
                  value={formData.name || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Region Code</label>
                <select value={formData.regionCode || ""} onChange={(e) => setFormData((s) => ({ ...s, regionCode: e.target.value }))}>
                  {regionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Division Code</label>
                <select value={formData.divisionCode || ""} onChange={(e) => setFormData((s) => ({ ...s, divisionCode: e.target.value }))}>
                  {divisionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depot Code</label>
                <select value={formData.depotCode || ""} onChange={(e) => setFormData((s) => ({ ...s, depotCode: e.target.value }))}>
                  {depotOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Platforms</label>
                <input
                  type="number"
                  value={formData.platforms ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, platforms: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Daily Footfall</label>
                <input
                  type="number"
                  value={formData.dailyFootfall ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, dailyFootfall: Number(e.target.value) }))}
                />
              </div>
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select value={formData.isActive ? "Active" : "Inactive"} onChange={(e) => setFormData((s) => ({ ...s, isActive: e.target.value === "Active" }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Bus Station" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.name} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default BusStation;
