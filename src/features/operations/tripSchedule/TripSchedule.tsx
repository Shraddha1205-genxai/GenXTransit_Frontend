import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  RouteChip,
  StatusBadge,
  Th,
  Td,
  SectionHeader,
  Table,
  Modal,
  TableToolbar,
} from "../../../components/common";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  tripService,
  type TripRecord,
  type CreateTripDto,
  type UpdateTripDto,
} from "../../../api/operations/tripSchedule/tripService";
import { depotService } from "../../../api/organization/organizationManagement/depotService";
import { routeService } from "../../../api/organization/master/routeService";
import { fleetService } from "../../../api/operations/fleet/fleetService";
import { driverConductorService } from "../../../api/operations/tripSchedule/driverConductorService";

export type { TripRecord, CreateTripDto, UpdateTripDto };

const TRIP_STATUSES = ["Scheduled", "OnTime", "Delayed", "Completed", "Cancelled"];

const formatTimeForInput = (timeStr?: string) => {
  if (!timeStr) return "";
  if (timeStr.includes(" ")) {
    const parts = timeStr.split(" ");
    if (parts[1]) return parts[1].substring(0, 5);
  }
  if (timeStr.includes("T")) {
    const parts = timeStr.split("T");
    if (parts[1]) return parts[1].substring(0, 5);
  }
  return timeStr.substring(0, 5);
};

export interface TripScheduleProps {
  data?: TripRecord[];
  routes?: { routeId: string; routeName: string; routeCode: string }[];
  fleetOptions?: { fleetId: string; vehicleNumber: string }[];
  driverOptions?: { empId: string; empName: string; empCode: string; role: string }[];
  conductorOptions?: { empId: string; empName: string; empCode: string }[];
  trips?: TripRecord[];
  onAdd?: (item: CreateTripDto) => void;
  onUpdate?: (item: UpdateTripDto) => void;
  onDelete?: (id: string) => void;
}

