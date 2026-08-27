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
import { stopService } from "../../../api/organization/master/stopService";
import { routeService } from "../../../api/organization/master/routeService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Stop {
  stopId: string;
  stopCode: string;
  stopName: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  stopOrder: number;
  isActive: boolean;
}

export function Stop() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [routeIdFilter, setRouteIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Stop } | null>(null);
  const [toDelete, setToDelete] = useState<Stop | null>(null);
  const [formData, setFormData] = useState<Partial<Stop>>({});

  const routeIdParam = routeIdFilter === "" ? undefined : Number(routeIdFilter);
  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data: stops = [], isLoading, error } = useQuery({
    queryKey: ["stops", debouncedSearch, routeIdFilter, statusFilter],
    queryFn: () =>
      stopService.getAll(
        debouncedSearch || undefined,
        routeIdParam,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const { data: routeOptions = [] } = useQuery({
    queryKey: ["routes", true],
    queryFn: () => routeService.getAll(undefined, undefined, undefined, true),
    staleTime: Infinity,
  });

  const addMutation = useMutation({
    mutationFn: stopService.insert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stops"] });
      toast.success("Stop added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add stop");
    },
  });

  const updateMutation = useMutation({
    mutationFn: stopService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stops"] });
      toast.success("Stop updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update stop");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stopService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stops"] });
      toast.success("Stop deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete stop");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      stopCode: "",
      stopName: "",
      routeId: routeOptions[0]?.routeId || "",
      stopOrder: 0,
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Stop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.stopName) return;

    if (modal?.mode === "add") {
      addMutation.mutate({
        stopName: formData.stopName || "",
        routeId: formData.routeId || routeOptions[0]?.routeId || "",
        stopOrder: Number(formData.stopOrder) || 0,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        stopId: formData.stopId || "",
        stopName: formData.stopName || "",
        routeId: formData.routeId || routeOptions[0]?.routeId || "",
        stopOrder: Number(formData.stopOrder) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.stopId) return;
    deleteMutation.mutate({ stopId: toDelete.stopId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Stops"
        action={
          statusFilter !== "Inactive" && (
            <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add stop
            </button>
          )
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search stops..."
          filters={[
            {
              key: "route",
              label: "Route",
              value: routeIdFilter,
              onChange: setRouteIdFilter,
              options: routeOptions.map((opt) => ({ value: opt.routeId, label: opt.routeName })),
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Stop code</Th>
              <Th>Name</Th>
              <Th>Route</Th>
              <Th align="center">Stop Order</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading stops...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading stops: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {stops.map((item: Stop) => (
                  <tr key={item.stopId} className="stc-row">
                    <Td mono>
                      <RouteChip>{item.stopCode}</RouteChip>
                    </Td>
                    <Td>{item.stopName}</Td>
                    <Td mono>{item.routeName}</Td>
                    <Td align="center">{item.stopOrder}</Td>
                    <Td>
                      <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                    </Td>
                    {statusFilter !== "Inactive" && (
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
                    )}
                  </tr>
                ))}
                {stops.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>No records yet — use Add stop to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Stops`}
            subtitle={modal.mode === "add" ? "Add a new stop" : "Update stop details"}
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
                  <label className="stc-field-label">Stop code</label>
                  <input
                    disabled
                    value={formData.stopCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.stopName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, stopName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.routeId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeId: e.target.value }))}
                >
                  <option value="">Select Route</option>
                  {routeOptions.map((opt) => (
                    <option key={opt.routeId} value={opt.routeId}>
                      {opt.routeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Stop Order</label>
                <input
                  type="number"
                  value={formData.stopOrder ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, stopOrder: Number(e.target.value) }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Stops" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.stopCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Stop;
