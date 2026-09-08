import React, { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, FileText } from "lucide-react";
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
import {
  fleetService,
  type FleetVehicleRecord,
  type DocExpiryItem,
  type CreateFleetDto,
  type UpdateFleetDto,
} from "../../../api/operations/fleet/fleetService";
import { vehicleCategoryService } from "../../../api/organization/master/vehicleCategoryService";
import { depotService } from "../../../api/organization/organizationManagement/depotService";
import { usePermissions } from "../../../hooks/usePermissions";

export const DOC_TYPE_OPTIONS = [
  "Registration Certificate (RC)",
  "Insurance Certificate",
  "Fitness Certificate",
  "Permit Certificate",
  "Pollution Under Control (PUC) Certificate",
  "Road Tax Receipt",
  "Vehicle Inspection Certificate",
  "National Permit",
  "State Permit",
  "Contract Carriage Permit",
  "Goods/Passenger Permit",
  "Vehicle Purchase Invoice",
  "Vehicle Warranty Document",
  "Lease Agreement",
  "Accident Report",
  "Emission Test Certificate",
  "Fire Extinguisher Certificate/Inspection",
  "GPS/Tracking Device Certificate",
];

const seriesTypeOptions = ["BH", "State"];
const fleetStatusOptions = [
  "Available",
  "Assigned",
  "Reserved",
  "Under Maintenance",
  "Accident/Damaged",
];

export interface FleetVehicleRecordPayload {
  fleetId?: string;
  vehicleNumber: string;
  categoryId: string;
  depotId: string;
  seriesType: string;
  fleetStatus?: string;
  docExpiry: DocExpiryItem[];
  isActive?: boolean;
}

export interface FleetManagementPageProps {
  data?: FleetVehicleRecord[];
  depotOptions?: { depotId: string; depotCode: string; depotName?: string }[];
  categoryOptions?: { categoryId: string; categoryName: string }[];
  onAdd?: (item: FleetVehicleRecordPayload) => void;
  onUpdate?: (item: FleetVehicleRecordPayload) => void;
  onDelete?: (fleetId: string) => void;
}

