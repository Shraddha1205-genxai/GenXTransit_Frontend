import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Route {
  routeId: string;
  routeCode: string;
  routeName: string;
  service: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  fromStationId: string;
  fromStationCode: string;
  fromStationName: string;
  toStationId: string;
  toStationCode: string;
  toStationName: string;
  type: string;
  distance: string;
  fareModel: string;
  duration: string;
  isActive: boolean;
}

export interface RoutePayload {
  routeId: string;
  routeCode: string;
  routeName: string;
  service: string;
  regionId: string;
  fromStationId: string;
  toStationId: string;
  type: string;
  distance: string;
  fareModel: string;
  duration: string;
  isActive: boolean;
}

export interface RoutesPageProps {
  data?: Route[];
  stationOptions: { stationId: string; stationCode: string; stationName: string }[];
  regionOptions: { regionId: string; regionCode: string; regionName?: string }[];
  onAdd?: (item: RoutePayload) => void;
  onUpdate?: (item: RoutePayload) => void;
  onDelete?: (routeId: string) => void;
}

const initialDefaultRoutes: Route[] = [
  { routeId: "R-9502", routeCode: "MSRTC-9502", routeName: "Pune – Mumbai Shivneri (Expressway)", regionId: "001", regionCode: "REG-001", regionName: "MSR-0001", fromStationId: "01", fromStationCode: "PUNE-001", fromStationName: "Pune", toStationId: "02", toStationCode: "MUM-001", toStationName: "Mumbai", service: "ST", type: "Luxury", distance: "150 km", fareModel: "Fixed", duration: "3h 10m", isActive: true },
  { routeId: "R-7714", routeCode: "MSRTC-7714", routeName: "Pune – Nashik ST Express", regionId: "001", regionCode: "REG-001", regionName: "MSR-0001", fromStationId: "01", fromStationCode: "PUNE-001", fromStationName: "Pune", toStationId: "03", toStationCode: "NASH-001", toStationName: "Nashik", service: "ST", type: "Express", distance: "210 km", fareModel: "Distance", duration: "4h 30m", isActive: true },
  { routeId: "R-BEST-A-1", routeCode: "BEST-A-1", routeName: "Colaba – Bandra (via Worli Sea Face)", regionId: "002", regionCode: "REG-002", regionName: "MSR-0002", fromStationId: "04", fromStationCode: "COLABA-001", fromStationName: "Colaba", toStationId: "05", toStationCode: "BANDRA-001", toStationName: "Bandra", service: "Local", type: "City", distance: "18 km", fareModel: "Distance", duration: "1h 05m", isActive: true }
];
const serviceOptions = ["ST", "Local"];
const typeOptions = ["Luxury", "Express", "Ordinary", "City"];
const fareModelOptions = ["Fixed", "Distance", "Zone"];
const fromLocationOptions = ["Pune", "Mumbai", "Nashik", "Colaba", "Bandra"];
const toLocationOptions = ["Pune", "Mumbai", "Nashik", "Colaba", "Bandra"];

export function Route({ data: propData, stationOptions, regionOptions, onAdd, onUpdate, onDelete }: RoutesPageProps) {
  const [internalData, setInternalData] = useState<Route[]>(initialDefaultRoutes);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Route } | null>(null);
  const [toDelete, setToDelete] = useState<Route | null>(null);
  const [formData, setFormData] = useState<Partial<Route>>({});

  const handleOpenAdd = () => {
    setFormData({ routeCode: "", routeName: "", regionId: "", fromStationId: "", toStationId: "", service: serviceOptions[0], type: typeOptions[0], distance: "", fareModel: fareModelOptions[0], duration: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Route) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.routeCode || !formData.routeName) return;

    const newRecord: RoutePayload = {
      routeId: formData.routeId || "",
      routeCode: formData.routeCode || "",
      routeName: formData.routeName || "",
      regionId: formData.regionId || "",
      fromStationId: formData.fromStationId || "",
      toStationId: formData.toStationId || "",
      service: formData.service || serviceOptions[0],
      type: formData.type || typeOptions[0],
      distance: formData.distance || "",
      fareModel: formData.fareModel || fareModelOptions[0],
      duration: formData.duration || "",
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
        setInternalData((prev) => prev.map((item) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.routeId);
    } else {
      setInternalData((prev) => prev.filter((item) => item.routeId !== toDelete.routeId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Routes"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add route
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Route</Th>
              <Th>Service</Th>
              <Th>Region</Th>
              <Th>From Station</Th>
              <Th>To Station</Th>
              <Th>Type</Th>
              <Th>Distance</Th>
              <Th>Fare model</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Route) => (
              <tr key={item.routeCode} className="stc-row">
                <Td mono>
                  <div>
                    <RouteChip>{item.routeCode}</RouteChip>
                    <div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>{item.routeName}</div>
                  </div>
                </Td>
                <Td>{item.service}</Td>
                <Td>{item.regionName}</Td>
                <Td>{item.fromStationName}</Td>
                <Td>{item.toStationName}</Td>
                <Td>{item.type}</Td>
                <Td>{item.distance}</Td>
                <Td>{item.fareModel}</Td>
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
                <Td colSpan={8}>No records yet — use Add route to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Routes`}
            subtitle={modal.mode === "add" ? "Create a new route" : "Update route details"}
            onClose={() => setModal(null)}
            width={640}
            footer={
              <>
                <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
              </>
            }
          >
            <div className="stc-form-grid">
              {modal.mode == "edit" && (<div className="stc-field">
                <label className="stc-field-label">Route code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.routeCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.routeName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Service</label>
                <select
                  value={formData.service || serviceOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, service: e.target.value }))}
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Region</label>
                <select
                  value={formData.regionId}
                  onChange={(e) => setFormData((s) => ({ ...s, regionId: e.target.value }))}
                >
                  {regionOptions.map((opt) => (
                    <option key={opt.regionId} value={opt.regionId}>{opt.regionName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">From Station</label>
                <select
                  value={formData.fromStationId}
                  onChange={(e) => setFormData((s) => ({ ...s, fromStationId: e.target.value }))}
                >
                  {stationOptions.map((opt) => (
                    <option key={opt.stationId} value={opt.stationId}>{opt.stationName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">To Station</label>
                <select
                  value={formData.toStationId}
                  onChange={(e) => setFormData((s) => ({ ...s, toStationId: e.target.value }))}
                >
                  {stationOptions.map((opt) => (
                    <option key={opt.stationId} value={opt.stationId}>{opt.stationName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Type</label>
                <select
                  value={formData.type || typeOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
                >
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Distance</label>
                <input
                  value={formData.distance || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, distance: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Fare model</label>
                <select
                  value={formData.fareModel || fareModelOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, fareModel: e.target.value }))}
                >
                  {fareModelOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Duration</label>
                <input
                  value={formData.duration || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, duration: e.target.value }))}
                />
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
          <Modal title="Delete — Route" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.routeName} from the list. This can't be undone
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Route;
