import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, TableToolbar, Th, Td, Modal, Table } from "../../../components/common";

export interface ParkingYard {
  yardId: string;
  yardCode: string;
  yardName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  capacity: number;
  occupied: number;
  isActive: boolean;
}
export interface ParkingYardPayload {
  yardId: string;
  yardCode: string;
  yardName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  capacity: number;
  occupied: number;
  isActive: boolean;
}
export interface ParkingYardPageProps {
  data?: ParkingYard[];
  depotOptions?: {depotId: string; depotCode: string, depotName: string}[];
  regionOptions?: {regionId: string; regionCode: string, regionName: string}[];
  divisionOptions?: {divisionId: string; divisionCode: string, divisionName: string}[];
  onAdd?: (item: ParkingYardPayload) => void;
  onUpdate?: (item: ParkingYardPayload) => void;
  onDelete?: (yardId: string) => void;
}

const initialDefaultParkingYards: ParkingYard[] = [
  { yardId: "01", yardCode: "PY-PUN-01", yardName: "Swargate Overnight Yard",regionId: "001", regionCode: "REG-PUN", regionName: "Pune", divisionId: "001", divisionCode: "DIV-PUN", divisionName: "Pune Division", depotId: "MSRTC-PUN-01", depotCode: "DEP-PUN-01", depotName: "MSRTC-PUN-01", capacity: 110, occupied: 88, isActive: true },
  { yardId: "02", yardCode: "PY-MUM-04", yardName: "Wadala Parking Yard",regionId: "002", regionCode: "REG-MUM", regionName: "Mumbai", divisionId: "002", divisionCode: "DIV-MUM", divisionName: "Mumbai Division", depotId: "BEST-MUM-04", depotCode: "DEP-MUM-04", depotName: "BEST-MUM-04", capacity: 85, occupied: 74, isActive: true },
  { yardId: "03", yardCode: "PY-MUM-07", yardName: "Colaba Parking Yard",regionId: "002", regionCode: "REG-MUM", regionName: "Mumbai", divisionId: "002", divisionCode: "DIV-MUM", divisionName: "Mumbai Division", depotId: "BEST-MUM-07", depotCode: "DEP-MUM-07", depotName: "BEST-MUM-07", capacity: 52, occupied: 40, isActive: true },
];

