import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, SectionHeader, Table, Modal } from "../../../components/common";

export interface RouteRecord {
  code: string;
  name: string;
  service: string;
  type: string;
  distance: string;
  fareModel: string;
}

export interface TripRecord {
  id: string;
  route: string;
  driver: string;
  conductor: string;
  sched: string;
  actual: string;
  status: string;
}

interface RoutesAndScheduleProps {
  routes: RouteRecord[];
  trips: TripRecord[];
  onAdd?: (item: TripRecord) => void;
  onUpdate?: (item: TripRecord) => void;
  onDelete?: (id: string) => void;
}

const STATUSES = ["On time", "Delayed", "Cancelled", "Ongoing"];

export function RoutesAndSchedule({ routes = [], trips = [], onAdd, onUpdate, onDelete }: RoutesAndScheduleProps) {
  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: TripRecord } | null>(null);
  const [toDelete, setToDelete] = useState<TripRecord | null>(null);
  const [formData, setFormData] = useState<Partial<TripRecord>>({});

  const handleOpenAdd = () => {
    setFormData({
      id: `TRP-${Math.floor(90000 + Math.random() * 10000)}`,
      route: routes[0]?.code || "MSRTC-9502",
      driver: "",
      conductor: "",
      sched: "12:00",
      actual: "—",
      status: STATUSES[0],
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (item: TripRecord) => {
    setFormData({ ...item });
    setModal({ mode: "edit", record: item });
  };

  const handleSave = () => {
    if (!formData.route) return;
    const record = formData as TripRecord;
    if (modal?.mode === "add") {
      if (onAdd) onAdd(record);
    } else if (modal?.mode === "edit") {
      if (onUpdate) onUpdate(record);
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (toDelete && onDelete) {
      onDelete(toDelete.id);
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
              <Th>Crew</Th>
              <Th>Sched.</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t: TripRecord) => (
              <tr key={t.id} className="stc-row">
                <Td mono><RouteChip>{t.id}</RouteChip></Td>
                <Td mono>{t.route}</Td>
                <Td>{t.driver}<div style={{ fontSize: 11, color: T.textSoft }}>{t.conductor}</div></Td>
                <Td>{t.sched}<div style={{ fontSize: 11, color: T.textSoft }}>Actual {t.actual}</div></Td>
                <Td><StatusBadge status={t.status} /></Td>
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
            <div className="stc-field mb-6">
              <label className="stc-field-label">Trip ID</label>
              <input
                disabled={modal.mode === "edit"}
                value={formData.id || ""}
                onChange={(e) => setFormData((s) => ({ ...s, id: e.target.value }))}
              />
            </div>
            <div className="stc-field mb-6">
              <label className="stc-field-label">Route</label>
              <select
                value={formData.route || ""}
                onChange={(e) => setFormData((s) => ({ ...s, route: e.target.value }))}
              >
                {routes.map((r: RouteRecord) => (
                  <option key={r.code} value={r.code}>{r.code} — {r.name}</option>
                ))}
              </select>
            </div>
            <div className="stc-field mb-6">
              <label className="stc-field-label">Driver</label>
              <input
                value={formData.driver || ""}
                onChange={(e) => setFormData((s) => ({ ...s, driver: e.target.value }))}
                placeholder="e.g. S. Jadhav"
              />
            </div>
            <div className="stc-field mb-6">
              <label className="stc-field-label">Conductor</label>
              <input
                value={formData.conductor || ""}
                onChange={(e) => setFormData((s) => ({ ...s, conductor: e.target.value }))}
                placeholder="e.g. R. Kulkarni"
              />
            </div>
            <div className="stc-field mb-6">
              <label className="stc-field-label">Scheduled Time</label>
              <input
                value={formData.sched || ""}
                onChange={(e) => setFormData((s) => ({ ...s, sched: e.target.value }))}
                placeholder="e.g. 14:30"
              />
            </div>
            <div className="stc-field mb-6">
              <label className="stc-field-label">Actual Time</label>
              <input
                value={formData.actual || ""}
                onChange={(e) => setFormData((s) => ({ ...s, actual: e.target.value }))}
                placeholder="e.g. 14:33 or —"
              />
            </div>
            <div className="stc-field mb-6">
              <label className="stc-field-label">Status</label>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value }))}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
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
            This will permanently remove trip <strong>{toDelete.id}</strong> from the schedule. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default RoutesAndSchedule;
