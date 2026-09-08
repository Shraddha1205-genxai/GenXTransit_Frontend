import React, { useState } from "react";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  Modal,
  StatusBadge,
  Table,
  TableToolbar,
  Td,
  Th,
} from "../../../components/common";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  vehicleServiceService,
  type serviceRecord,
  type serviceRecordPayload,
} from "../../../api/operations/fleet/vehicleServiceService";
import { fleetService } from "../../../api/operations/fleet/fleetService";

export type { serviceRecord, serviceRecordPayload };

const serviceStatusOptions = ["Inprogress", "Cancelled", "Completed", "Pending"];

export function VehicleService() {
  const { canAdd, canEdit, canDelete } = usePermissions("VehicleService");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [fleetIdFilter, setFleetIdFilter] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: serviceRecord;
  } | null>(null);
  const [toDelete, setToDelete] = useState<serviceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<serviceRecord>>({});

  // Fetch registered fleet vehicles for dropdowns
  const { data: fleetVehicles = [] } = useQuery({
    queryKey: ["fleetVehicles", true],
    queryFn: () => fleetService.getAll(undefined, undefined, "", undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  // Fetch Vehicle Service Records
  const {
    data: serviceRecords = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "vehicleServices",
      debouncedSearch,
      fleetIdFilter,
      serviceStatusFilter,
      statusFilter,
    ],
    queryFn: () =>
      vehicleServiceService.getAll(
        debouncedSearch || undefined,
        fleetIdFilter || undefined,
        serviceStatusFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: (payload: serviceRecordPayload) =>
      vehicleServiceService.insert(payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleServices"] });
      toast.success(res?.message || "Vehicle service record added successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add vehicle service record.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: serviceRecordPayload) =>
      vehicleServiceService.update(payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleServices"] });
      toast.success(res?.message || "Vehicle service record updated successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update vehicle service record.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) =>
      vehicleServiceService.delete({ serviceId }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleServices"] });
      toast.success(res?.message || "Vehicle service record deleted successfully.");
      setToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete vehicle service record.");
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      serviceId: "",
      fleetId: "",
      status: "",
    });
    setFormErrors({});
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: serviceRecord) => {
    setFormData(record);
    setFormErrors({});
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!formData.fleetId) {
      errors.fleetId = "Please select a Vehicle / Fleet.";
    }
    if (!formData.status) {
      errors.status = "Please select a Service Status.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill required fields.");
      return;
    }
    setFormErrors({});

    if (modal?.mode === "add") {
      const payload: serviceRecordPayload = {
        fleetId: String(formData.fleetId),
        status: formData.status!,
      };
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      const payload: serviceRecordPayload = {
        serviceId: String(formData.serviceId || modal.record.serviceId),
        fleetId: String(formData.fleetId),
        status: formData.status!,
      };
      updateMutation.mutate(payload);
    }
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.serviceId) return;
    deleteMutation.mutate(String(toDelete.serviceId));
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <StatusBadge status="Active" />;
      case "Inprogress":
        return <StatusBadge status="In progress" />;
      case "Cancelled":
        return <StatusBadge status="Cancelled" />;
      case "Pending":
      default:
        return <StatusBadge status="Pending verification" />;
    }
  };

  return (
    <div>
      <Card
        title="Vehicle Service Records"
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
              <Plus size={13} /> Add service record
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search service code, vehicle number..."
          filters={[
            {
              key: "fleetId",
              label: "Vehicle / Fleet",
              value: fleetIdFilter,
              onChange: setFleetIdFilter,
              options: fleetVehicles.map((fv) => ({
                value: String(fv.fleetId),
                label: `${fv.vehicleNumber}`,
              })),
            },
            {
              key: "serviceStatus",
              label: "Service Status",
              value: serviceStatusFilter,
              onChange: setServiceStatusFilter,
              options: serviceStatusOptions.map((st) => ({
                value: st,
                label: st === "Inprogress" ? "In Progress" : st,
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
              <Th>Service Code</Th>
              <Th>Vehicle Number</Th>
              <Th>Fleet Status</Th>
              <Th>Service Status</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={7}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.textSoft,
                      padding: 16,
                    }}
                  >
                    Loading vehicle service records...
                  </div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={7}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.red,
                      padding: 16,
                    }}
                  >
                    Failed to load service records.
                  </div>
                </Td>
              </tr>
            ) : serviceRecords.length === 0 ? (
              <tr>
                <Td colSpan={7}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.textSoft,
                      padding: 16,
                    }}
                  >
                    No vehicle service records found.
                  </div>
                </Td>
              </tr>
            ) : (
              serviceRecords.map((item) => (
                <tr key={item.serviceId} className="stc-row">
                  <Td mono>
                    <strong>{item.serviceCode}</strong>
                  </Td>
                  <Td>
                    <strong style={{ fontWeight: 600 }}>
                      {item.vehicleNumber}
                    </strong>
                  </Td>
                  <Td>{item.fleetStatus || "Assigned"}</Td>
                  <Td>{renderStatusBadge(item.status)}</Td>
                  <Td>
                    <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                  </Td>
                  <Td align="right">
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                      }}
                    >
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit service record"
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
                          onClick={() => setToDelete(item)}
                          title="Delete service record"
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
              ))
            )}
          </tbody>
        </Table>

        {/* Add / Edit Modal */}
        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Vehicle Service`}
            subtitle={
              modal.mode === "add"
                ? "Register a new vehicle service entry"
                : "Update service record details"
            }
            onClose={() => setModal(null)}
            width={520}
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
              <div className="stc-field">
                <label className="stc-field-label">
                  Vehicle / Fleet <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.fleetId ? T.red : undefined }}
                  value={formData.fleetId || ""}
                  onChange={(e) => {
                    setFormData((s) => ({
                      ...s,
                      fleetId: e.target.value,
                    }));
                    if (formErrors.fleetId) setFormErrors((prev) => ({ ...prev, fleetId: "" }));
                  }}
                >
                  <option value="">Select Vehicle / Fleet</option>
                  {fleetVehicles.map((fv) => (
                    <option key={fv.fleetId} value={String(fv.fleetId)}>
                      {fv.vehicleNumber}
                    </option>
                  ))}
                </select>
                {formErrors.fleetId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.fleetId}</span>}
              </div>

              <div className="stc-field">
                <label className="stc-field-label">
                  Status <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.status ? T.red : undefined }}
                  value={formData.status || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, status: e.target.value }));
                    if (formErrors.status) setFormErrors((prev) => ({ ...prev, status: "" }));
                  }}
                >
                  <option value="">Select Service Status</option>
                  {serviceStatusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st === "Inprogress" ? "In Progress" : st}
                    </option>
                  ))}
                </select>
                {formErrors.status && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.status}</span>}
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {toDelete && (
          <Modal
            title="Delete — Vehicle Service Record"
            subtitle="This action cannot be undone"
            icon={<Wrench size={20} color={T.red} />}
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
              Are you sure you want to remove service record{" "}
              <strong>{toDelete.serviceCode}</strong> for vehicle{" "}
              <strong>{toDelete.vehicleNumber}</strong>?
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default VehicleService;
