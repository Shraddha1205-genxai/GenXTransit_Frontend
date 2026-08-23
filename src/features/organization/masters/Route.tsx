import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Route {
  routeId: string;
  routeCode: string;
  routeName: string;
  service: string;
  fromLocation: string;
  toLocation: string;
  type: string;
  distance: string;
  fareModel: string;
  duration: string;
  isActive: boolean;
}

export interface RoutesPageProps {
  data?: Route[];
  onAdd?: (item: Route) => void;
  onUpdate?: (item: Route) => void;
  onDelete?: (routeId: string) => void;
}

const initialDefaultRoutes: Route[] = [
  { routeId: "R-9502", routeCode: "MSRTC-9502", routeName: "Pune – Mumbai Shivneri (Expressway)", fromLocation: "Pune", toLocation: "Mumbai", service: "ST", type: "Luxury", distance: "150 km", fareModel: "Fixed", duration: "3h 10m", isActive: true },
  { routeId: "R-7714", routeCode: "MSRTC-7714", routeName: "Pune – Nashik ST Express", fromLocation: "Pune", toLocation: "Nashik", service: "ST", type: "Express", distance: "210 km", fareModel: "Distance", duration: "4h 30m", isActive: true },
  { routeId: "R-BEST-A-1", routeCode: "BEST-A-1", routeName: "Colaba – Bandra (via Worli Sea Face)", fromLocation: "Colaba", toLocation: "Bandra", service: "Local", type: "City", distance: "18 km", fareModel: "Distance", duration: "1h 05m", isActive: true },
];

const serviceOptions = ["ST", "Local"];
const typeOptions = ["Luxury", "Express", "Ordinary", "City"];
const fareModelOptions = ["Fixed", "Distance", "Zone"];
const fromLocationOptions = ["Pune", "Mumbai", "Nashik", "Colaba", "Bandra"];
const toLocationOptions = ["Pune", "Mumbai", "Nashik", "Colaba", "Bandra"];

export function Route({ data: propData, onAdd, onUpdate, onDelete }: RoutesPageProps) {
  const [internalData, setInternalData] = useState<Route[]>(initialDefaultRoutes);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Route } | null>(null);
  const [toDelete, setToDelete] = useState<Route | null>(null);
  const [formData, setFormData] = useState<Partial<Route>>({});

  const handleOpenAdd = () => {
    setFormData({ routeCode: "", routeName: "", fromLocation: "", toLocation: "", service: serviceOptions[0], type: typeOptions[0], distance: "", fareModel: fareModelOptions[0], duration: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Route) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.routeCode || !formData.routeName) return;

    const newRecord: Route = {
      routeId: formData.routeId || "",
      routeCode: formData.routeCode || "",
      routeName: formData.routeName || "",
      fromLocation: formData.fromLocation || "",
      toLocation: formData.toLocation || "",
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
              <Th>From Location</Th>
              <Th>To Location</Th>
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
                <Td>{item.fromLocation}</Td>
                <Td>{item.toLocation}</Td>
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
                <label className="stc-field-label">From Location</label>
                <select
                  value={formData.fromLocation || fromLocationOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, fromLocation: e.target.value }))}
                >
                  {fromLocationOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">To Location</label>
                <select
                  value={formData.toLocation || toLocationOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, toLocation: e.target.value }))}
                >
                  {toLocationOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
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
