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
import { usePermissions } from "../../../hooks/usePermissions";

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
  const { canAdd, canEdit, canDelete } = usePermissions("Trip Schedule");

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
    queryKey: ["driverConductorAvailability", "Driver", formData.depotId || ""],
    queryFn: () =>
      driverConductorService.getDriverConductor({
        roleName: "Driver",
        depotId: formData.depotId || undefined,
      }),
    enabled: modal !== null,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Conductors for selected depot via /api/driverconductoravailability/driver-conductor
  const { data: conductorOptions = [] } = useQuery({
    queryKey: ["driverConductorAvailability", "Conductor", formData.depotId || ""],
    queryFn: () =>
      driverConductorService.getDriverConductor({
        roleName: "Conductor",
        depotId: formData.depotId || undefined,
      }),
    enabled: modal !== null,
    staleTime: 5 * 60 * 1000,
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      tripId: "",
      tripCode: "",
      routeId: "",
      depotId: "",
      fleetId: "",
      driverId: "",
      conductorId: "",
      scheduleTime: "",
      actualTime: "",
      tripStatus: "",
      isActive: true,
    });
    setFormErrors({});
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (item: TripRecord) => {
    setFormData({
      ...item,
      routeId: item.routeId ? String(item.routeId) : "",
      depotId: item.depotId ? String(item.depotId) : "",
      fleetId: item.fleetId ? String(item.fleetId) : "",
      driverId: item.driverId ? String(item.driverId) : "",
      conductorId: item.conductorId ? String(item.conductorId) : "",
    });
    setFormErrors({});
    setModal({ mode: "edit", record: item });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!formData.routeId) {
      errors.routeId = "Please select a Route.";
    }
    if (!formData.depotId) {
      errors.depotId = "Please select a Depot.";
    }
    if (!formData.fleetId) {
      errors.fleetId = "Please select a Vehicle / Fleet.";
    }
    if (!formData.driverId) {
      errors.driverId = "Please select a Driver.";
    }
    if (!formData.conductorId) {
      errors.conductorId = "Please select a Conductor.";
    }
    if (!(formData.scheduleTime || "").trim()) {
      errors.scheduleTime = "Scheduled Time is required.";
    }
    if (!formData.tripStatus) {
      errors.tripStatus = "Please select a Trip Status.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill required fields.");
      return;
    }
    setFormErrors({});

    if (modal?.mode === "add") {
      const payload: CreateTripDto = {
        routeId: String(formData.routeId),
        depotId: String(formData.depotId),
        fleetId: String(formData.fleetId),
        driverId: String(formData.driverId!),
        conductorId: String(formData.conductorId!),
        scheduleTime: formData.scheduleTime!,
        actualTime: formData.actualTime || formData.scheduleTime!,
        tripStatus: formData.tripStatus!,
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
        driverId: String(formData.driverId || modal.record.driverId),
        conductorId: String(formData.conductorId || modal.record.conductorId),
        scheduleTime: (formData.scheduleTime || modal.record.scheduleTime)!,
        actualTime: (formData.actualTime || modal.record.actualTime || formData.scheduleTime || modal.record.scheduleTime)!,
        tripStatus: formData.tripStatus!,
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
          canAdd ? (
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
          ) : undefined
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
                label: `${fl.vehicleNumber}`,
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
                        {canEdit && (
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
                        )}
                        {canDelete && (
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
                        )}
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
              <label className="stc-field-label">
                Route <span style={{ color: T.red }}>*</span>
              </label>
              <select
                style={{ borderColor: formErrors.routeId ? T.red : undefined }}
                value={formData.routeId || ""}
                onChange={(e) => {
                  setFormData((s) => ({ ...s, routeId: e.target.value }));
                  if (formErrors.routeId) setFormErrors((prev) => ({ ...prev, routeId: "" }));
                }}
              >
                <option value="">Select Route</option>
                {formData.routeId &&
                  !apiRoutes.some(
                    (r) => String(r.routeId) === String(formData.routeId)
                  ) && (
                    <option value={String(formData.routeId)}>
                      {formData.routeName || `Route (ID: ${formData.routeId})`}
                    </option>
                  )}
                {apiRoutes.map((r) => (
                  <option key={r.routeId} value={String(r.routeId)}>
                    {r.routeCode} — {r.routeName}
                  </option>
                ))}
              </select>
              {formErrors.routeId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.routeId}</span>}
            </div>

            <div className="stc-field">
              <label className="stc-field-label">
                Depot <span style={{ color: T.red }}>*</span>
              </label>
              <select
                style={{ borderColor: formErrors.depotId ? T.red : undefined }}
                value={formData.depotId ? String(formData.depotId) : ""}
                onChange={(e) => {
                  const newDepotId = e.target.value;
                  setFormData((s) => ({
                    ...s,
                    depotId: newDepotId,
                    driverId: "",
                    driverName: "",
                    conductorId: "",
                    conductorName: "",
                  }));
                  if (formErrors.depotId) setFormErrors((prev) => ({ ...prev, depotId: "" }));
                }}
              >
                <option value="">Select Depot</option>
                {formData.depotId &&
                  !apiDepots.some(
                    (d) => String(d.depotId) === String(formData.depotId)
                  ) && (
                    <option value={String(formData.depotId)}>
                      {formData.depotName || `Depot (ID: ${formData.depotId})`}
                    </option>
                  )}
                {apiDepots.map((d) => (
                  <option key={d.depotId} value={String(d.depotId)}>
                    {d.depotName || d.depotCode}
                  </option>
                ))}
              </select>
              {formErrors.depotId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.depotId}</span>}
            </div>

            <div className="stc-field">
              <label className="stc-field-label">
                Vehicle / Fleet <span style={{ color: T.red }}>*</span>
              </label>
              <select
                style={{ borderColor: formErrors.fleetId ? T.red : undefined }}
                value={formData.fleetId ? String(formData.fleetId) : ""}
                onChange={(e) => {
                  setFormData((s) => ({ ...s, fleetId: e.target.value }));
                  if (formErrors.fleetId) setFormErrors((prev) => ({ ...prev, fleetId: "" }));
                }}
              >
                <option value="">Select Vehicle / Fleet</option>
                {formData.fleetId &&
                  !apiFleet.some(
                    (fl) => String(fl.fleetId) === String(formData.fleetId)
                  ) && (
                    <option value={String(formData.fleetId)}>
                      {formData.vehicleNumber || `Vehicle (ID: ${formData.fleetId})`}
                    </option>
                  )}
                {apiFleet.map((fl) => (
                  <option key={fl.fleetId} value={String(fl.fleetId)}>
                    {fl.vehicleNumber}
                  </option>
                ))}
              </select>
              {formErrors.fleetId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.fleetId}</span>}
            </div>

            <div className="stc-field">
              <label className="stc-field-label">
                Driver <span style={{ color: T.red }}>*</span>
              </label>
              <select
                style={{ borderColor: formErrors.driverId ? T.red : undefined }}
                value={formData.driverId ? String(formData.driverId) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = driverOptions.find((u) => String(u.userId) === val);
                  const name = found
                    ? (found.firstName || found.lastName
                        ? `${found.firstName} ${found.lastName}`.trim()
                        : found.userName)
                    : undefined;
                  setFormData((s) => ({
                    ...s,
                    driverId: val,
                    driverName: name || s.driverName,
                  }));
                  if (formErrors.driverId) setFormErrors((prev) => ({ ...prev, driverId: "" }));
                }}
              >
                <option value="">Select Driver</option>
                {formData.driverId &&
                  !driverOptions.some(
                    (u) => String(u.userId) === String(formData.driverId)
                  ) && (
                    <option value={String(formData.driverId)}>
                      {formData.driverName ||
                        (modal?.record?.driverId === String(formData.driverId)
                          ? modal.record.driverName
                          : "") ||
                        `Driver (ID: ${formData.driverId})`}
                    </option>
                  )}
                {driverOptions.map((user) => {
                  const displayName =
                    user.firstName || user.lastName
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.userName;
                  return (
                    <option key={user.userId} value={String(user.userId)}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              {formErrors.driverId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.driverId}</span>}
            </div>

            <div className="stc-field">
              <label className="stc-field-label">
                Conductor <span style={{ color: T.red }}>*</span>
              </label>
              <select
                style={{ borderColor: formErrors.conductorId ? T.red : undefined }}
                value={formData.conductorId ? String(formData.conductorId) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = conductorOptions.find((u) => String(u.userId) === val);
                  const name = found
                    ? (found.firstName || found.lastName
                        ? `${found.firstName} ${found.lastName}`.trim()
                        : found.userName)
                    : undefined;
                  setFormData((s) => ({
                    ...s,
                    conductorId: val,
                    conductorName: name || s.conductorName,
                  }));
                  if (formErrors.conductorId) setFormErrors((prev) => ({ ...prev, conductorId: "" }));
                }}
              >
                <option value="">Select Conductor</option>
                {formData.conductorId &&
                  !conductorOptions.some(
                    (u) => String(u.userId) === String(formData.conductorId)
                  ) && (
                    <option value={String(formData.conductorId)}>
                      {formData.conductorName ||
                        (modal?.record?.conductorId === String(formData.conductorId)
                          ? modal.record.conductorName
                          : "") ||
                        `Conductor (ID: ${formData.conductorId})`}
                    </option>
                  )}
                {conductorOptions.map((user) => {
                  const displayName =
                    user.firstName || user.lastName
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.userName;
                  return (
                    <option key={user.userId} value={String(user.userId)}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              {formErrors.conductorId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.conductorId}</span>}
            </div>

            <div className="stc-field">
              <label className="stc-field-label">
                Scheduled Time <span style={{ color: T.red }}>*</span>
              </label>
              <input
                type="time"
                style={{ borderColor: formErrors.scheduleTime ? T.red : undefined }}
                value={formatTimeForInput(formData.scheduleTime)}
                onChange={(e) => {
                  setFormData((s) => ({ ...s, scheduleTime: e.target.value }));
                  if (formErrors.scheduleTime) setFormErrors((prev) => ({ ...prev, scheduleTime: "" }));
                }}
              />
              {formErrors.scheduleTime && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.scheduleTime}</span>}
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
              <label className="stc-field-label">
                Trip Status <span style={{ color: T.red }}>*</span>
              </label>
              <select
                style={{ borderColor: formErrors.tripStatus ? T.red : undefined }}
                value={formData.tripStatus || ""}
                onChange={(e) => {
                  setFormData((s) => ({ ...s, tripStatus: e.target.value }));
                  if (formErrors.tripStatus) setFormErrors((prev) => ({ ...prev, tripStatus: "" }));
                }}
              >
                <option value="">Select Trip Status</option>
                {TRIP_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === "OnTime" ? "On Time" : st}
                  </option>
                ))}
              </select>
              {formErrors.tripStatus && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.tripStatus}</span>}
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
