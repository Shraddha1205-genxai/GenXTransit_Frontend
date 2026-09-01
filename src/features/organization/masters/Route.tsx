import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  RouteChip,
  Th,
  Td,
  Modal,
  Table,
  TableToolbar,
  StatusBadge,
} from "../../../components/common";
import { routeService } from "../../../api/organization/master/routeService";
import { stationService } from "../../../api/organization/organizationManagement/stationService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Route {
  routeId: string;
  routeCode: string;
  routeName: string;
  service: string;
  fromStationId: string;
  fromStationCode: string;
  fromStationName: string;
  toStationId: string;
  toStationCode: string;
  toStationName: string;
  type: string;
  distance: number;
  fareModel: string;
  duration: string;
  isActive: boolean;
}

const serviceOptions = ["ST", "Local"];
const typeOptions = ["Luxury", "Express", "Ordinary", "City"];
const fareModelOptions = ["Fixed", "Distance", "Zone"];

export function RouteMaster() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [serviceFilter, setServiceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Route } | null>(null);
  const [toDelete, setToDelete] = useState<Route | null>(null);
  const [formData, setFormData] = useState<Partial<Route>>({});

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: routes = [], isLoading, error } = useQuery({
    queryKey: ["routes", debouncedSearch, serviceFilter, typeFilter, statusFilter],
    queryFn: () =>
      routeService.getAll(
        debouncedSearch || undefined,
        serviceFilter || undefined,
        typeFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const { data: stationOptions = [] } = useQuery({
    queryKey: ["stations", true],
    queryFn: () => stationService.getAll(undefined, undefined, undefined, undefined, true),
    staleTime: Infinity,
  });

  const addMutation = useMutation({
    mutationFn: routeService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(res.message || "Route added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add route");
    },
  });

  const updateMutation = useMutation({
    mutationFn: routeService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(res.message || "Route updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update route");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: routeService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(res.message || "Route deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete route");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      routeCode: "",
      routeName: "",
      fromStationId: "",
      toStationId: "",
      service: "",
      type: "",
      distance: 0,
      fareModel: "",
      duration: "00:00:00",
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Route) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.routeName || !formData.fromStationId || !formData.toStationId || !formData.service || !formData.type || !formData.fareModel) {
      toast.error("Please fill required fields.");
      return;
    }

    const payload = {
      routeName: formData.routeName || "",
      service: formData.service,
      fromStationId: formData.fromStationId,
      toStationId: formData.toStationId,
      type: formData.type,
      distance: Number(formData.distance) || 0,
      fareModel: formData.fareModel,
      duration: formData.duration || "00:00:00",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        routeId: formData.routeId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.routeId) return;
    deleteMutation.mutate({ routeId: toDelete.routeId });
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
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search routes..."
          filters={[
            {
              key: "service",
              label: "Service",
              value: serviceFilter,
              onChange: setServiceFilter,
              options: serviceOptions.map((opt) => ({ value: opt, label: opt })),
            },
            {
              key: "type",
              label: "Type",
              value: typeFilter,
              onChange: setTypeFilter,
              options: typeOptions.map((opt) => ({ value: opt, label: opt })),
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
              <Th>Route</Th>
              <Th>Service</Th>
              <Th>From Station</Th>
              <Th>To Station</Th>
              <Th>Type</Th>
              <Th>Distance</Th>
              <Th>Fare model</Th>
              <Th>Duration</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 9 : 10}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading routes...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 9 : 10}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading routes: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {routes.map((item: Route) => (
                  <tr key={item.routeId} className="stc-row">
                    <Td mono>
                      <div>
                        <RouteChip>{item.routeCode}</RouteChip>
                        <div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>{item.routeName}</div>
                      </div>
                    </Td>
                    <Td>{item.service}</Td>
                    <Td>{item.fromStationName}</Td>
                    <Td>{item.toStationName}</Td>
                    <Td>{item.type}</Td>
                    <Td>{item.distance} km</Td>
                    <Td>{item.fareModel}</Td>
                    <Td>{item.duration || "-"}</Td>
                    <Td>
                      <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                    </Td>
                    {statusFilter !== "Inactive" && (
                      <Td align="right">
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          <button disabled={statusFilter === "Both" && !item.isActive} onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: statusFilter === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: statusFilter === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Pencil size={14} color={T.textSoft} />
                          </button>
                          <button disabled={statusFilter === "Both" && !item.isActive} onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: statusFilter === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: statusFilter === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Trash2 size={14} color={T.red} />
                          </button>
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 9 : 10}>No records yet — use Add route to create one.</Td>
                  </tr>
                )}
              </>
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
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Route code</label>
                  <input
                    disabled
                    value={formData.routeCode || ""}
                  />
                </div>
              )}
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
                  value={formData.service || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, service: e.target.value }))}
                >
                  <option value="">Select Service</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">From Station</label>
                <select
                  value={formData.fromStationId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, fromStationId: e.target.value }))}
                >
                  <option value="">Select From Station</option>
                  {stationOptions.map((opt) => (
                    <option key={opt.stationId} value={opt.stationId}>{opt.stationName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">To Station</label>
                <select
                  value={formData.toStationId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, toStationId: e.target.value }))}
                >
                  <option value="">Select To Station</option>
                  {stationOptions.map((opt) => (
                    <option key={opt.stationId} value={opt.stationId}>{opt.stationName}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Type</label>
                <select
                  value={formData.type || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
                >
                  <option value="">Select Type</option>
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Distance (km)</label>
                <input
                  type="number"
                  value={formData.distance ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, distance: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Fare model</label>
                <select
                  value={formData.fareModel || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, fareModel: e.target.value }))}
                >
                  <option value="">Select Fare Model</option>
                  {fareModelOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Duration</label>
                <input
                  value={formData.duration || ""}
                  placeholder="e.g. 03:10:00"
                  onChange={(e) => setFormData((s) => ({ ...s, duration: e.target.value }))}
                />
              </div>
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
              This will permanently remove {toDelete.routeName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default RouteMaster;