export function VehicleRegister({
  data: propData,
  onAdd,
  onUpdate,
  onDelete,
}: FleetManagementPageProps = {}) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [depotFilter, setDepotFilter] = useState("");
  const [fleetStatusFilter, setFleetStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: FleetVehicleRecord;
  } | null>(null);
  const { canAdd, canEdit, canDelete } = usePermissions("Vehicle Register");
  const [toDelete, setToDelete] = useState<FleetVehicleRecord | null>(null);
  const [formData, setFormData] = useState<Partial<FleetVehicleRecord>>({
    docExpiry: [],
  });

  // Fetch Categories for filter & form dropdown
  const { data: apiCategories = [] } = useQuery({
    queryKey: ["vehicleCategories", true],
    queryFn: () => vehicleCategoryService.getAll(undefined, undefined, undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Depots for filter & form dropdown
  const { data: apiDepots = [] } = useQuery({
    queryKey: ["depots", true],
    queryFn: () => depotService.getAll(undefined, undefined, undefined, undefined, undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  // Fetch Fleet Vehicles API
  const {
    data: apiFleetVehicles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "fleetVehicles",
      debouncedSearch,
      categoryFilter,
      depotFilter,
      fleetStatusFilter,
      statusFilter,
    ],
    queryFn: () =>
      fleetService.getAll(
        debouncedSearch || undefined,
        categoryFilter || undefined,
        depotFilter || undefined,
        fleetStatusFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const vehiclesList = propData || apiFleetVehicles;

  const addMutation = useMutation({
    mutationFn: (dto: CreateFleetDto) => fleetService.insert(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["fleetVehicles"] });
      toast.success(res?.message || "Vehicle added to fleet successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add vehicle.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: UpdateFleetDto) => fleetService.update(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["fleetVehicles"] });
      toast.success(res?.message || "Vehicle updated successfully.");
      setModal(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update vehicle.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fleetId: string) => fleetService.delete({ fleetId }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["fleetVehicles"] });
      toast.success(res?.message || "Vehicle deleted successfully.");
      setToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete vehicle.");
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      vehicleNumber: "",
      seriesType: "",
      categoryId: "",
      depotId: "",
      fleetStatus: "",
      docExpiry: [],
      isActive: true,
    });
    setFormErrors({});
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: FleetVehicleRecord) => {
    setFormData({
      ...record,
      docExpiry: Array.isArray(record.docExpiry) ? [...record.docExpiry] : [],
    });
    setFormErrors({});
    setModal({ mode: "edit", record });
  };

  const getMinFutureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleAddDocExpiryRow = () => {
    setFormData((prev) => ({
      ...prev,
      docExpiry: [
        ...(prev.docExpiry || []),
        {
          docType: "",
          docExpiryDate: getMinFutureDate(),
        },
      ],
    }));
  };

  const handleRemoveDocExpiryRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      docExpiry: (prev.docExpiry || []).filter((_, i) => i !== index),
    }));
    if (formErrors.docExpiry) setFormErrors((prev) => ({ ...prev, docExpiry: "" }));
  };

  const handleDocExpiryChange = (
    index: number,
    field: keyof DocExpiryItem,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.docExpiry || [])];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, docExpiry: updated };
    });
    if (formErrors.docExpiry) setFormErrors((prev) => ({ ...prev, docExpiry: "" }));
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    const vehicleNo = (formData.vehicleNumber || "").trim().toUpperCase();
    const vehicleRegex = /^[A-Z]{2}[- ]?[0-9]{2}[- ]?[A-Z]{1,3}[- ]?[0-9]{1,4}$/;

    if (!vehicleNo) {
      errors.vehicleNumber = "Vehicle Number is required.";
    } else if (!vehicleRegex.test(vehicleNo)) {
      errors.vehicleNumber = "Invalid Vehicle Number format (e.g. MH-12-AB-4421).";
    }
    if (!formData.seriesType) {
      errors.seriesType = "Please select a Series Type.";
    }
    if (!formData.categoryId) {
      errors.categoryId = "Please select a Category.";
    }
    if (!formData.depotId) {
      errors.depotId = "Please select a Depot.";
    }

    const todayStr = new Date().toISOString().split("T")[0];
    for (const doc of formData.docExpiry || []) {
      if (doc.docType && doc.docExpiryDate && doc.docExpiryDate <= todayStr) {
        errors.docExpiry = "Document expiration date must be in the future (after today).";
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill required fields.");
      return;
    }
    setFormErrors({});

    const docExpiryCleaned = (formData.docExpiry || []).filter(
      (doc) => doc.docType && doc.docExpiryDate
    );

    if (modal?.mode === "add") {
      const payload: CreateFleetDto = {
        vehicleNumber: vehicleNo,
        categoryId: String(formData.categoryId),
        seriesType: formData.seriesType!,
        depotId: String(formData.depotId),
        docExpiry: docExpiryCleaned,
      };

      if (onAdd) {
        onAdd(payload);
        setModal(null);
      } else {
        addMutation.mutate(payload);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      const payload: UpdateFleetDto = {
        fleetId: String(formData.fleetId || modal.record.fleetId),
        vehicleNumber: vehicleNo,
        categoryId: String(formData.categoryId),
        seriesType: formData.seriesType || "BH",
        depotId: String(formData.depotId),
        docExpiry: docExpiryCleaned,
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
    if (!toDelete || !toDelete.fleetId) return;
    if (onDelete) {
      onDelete(toDelete.fleetId);
      setToDelete(null);
    } else {
      deleteMutation.mutate(String(toDelete.fleetId));
    }
  };

  const categoryMap = new Map(
    apiCategories.map((c) => [String(c.categoryId), c.categoryName])
  );

  const depotMap = new Map(
    apiDepots.map((d) => [String(d.depotId), d.depotName || d.depotCode])
  );

  return (
    <div>
      <Card
        title="Vehicle Register"
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
              <Plus size={13} /> Add vehicle
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vehicle number..."
          filters={[
            {
              key: "category",
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: apiCategories.map((cat) => ({
                value: String(cat.categoryId),
                label: cat.categoryName,
              })),
            },
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
              key: "fleetStatus",
              label: "Fleet Status",
              value: fleetStatusFilter,
              onChange: setFleetStatusFilter,
              options: fleetStatusOptions.map((st) => ({
                value: st,
                label: st,
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
              <Th>Vehicle Number</Th>
              <Th>Series Type</Th>
              <Th>Category</Th>
              <Th>Depot</Th>
              <Th>Fleet Status</Th>
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
                    Loading fleet vehicles...
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
                    Failed to load fleet vehicles.
                  </div>
                </Td>
              </tr>
            ) : vehiclesList.length === 0 ? (
              <tr>
                <Td colSpan={7}>
                  <div
                    style={{
                      textAlign: "center",
                      color: T.textSoft,
                      padding: 16,
                    }}
                  >
                    No vehicle records found.
                  </div>
                </Td>
              </tr>
            ) : (
              vehiclesList.map((item) => {
                const categoryDisplayName =
                  item.categoryName ||
                  categoryMap.get(String(item.categoryId)) ||
                  item.categoryId;
                const depotDisplayName =
                  item.depotName ||
                  item.depotCode ||
                  depotMap.get(String(item.depotId)) ||
                  item.depotId;

                return (
                  <tr key={item.fleetId} className="stc-row">
                    <Td mono>
                      <strong style={{ fontWeight: 700 }}>
                        {item.vehicleNumber}
                      </strong>
                    </Td>
                    <Td>{item.seriesType}</Td>
                    <Td>{categoryDisplayName}</Td>
                    <Td>{depotDisplayName}</Td>
                    <Td>{item.fleetStatus || "Available"}</Td>
                    <Td>
                      <StatusBadge
                        status={item.isActive ? "Active" : "Inactive"}
                      />
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
                            title="Edit vehicle"
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
                            title="Delete vehicle"
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

        {/* Add / Edit Modal */}
        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Vehicle Register`}
            subtitle={
              modal.mode === "add"
                ? "Register a new vehicle in the fleet"
                : "Update vehicle registration details"
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
              <div className="stc-field">
                <label className="stc-field-label">
                  Vehicle Number <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  style={{
                    borderColor: formErrors.vehicleNumber ? T.red : undefined,
                    textTransform: "uppercase",
                  }}
                  value={formData.vehicleNumber || ""}
                  placeholder="e.g. MH-12-AB-4421"
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData((s) => ({ ...s, vehicleNumber: val }));
                    if (formErrors.vehicleNumber) setFormErrors((prev) => ({ ...prev, vehicleNumber: "" }));
                  }}
                />
                {formErrors.vehicleNumber && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.vehicleNumber}</span>}
              </div>

              <div className="stc-field">
                <label className="stc-field-label">
                  Series Type <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.seriesType ? T.red : undefined }}
                  value={formData.seriesType || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, seriesType: e.target.value }));
                    if (formErrors.seriesType) setFormErrors((prev) => ({ ...prev, seriesType: "" }));
                  }}
                >
                  <option value="">Select Series Type</option>
                  {seriesTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {formErrors.seriesType && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.seriesType}</span>}
              </div>

              <div className="stc-field">
                <label className="stc-field-label">
                  Category <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.categoryId ? T.red : undefined }}
                  value={formData.categoryId || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, categoryId: e.target.value }));
                    if (formErrors.categoryId) setFormErrors((prev) => ({ ...prev, categoryId: "" }));
                  }}
                >
                  <option value="">Select Category</option>
                  {apiCategories.map((cat) => (
                    <option key={cat.categoryId} value={String(cat.categoryId)}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.categoryId}</span>}
              </div>

              <div className="stc-field">
                <label className="stc-field-label">
                  Depot <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.depotId ? T.red : undefined }}
                  value={formData.depotId || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, depotId: e.target.value }));
                    if (formErrors.depotId) setFormErrors((prev) => ({ ...prev, depotId: "" }));
                  }}
                >
                  <option value="">Select Depot</option>
                  {apiDepots.map((dep) => (
                    <option key={dep.depotId} value={String(dep.depotId)}>
                      {dep.depotName || dep.depotCode}
                    </option>
                  ))}
                </select>
                {formErrors.depotId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.depotId}</span>}
              </div>

              {/* Document Expiration Multi-Row Editor */}
              <div
                style={{
                  gridColumn: "span 2",
                  marginTop: 12,
                  background: T.hover,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: T.blueFill,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={15} color={T.blue} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.text,
                        }}
                      >
                        Document Expiration Entries
                      </span>
                      {formData.docExpiry && formData.docExpiry.length > 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            color: T.blue,
                            background: T.blueFill,
                            padding: "2px 7px",
                            borderRadius: 10,
                          }}
                        >
                          {formData.docExpiry.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDocExpiryRow}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.blue,
                      background: T.blueFill,
                      border: `1px solid ${T.blue}`,
                      borderRadius: 6,
                      padding: "5px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Plus size={13} /> Add Document
                  </button>
                </div>

                {!formData.docExpiry || formData.docExpiry.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: T.textSoft,
                      padding: "16px 12px",
                      border: `1px dashed ${T.border}`,
                      borderRadius: 8,
                      background: "var(--card-bg, #fff)",
                    }}
                  >
                    No document expiration entries added yet. Click &quot;Add Document&quot; above.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {formData.docExpiry.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "32px 1fr 150px 34px",
                          gap: 8,
                          alignItems: "center",
                          background: "var(--card-bg, #ffffff)",
                          border: `1px solid ${T.border}`,
                          padding: "8px 10px",
                          borderRadius: 8,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.blue,
                            background: T.blueFill,
                            borderRadius: 4,
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          #{idx + 1}
                        </span>

                        <select
                          value={doc.docType || ""}
                          onChange={(e) =>
                            handleDocExpiryChange(idx, "docType", e.target.value)
                          }
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            height: 34,
                            padding: "0 10px",
                            borderRadius: 6,
                            border: `1px solid ${T.border}`,
                            background: "var(--bg, #fff)",
                            color: "var(--text, #111)",
                            outline: "none",
                          }}
                        >
                          <option value="">Select Document Type</option>
                          {DOC_TYPE_OPTIONS.map((dt) => (
                            <option key={dt} value={dt}>
                              {dt}
                            </option>
                          ))}
                        </select>

                        <input
                          type="date"
                          min={getMinFutureDate()}
                          value={doc.docExpiryDate}
                          onChange={(e) =>
                            handleDocExpiryChange(
                              idx,
                              "docExpiryDate",
                              e.target.value
                            )
                          }
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            height: 34,
                            padding: "0 8px",
                            borderRadius: 6,
                            border: `1px solid ${
                              doc.docExpiryDate && doc.docExpiryDate <= new Date().toISOString().split("T")[0]
                                ? T.red
                                : T.border
                            }`,
                            background: "var(--bg, #fff)",
                            color: "var(--text, #111)",
                            outline: "none",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveDocExpiryRow(idx)}
                          title="Remove Document Entry"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 6,
                            background: T.redFill,
                            border: `1px solid rgba(239, 68, 68, 0.25)`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <Trash2 size={14} color={T.red} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {formErrors.docExpiry && (
                  <span style={{ color: T.red, fontSize: 11, marginTop: 8, display: "block" }}>
                    {formErrors.docExpiry}
                  </span>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {toDelete && (
          <Modal
            title="Delete — Vehicle"
            subtitle="This action cannot be undone"
            icon={<Calendar size={20} color={T.red} />}
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
              This will permanently remove vehicle{" "}
              <strong>{toDelete.vehicleNumber}</strong> from the fleet.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default VehicleRegister;
