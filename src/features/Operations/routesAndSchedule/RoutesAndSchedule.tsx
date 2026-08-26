import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, SectionHeader, Table, Modal } from "../../../components/common";

export interface TripRecord {
  tripId: string;
  tripCode: string;
  routeId: string;
  routeName: string;
  routeCode: string;
  fleetId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  conductorId: string;
  conductorName: string;
  sched: string;
  actual: string;
  fleetStatus: string;
  isActive: boolean;
}
export interface TripRecordPayload {
  tripId: string;
  tripName: string;
  routeId: string;
  fleetId: string;
  driverId: string;
  conductorId: string;
  sched: string;
  actual: string;
  fleetStatus: string;
  isActive: boolean;
}
interface RoutesAndScheduleProps {
  routes: {routeId: string; routeName: string; routeCode: string;}[];
  fleetOptions: {fleetId: string; vehicleNumber: string;}[];
  driverOptions: {empId: string; empName: string; empCode: string; role: string;}[];
  conductorOptions: {empId: string; empName: string; empCode: string}[];
  trips: TripRecord[];
  onAdd?: (item: TripRecordPayload) => void;
  onUpdate?: (item: TripRecordPayload) => void;
  onDelete?: (id: string) => void;
}

const FLEET_STATUSES = ["On time", "Delayed", "Cancelled", "Ongoing"];

export function RoutesAndSchedule({ routes = [], fleetOptions = [], driverOptions = [], conductorOptions = [], trips = [], onAdd, onUpdate, onDelete }: RoutesAndScheduleProps) {
  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: TripRecord } | null>(null);
  const [toDelete, setToDelete] = useState<TripRecord | null>(null);
  const [formData, setFormData] = useState<Partial<TripRecord>>({});

  const handleOpenAdd = () => {
    setFormData({
      tripId: "",
      tripCode: "",
      routeId: routes[0]?.routeId || "MSRTC-9502",
      fleetId: fleetOptions[0]?.fleetId || "",
      driverId: driverOptions[0]?.empId || "",
      conductorId: conductorOptions[0]?.empId || "",
      sched: "12:00",
      actual: "",
      fleetStatus: FLEET_STATUSES[0],
      isActive: true
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (item: TripRecord) => {
    setFormData({ ...item });
    setModal({ mode: "edit", record: item });
  };

  const handleSave = () => {
    if (!formData.routeId) return;
    const record = formData as TripRecordPayload;
    if (modal?.mode === "add") {
      if (onAdd) onAdd(record);
    } else if (modal?.mode === "edit") {
      if (onUpdate) onUpdate(record);
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (toDelete && onDelete) {
      onDelete(toDelete.tripId);
    }
    setToDelete(null);
  };

  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ROUTE · TBL_MAST_TIMETABLE · TBL_TRANS_TRIP" title="Routes & schedule" />
      
      <Card
        title="Today's trips"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add trip
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Trip</Th>
              <Th>Route</Th>
              <Th>Vehicle Number</Th>
              <Th>Crew</Th>
              <Th>Sched.</Th>
              <Th>Fleet Status</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t: TripRecord) => (
              <tr key={t.tripId} className="stc-row">
                <Td mono><RouteChip>{t.tripCode}</RouteChip></Td>
                <Td mono>{t.routeName}</Td>
                <Td>{t.vehicleNumber}</Td>
                <Td>{t.driverName}<div style={{ fontSize: 11, color: T.textSoft }}>{t.conductorName}</div></Td>
                <Td>{t.sched}<div style={{ fontSize: 11, color: T.textSoft }}>Actual {t.actual}</div></Td>
                <Td><StatusBadge status={t.fleetStatus} /></Td>
                <Td><StatusBadge status={t.isActive ? "Active" : "InActive"} /></Td>
                <Td align="right">
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => handleOpenEdit(t)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(t)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} — Trip`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="stc-btn stc-btn-primary" onClick={handleSave}>Save changes</button>
            </>
          }
        >
          <div className="stc-form-grid">
            {modal.mode == "edit" && (<div className="stc-field">
              <label className="stc-field-label">Trip Code</label>
              <input
                disabled={modal.mode === "edit"}
                value={formData.tripCode || ""}
                onChange={(e) => setFormData((s) => ({ ...s, tripCode: e.target.value }))}
              />
            </div>)}
            <div className="stc-field">
              <label className="stc-field-label">Route</label>
              <select
                value={formData.routeId || ""}
                onChange={(e) => setFormData((s) => ({ ...s, route: e.target.value }))}
              >
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>{r.routeCode} — {r.routeName}</option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Driver</label>
              <select
                value={formData.driverId || ""}
                onChange={(e) => setFormData((s) => ({ ...s, driverId: e.target.value }))}
              >
                {driverOptions.map((r) => (
                  <option key={r.empId} value={r.empId}>{r.empCode} — {r.empName}</option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Conductor</label>
              <select
                value={formData.conductorId || ""}
                onChange={(e) => setFormData((s) => ({ ...s, conductorId: e.target.value }))}
              >
                {conductorOptions.map((r) => (
                  <option key={r.empId} value={r.empId}>{r.empCode} — {r.empName}</option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Scheduled Time</label>
              <input
                value={formData.sched || ""}
                onChange={(e) => setFormData((s) => ({ ...s, sched: e.target.value }))}
                placeholder="e.g. 14:30"
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Actual Time</label>
              <input
                value={formData.actual || ""}
                onChange={(e) => setFormData((s) => ({ ...s, actual: e.target.value }))}
                placeholder="e.g. 14:33 or —"
              />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Fleet Status</label>
              <select
                value={formData.fleetStatus || ""}
                onChange={(e) => setFormData((s) => ({ ...s, fleetStatus: e.target.value }))}
              >
                {FLEET_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
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
        <Modal
          title="Delete — Trip"
          subtitle="This action cannot be undone"
          icon={<Trash2 size={20} color={T.red} />}
          iconVariant="danger"
          onClose={() => setToDelete(null)}
          width={420}
          footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }
        >
          <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
            This will permanently remove trip <strong>{toDelete.tripCode}</strong> from the schedule. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default RoutesAndSchedule;