export function ParkingYards({ data: propData, depotOptions = [], regionOptions = [], divisionOptions = [], onAdd, onUpdate, onDelete }: ParkingYardPageProps) {
  const [internalData, setInternalData] = useState<ParkingYard[]>(initialDefaultParkingYards);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: ParkingYard } | null>(null);
  const [toDelete, setToDelete] = useState<ParkingYard | null>(null);
  const [formData, setFormData] = useState<Partial<ParkingYard>>({});
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [depotFilter, setDepotFilter] = useState("");

  const filteredData = data.filter((yard) => {
    const query = search.toLowerCase();
    return (!query || [yard.yardCode, yard.yardName, yard.regionCode, yard.divisionCode, yard.depotCode].some((value) => String(value).toLowerCase().includes(query))) && (!regionFilter || yard.regionId === regionFilter) && (!divisionFilter || yard.divisionId === divisionFilter) && (!depotFilter || yard.depotId === depotFilter);
  });

  const handleOpenAdd = () => {
    setFormData({ yardId: "", yardCode: "", yardName: "", regionId: regionOptions[0]?.regionId || "", divisionId: divisionOptions[0]?.divisionId || "", depotId: depotOptions[0]?.depotId || "", capacity: 0, occupied: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ParkingYard) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.yardCode || !formData.yardName) return;
    const newRecord: ParkingYardPayload = {
      yardId: modal?.mode === "edit" && modal.record ? modal.record.yardId : "",
      yardCode: formData.yardCode,
      yardName: formData.yardName,
      regionId: formData.regionId || regionOptions[0]?.regionId || "",
      divisionId: formData.divisionId || divisionOptions[0]?.divisionId || "",
      depotId: formData.depotId || depotOptions[0]?.depotId || "",
      capacity: Number(formData.capacity) || 0,
      occupied: Number(formData.occupied) || 0,
      isActive: formData.isActive ?? true,
    };

    if (modal?.mode === "add") {
      if (onAdd) onAdd(newRecord);
      else setInternalData((prev) => [...prev]);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) onUpdate(newRecord);
      else setInternalData((prev) => prev.map((item) => (item)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) onDelete(toDelete.yardId);
    else setInternalData((prev) => prev.filter((item) => item.yardId !== toDelete.yardId));
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Parking Yards"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add parking yard
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search parking yards..."
          filters={[
            { key: "region", label: "All regions", value: regionFilter, onChange: (value) => { setRegionFilter(value); setDivisionFilter(""); setDepotFilter(""); }, options: regionOptions.map((region) => ({ value: region.regionId, label: region.regionName })) },
            { key: "division", label: "All divisions", value: divisionFilter, onChange: (value) => { setDivisionFilter(value); setDepotFilter(""); }, disabled: !regionFilter, options: divisionOptions.filter((division) => !regionFilter || data.some((yard) => yard.regionId === regionFilter && yard.divisionId === division.divisionId)).map((division) => ({ value: division.divisionId, label: division.divisionName })) },
            { key: "depot", label: "All depots", value: depotFilter, onChange: setDepotFilter, disabled: !divisionFilter, options: depotOptions.filter((depot) => !divisionFilter || data.some((yard) => yard.divisionId === divisionFilter && yard.depotId === depot.depotId)).map((depot) => ({ value: depot.depotId, label: depot.depotCode })) },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Yard code</Th>
              <Th>Yard Name</Th>
              <Th>Region</Th>
              <Th>Division</Th>
              <Th>Depot</Th>
              <Th>Capacity</Th>
              <Th>Occupied</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((p: ParkingYard) => (
              <tr key={p.yardId} className="stc-row">
                <Td mono><RouteChip>{p.yardCode}</RouteChip></Td>
                <Td>{p.yardName}</Td>
                <Td mono>{p.regionCode}</Td>
                <Td mono>{p.divisionCode}</Td>
                <Td mono>{p.depotCode}</Td>
                <Td>{p.capacity}</Td>
                <Td>{p.occupied} ({p.capacity ? Math.round((p.occupied / p.capacity) * 100) : 0}%)</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(p)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(p)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><Td colSpan={8}>{data.length === 0 ? "No records yet — use Add parking yard to create one." : "No parking yards match the selected filters."}</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Parking Yard`}
            subtitle={modal.mode === "add" ? "Add a new parking yard" : "Update yard details"}
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
                  <label className="stc-field-label">Yard code</label>
                  <input
                    disabled={modal.mode === "edit"}
                    value={formData.yardCode || ""}
                    onChange={(e) => setFormData((s) => ({ ...s, yardCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Yard Name</label>
                <input
                  value={formData.yardName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, yardName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Regions</label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, regionId: e.target.value }))}
                >
                  {regionOptions.map((opt) => (
                    <option key={opt.regionId} value={opt.regionId}>{opt.regionName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Divisions</label>
                <select
                  value={formData.divisionId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, divisionId: e.target.value }))}
                >
                  {divisionOptions.map((opt) => (
                    <option key={opt.divisionId} value={opt.divisionId}>{opt.divisionName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depots</label>
                <select
                  value={formData.depotId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, depotId: e.target.value }))}
                >
                  {depotOptions.map((opt) => (
                    <option key={opt.depotId} value={opt.depotId}>{opt.depotName}</option>
                  ))}
                </select>
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
                <label className="stc-field-label">Occupied</label>
                <input
                  type="number"
                  value={formData.occupied ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, occupied: Number(e.target.value) }))}
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
          <Modal title="Delete — Parking Yard" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.yardName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default ParkingYards;
