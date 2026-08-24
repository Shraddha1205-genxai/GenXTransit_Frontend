import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table, StatusBadge } from "../../../components/common";

export interface FleetVehicleRecord {
  fleetId: string;
  vehicleNumber: string;
  categoryId: string;
  categoryName: string;
  depotId: string;
  depotCode: string;
  seriesType: string;
  fleetStatus: string;
  nextService: string;
  docExpiry: string;
  isActive: boolean;
}
export interface FleetVehicleRecordPayload {
  fleetId: string;
  vehicleNumber: string;
  categoryId: string;
  depotId: string;
  seriesType: string;
  fleetStatus: string;
  nextService: string;
  docExpiry: string;
  isActive: boolean;
}
export interface FleetManagementPageProps {
  data?: FleetVehicleRecord[];
  depotOptions?: {depotId: string; depotCode: string}[];
  categoryOptions: {
    categoryId: string;
    categoryName: string;
  }[];
  onAdd?: (item: FleetVehicleRecordPayload) => void;
  onUpdate?: (item: FleetVehicleRecordPayload) => void;
  onDelete?: (fleetId: string) => void;
}

const initialDefaultFleetVehicles: FleetVehicleRecord[] = [
  {fleetId: "001", vehicleNumber: "MH-12-AB-4421", categoryId: "001", categoryName: "AC Shivneri", seriesType: "BH", depotId: "01", depotCode: "MSRTC-PUN-01", fleetStatus: "Active", nextService: "12 Aug 2026", docExpiry: "Fitness · 18 Aug 2026", isActive: true },
  {fleetId: "002", vehicleNumber: "MH-12-CD-1187", categoryId: "002", categoryName: "Express (ST)", seriesType: "BH", depotId: "01", depotCode: "MSRTC-PUN-01", fleetStatus: "Active", nextService: "22 Aug 2026", docExpiry: "Insurance · 02 Sep 2026", isActive: true },
  {fleetId: "003", vehicleNumber: "MH-01-EF-7702", categoryId: "003", categoryName: "AC Local (BEST)", seriesType: "State", depotId: "04", depotCode: "BEST-MUM-04", fleetStatus: "Under maintenance", nextService: "In progress", docExpiry: "PUC · 09 Aug 2026", isActive: true },
];

export function VehicleRegister({ data: propData, depotOptions = [], categoryOptions = [], onAdd, onUpdate, onDelete }: FleetManagementPageProps) {
  const [internalData, setInternalData] = useState<FleetVehicleRecord[]>(initialDefaultFleetVehicles);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: FleetVehicleRecord } | null>(null);
  const [toDelete, setToDelete] = useState<FleetVehicleRecord | null>(null);
  const [formData, setFormData] = useState<Partial<FleetVehicleRecord>>({});

  const handleOpenAdd = () => {
    setFormData({fleetId: "", vehicleNumber: "", seriesType: "", categoryId: "", depotId: depotOptions[0].depotId || "", fleetStatus: "Active", nextService: "", docExpiry: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: FleetVehicleRecord) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.vehicleNumber || !formData.categoryId) return;

    const newRecord: FleetVehicleRecordPayload = {
      fleetId: formData.fleetId || "",
      vehicleNumber: formData.vehicleNumber || "",
      seriesType: formData.seriesType || "",
      categoryId: formData.categoryId,
      depotId: formData.depotId || depotOptions[0]?.depotId || "",
      fleetStatus: formData.fleetStatus || "Active",
      nextService: formData.nextService || "",
      docExpiry: formData.docExpiry || "",
      isActive: formData.isActive || true
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
      onDelete(toDelete.fleetId);
    } else {
      setInternalData((prev) => prev.filter((item) => item.fleetId !== toDelete.fleetId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Vehicle register"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add vehicle
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Vehicle Number</Th>
              <Th>Series Type</Th>
              <Th>Category</Th>
              <Th>Home depot</Th>
              <Th>Next Service</Th>
              <Th>Document Expiry</Th>
              <Th>Fleet Status</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: FleetVehicleRecord) => (
              <tr key={item.fleetId} className="stc-row">
                <Td mono>{item.vehicleNumber}</Td>
                <Td>{item.seriesType}</Td>
                <Td>{item.categoryName}</Td>
                <Td mono>{item.depotCode}</Td>
                <Td>{item.nextService}</Td>
                <Td>{item.docExpiry}</Td>
                <Td>{item.fleetStatus}</Td>
                <Td><StatusBadge status={item.isActive ? "Active" : "InActive"} /></Td>
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
                <Td colSpan={9}>No records yet — use Add vehicle to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Vehicle`}
            onClose={() => setModal(null)}
            footer={
              <>
                <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
              </>
            }
          >
            <div className="stc-form-grid">
              <div className="stc-field">
                <label className="stc-field-label">Registration</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.vehicleNumber || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, vehicleNumber: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Series Type</label>
                <select
                  value={formData.seriesType || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, seriesType: e.target.value }))}
                >
                  {["BH", "State"].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Category</label>
                <select
                  value={formData.categoryId || categoryOptions[0]?.categoryId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryId: e.target.value }))}
                >
                  {categoryOptions.map((option) => <option key={option.categoryId} value={option.categoryId}>{option.categoryName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Home depot</label>
                <select
                  value={formData.depotId || depotOptions[0]?.depotId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, depotId: e.target.value }))}
                >
                  {depotOptions.map((option) => <option key={option.depotId} value={option.depotId}>{option.depotCode}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Fleet Status</label>
                <select
                  value={formData.fleetStatus || "Active"}
                  onChange={(e) => setFormData((s) => ({ ...s, fleetStatus: e.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Under maintenance">Under maintenance</option>
                  <option value="Breakdown">Breakdown</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Next service</label>
                <input
                  value={formData.nextService || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, nextService: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Document expiry</label>
                <input
                  value={formData.docExpiry || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, docExpiry: e.target.value }))}
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
          <Modal title="Delete — Vehicle" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.vehicleNumber} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default VehicleRegister;