export function TripSchedule({
  data: propData,
  onAdd,
  onUpdate,
  onDelete,
}: TripScheduleProps = {}) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [depotFilter, setDepotFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [fleetFilter, setFleetFilter] = useState("");
  const [tripStatusFilter, setTripStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: TripRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<TripRecord | null>(null);
  const [formData, setFormData] = useState<Partial<TripRecord>>({});

  // Fetch Depots for dropdowns
  const { data: apiDepots = [] } = useQuery({
    queryKey: ["depots", true],
    queryFn: () => depotService.getAll(undefined, undefined, undefined, undefined, undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Routes for dropdowns
  const { data: apiRoutes = [] } = useQuery({
    queryKey: ["routes", true],
    queryFn: () => routeService.getAll(undefined, undefined, undefined, true, 1, 100),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Fleet Vehicles for dropdowns
  const { data: apiFleet = [] } = useQuery({
    queryKey: ["fleetVehicles", true],
    queryFn: () => fleetService.getAll(undefined, undefined, undefined, undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Drivers for selected depot via /api/driverconductoravailability/driver-conductor
  const { data: driverOptions = [] } = useQuery({
    queryKey: ["driverConductorAvailability", "Driver", formData.depotId],
    queryFn: () =>
      driverConductorService.getDriverConductor({
        roleName: "Driver",
        depotId: formData.depotId || undefined,
      }),
    staleTime: 0,
  });

  // Fetch Conductors for selected depot via /api/driverconductoravailability/driver-conductor
  const { data: conductorOptions = [] } = useQuery({
    queryKey: ["driverConductorAvailability", "Conductor", formData.depotId],
    queryFn: () =>
      driverConductorService.getDriverConductor({
        roleName: "Conductor",
        depotId: formData.depotId || undefined,
      }),
    staleTime: 0,
  });

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  // Fetch Trips API
  const {
    data: apiTrips = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "trips",
      debouncedSearch,
      depotFilter,
      routeFilter,
      fleetFilter,
      tripStatusFilter,
      statusFilter,
    ],
    queryFn: () =>
      tripService.getAll(
        debouncedSearch || undefined,
        depotFilter || undefined,
        routeFilter || undefined,
        fleetFilter || undefined,
        tripStatusFilter || undefined,
        undefined,
        undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const tripsList = propData || apiTrips;

  const addMutation = useMutation({
    mutationFn: (dto: CreateTripDto) => tripService.insert(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success(res?.message || "Trip schedule added successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add trip schedule.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: UpdateTripDto) => tripService.update(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success(res?.message || "Trip schedule updated successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update trip schedule.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tripId: string) => tripService.delete({ tripId }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success(res?.message || "Trip schedule deleted successfully.");
      setToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete trip schedule.");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      tripId: "",
      tripCode: "",
      routeId: "",
      depotId: "",
      fleetId: "",
      driverId: "",
      conductorId: "",
      scheduleTime: "15:30",
      actualTime: "15:30",
      tripStatus: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (item: TripRecord) => {
    setFormData({ ...item });
    setModal({ mode: "edit", record: item });
  };

  const handleSave = () => {
    if (!formData.routeId || !formData.depotId || !formData.fleetId || !formData.tripStatus) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (modal?.mode === "add") {
      const payload: CreateTripDto = {
        routeId: String(formData.routeId),
        depotId: String(formData.depotId),
        fleetId: String(formData.fleetId),
        driverId: String(formData.driverId || "1"),
        conductorId: String(formData.conductorId || "1"),
        scheduleTime: formData.scheduleTime || "15:30",
        actualTime: formData.actualTime || "15:30",
        tripStatus: formData.tripStatus,
      };

      if (onAdd) {
        onAdd(payload);
        setModal(null);
      } else {
        addMutation.mutate(payload);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      const payload: UpdateTripDto = {
        tripId: String(formData.tripId || modal.record.tripId),
        routeId: String(formData.routeId),
        depotId: String(formData.depotId),
        fleetId: String(formData.fleetId),
        driverId: String(formData.driverId || modal.record.driverId || "1"),
        conductorId: String(formData.conductorId || modal.record.conductorId || "1"),
        scheduleTime: formData.scheduleTime || modal.record.scheduleTime || "15:30",
        actualTime: formData.actualTime || modal.record.actualTime || "15:30",
        tripStatus: formData.tripStatus,
      };

      if (onUpdate) {
        onUpdate(payload);
        setModal(null);
      } else {
        updateMutation.mutate(payload);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.tripId) return;
    if (onDelete) {
      onDelete(toDelete.tripId);
      setToDelete(null);
    } else {
      deleteMutation.mutate(String(toDelete.tripId));
    }
  };

  const renderTripStatusBadge = (status: string) => {
    switch (status) {
      case "OnTime":
        return <StatusBadge status="On time" />;
      case "Scheduled":
        return <StatusBadge status="Pending verification" />;
      case "Delayed":
        return <StatusBadge status="Delayed" />;
      case "Completed":
        return <StatusBadge status="Active" />;
      case "Cancelled":
        return <StatusBadge status="Cancelled" />;
      default:
        return <StatusBadge status={status || "Draft"} />;
    }
  };

  const routeMap = new Map(apiRoutes.map((r) => [String(r.routeId), r.routeName || r.routeCode]));
  const depotMap = new Map(apiDepots.map((d) => [String(d.depotId), d.depotName || d.depotCode]));
  const fleetMap = new Map(apiFleet.map((f) => [String(f.fleetId), f.vehicleNumber]));

  return (
    <div>
      <SectionHeader
        eyebrow="TBL_MAST_ROUTE · TBL_MAST_TIMETABLE · TBL_TRANS_TRIP"
        title="Trip Schedule"
      />

      <Card
        title="Trips"
        action={
          <button
            onClick={handleOpenAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: T.amberDeep,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={13} /> Add trip
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search trip code, route, vehicle..."
          filters={[
            {
              key: "depot",
              label: "Depot",
              value: depotFilter,
              onChange: setDepotFilter,
              options: apiDepots.map((dep) => ({
                value: String(dep.depotId),
                label: dep.depotName || dep.depotCode,
              })),
            },
            {
              key: "route",
              label: "Route",
              value: routeFilter,
              onChange: setRouteFilter,
              options: apiRoutes.map((r) => ({
                value: String(r.routeId),
                label: `${r.routeCode} — ${r.routeName}`,
              })),
            },
            {
              key: "fleet",
              label: "Vehicle / Fleet",
              value: fleetFilter,
              onChange: setFleetFilter,
              options: apiFleet.map((fl) => ({
                value: String(fl.fleetId),
                label: `${fl.vehicleNumber} (ID: ${fl.fleetId})`,
              })),
            },
            {
              key: "tripStatus",
              label: "Trip Status",
              value: tripStatusFilter,
              onChange: setTripStatusFilter,
              options: TRIP_STATUSES.map((st) => ({
                value: st,
                label: st === "OnTime" ? "On Time" : st,
              })),
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Both", label: "Both" },
              ],
            },
          ]}
        />

        <Table>
          <thead>
            <tr>
              <Th>Trip</Th>
              <Th>Route</Th>
              <Th>Depot</Th>
              <Th>Vehicle Number</Th>
              <Th>Crew</Th>
              <Th>Sched / Actual</Th>
              <Th>Trip Status</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={9}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.textSoft,
                      padding: 16,
                    }}
                  >
                    Loading trip schedules...
                  </div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={9}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.red,
                      padding: 16,
                    }}
                  >
                    Failed to load trip schedules.
                  </div>
                </Td>
              </tr>
            ) : tripsList.length === 0 ? (
              <tr>
                <Td colSpan={9}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.textSoft,
                      padding: 16,
                    }}
                  >
                    No trip schedule records found.
                  </div>
                </Td>
              </tr>
            ) : (
              tripsList.map((t: TripRecord) => {
                const routeDisplayName =
                  t.routeName ||
                  (t.routeCode ? `${t.routeCode} — ${t.routeName}` : "") ||
                  routeMap.get(String(t.routeId)) ||
                  t.routeId;
                const depotDisplayName =
                  t.depotName ||
                  t.depotCode ||
                  depotMap.get(String(t.depotId)) ||
                  t.depotId;
                const vehicleDisplayName =
                  t.vehicleNumber ||
                  fleetMap.get(String(t.fleetId)) ||
                  t.fleetId;

                return (
                  <tr key={t.tripId} className="stc-row">
                    <Td mono>
                      <RouteChip>{t.tripCode || `TR-${t.tripId}`}</RouteChip>
                    </Td>
                    <Td mono>{routeDisplayName}</Td>
                    <Td>{depotDisplayName}</Td>
                    <Td>
                      <strong style={{ fontWeight: 600 }}>
                        {vehicleDisplayName}
                      </strong>
                    </Td>
                    <Td>
                      <div>{t.driverName || "Driver 1"}</div>
                      <div style={{ fontSize: 11, color: T.textSoft }}>
                        {t.conductorName || "Conductor 1"}
                      </div>
                    </Td>
                    <Td>
                      <div>{t.scheduleTime || "15:30"}</div>
                      <div style={{ fontSize: 11, color: T.textSoft }}>
                        Actual {t.actualTime || "15:30"}
                      </div>
                    </Td>
                    <Td>
                      {renderTripStatusBadge(t.tripStatus)}
                    </Td>
                    <Td>
                      <StatusBadge status={t.isActive ? "Active" : "Inactive"} />
                    </Td>
                    <Td align="right">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() => handleOpenEdit(t)}
                          title="Edit trip"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex",
                          }}
                        >
                          <Pencil size={14} color={T.textSoft} />
                        </button>
                        <button
                          onClick={() => setToDelete(t)}
                          title="Delete trip"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex",
                          }}
                        >
                          <Trash2 size={14} color={T.red} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Card>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} — Trip Schedule`}
          subtitle={
            modal.mode === "add"
              ? "Schedule a new trip entry"
              : "Update trip schedule details"
          }
          onClose={() => setModal(null)}
          width={640}
          footer={
            <>
              <button
                className="stc-btn stc-btn-ghost"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className="stc-btn stc-btn-primary"
                onClick={handleSave}
              >
                Save changes
              </button>
            </>
          }
        >
          <div className="stc-form-grid">
            {modal.mode === "edit" && (
              <div className="stc-field">
                <label className="stc-field-label">Trip Code</label>
                <input
                  disabled
                  value={formData.tripCode || ""}
                />
              </div>
            )}

            <div className="stc-field">
              <label className="stc-field-label">Route</label>
              <select
                value={formData.routeId || ""}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, routeId: e.target.value }))
                }
              >
                <option value="">Select Route</option>
                {apiRoutes.map((r) => (
                  <option key={r.routeId} value={String(r.routeId)}>
                    {r.routeCode} — {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Depot</label>
              <select
                value={formData.depotId || ""}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, depotId: e.target.value }))
                }
              >
                <option value="">Select Depot</option>
                {apiDepots.map((d) => (
                  <option key={d.depotId} value={String(d.depotId)}>
                    {d.depotName || d.depotCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Vehicle / Fleet</label>
              <select
                value={formData.fleetId || ""}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, fleetId: e.target.value }))
                }
              >
                <option value="">Select Vehicle / Fleet</option>
                {apiFleet.map((fl) => (
                  <option key={fl.fleetId} value={String(fl.fleetId)}>
                    {fl.vehicleNumber} (ID: {fl.fleetId})
                  </option>
                ))}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Driver</label>
              <select
                value={formData.driverId || ""}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, driverId: e.target.value }))
                }
              >
                <option value="">Select Driver</option>
                {driverOptions.map((user) => {
                  const displayName =
                    user.firstName || user.lastName
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.userName;
                  return (
                    <option key={user.userId} value={String(user.userId)}>
                      {displayName} (ID: {user.userId})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Conductor</label>
              <select
                value={formData.conductorId || ""}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, conductorId: e.target.value }))
                }
              >
                <option value="">Select Conductor</option>
                {conductorOptions.map((user) => {
                  const displayName =
                    user.firstName || user.lastName
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.userName;
                  return (
                    <option key={user.userId} value={String(user.userId)}>
                      {displayName} (ID: {user.userId})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Scheduled Time</label>
              <input
                type="time"
                value={formatTimeForInput(formData.scheduleTime)}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, scheduleTime: e.target.value }))
                }
              />
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Actual Time</label>
              <input
                type="time"
                value={formatTimeForInput(formData.actualTime)}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, actualTime: e.target.value }))
                }
              />
            </div>

            <div className="stc-field">
              <label className="stc-field-label">Trip Status</label>
              <select
                value={formData.tripStatus || ""}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, tripStatus: e.target.value }))
                }
              >
                <option value="">Select Trip Status</option>
                {TRIP_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === "OnTime" ? "On Time" : st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
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
              <button
                className="stc-btn stc-btn-ghost"
                onClick={() => setToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="stc-btn stc-btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <p
            style={{
              fontSize: 14,
              color: T.textSoft,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            This will permanently remove trip{" "}
            <strong>{toDelete.tripCode || toDelete.tripId}</strong> from the schedule.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default TripSchedule;
