import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  Th,
  Td,
  Modal,
  Table,
  TableToolbar,
  StatusBadge,
} from "../../../components/common";
import { stageService } from "../../../api/organization/master/stageService";
import { routeService } from "../../../api/organization/master/routeService";
import { stopService } from "../../../api/organization/master/stopService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Stage {
  stageId: string;
  stageCode: string;
  stageName: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  sectionFromId: string;
  sectionFromCode: string;
  sectionFromName: string;
  sectionToId: string;
  sectionToCode: string;
  sectionToName: string;
  distance: number;
  isActive: boolean;
}

export function Stages() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [routeIdFilter, setRouteIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Stage } | null>(null);
  const [toDelete, setToDelete] = useState<Stage | null>(null);
  const [formData, setFormData] = useState<Partial<Stage>>({});

  const routeIdParam = routeIdFilter === "" ? undefined : Number(routeIdFilter);
  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: stages = [], isLoading, error } = useQuery({
    queryKey: ["stages", debouncedSearch, routeIdFilter, statusFilter],
    queryFn: () =>
      stageService.getAll(
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

  const { data: stopOptions = [] } = useQuery({
    queryKey: ["stops", true],
    queryFn: () => stopService.getAll(undefined, undefined, true),
    staleTime: Infinity,
  });

  const addMutation = useMutation({
    mutationFn: stageService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      toast.success(res.message || "Stage added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add stage");
    },
  });

  const updateMutation = useMutation({
    mutationFn: stageService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      toast.success(res.message || "Stage updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update stage");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stageService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      toast.success(res.message || "Stage deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete stage");
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      stageCode: "",
      stageName: "",
      routeId: "",
      sectionFromId: "",
      sectionToId: "",
      distance: "" as any,
      isActive: true,
    });
    setFormErrors({});
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Stage) => {
    setFormData(record);
    setFormErrors({});
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!(formData.stageName || "").trim()) {
      errors.stageName = "Stage Name is required.";
    }
    if (!formData.routeId) {
      errors.routeId = "Please select a Route.";
    }
    if (!formData.sectionFromId) {
      errors.sectionFromId = "Please select From Section.";
    }
    if (!formData.sectionToId) {
      errors.sectionToId = "Please select To Section.";
    } else if (formData.sectionFromId && String(formData.sectionFromId) === String(formData.sectionToId)) {
      errors.sectionToId = "From Section and To Section cannot be the same.";
    }
    if (
      formData.distance === undefined ||
      formData.distance === null ||
      formData.distance === ("" as any) ||
      isNaN(Number(formData.distance)) ||
      Number(formData.distance) <= 0
    ) {
      errors.distance = "Distance is required and must be greater than 0.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill required fields.");
      return;
    }
    setFormErrors({});

    if (modal?.mode === "add") {
      addMutation.mutate({
        stageName: formData.stageName || "",
        routeId: formData.routeId!,
        sectionFromId: formData.sectionFromId!,
        sectionToId: formData.sectionToId!,
        distance: Number(formData.distance) || 0,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        stageId: formData.stageId || "",
        stageName: formData.stageName || "",
        routeId: formData.routeId!,
        sectionFromId: formData.sectionFromId!,
        sectionToId: formData.sectionToId!,
        distance: Number(formData.distance) || 0,
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.stageId) return;
    deleteMutation.mutate({ stageId: toDelete.stageId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Stage master"
        action={
          <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add stage
            </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search stages..."
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
                { value: "Both", label: "Both" },
              ],
            },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Stage code</Th>
              <Th>Stage Name</Th>
              <Th>Route</Th>
              <Th>From Section</Th>
              <Th>To Section</Th>
              <Th align="right">Distance (km)</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading stages...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading stages: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {stages.map((item: Stage) => (
                  <tr key={item.stageId} className="stc-row">
                    <Td mono>{item.stageCode}</Td>
                    <Td>{item.stageName}</Td>
                    <Td mono>{item.routeName}</Td>
                    <Td mono>{item.sectionFromName}</Td>
                    <Td mono>{item.sectionToName}</Td>
                    <Td align="right">{item.distance}</Td>
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
                {stages.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>No records yet — use Add stage to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Stages`}
            subtitle={modal.mode === "add" ? "Add a new stage" : "Update stage details"}
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
                  <label className="stc-field-label">Stage code</label>
                  <input
                    disabled
                    value={formData.stageCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">
                  Stage Name <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  style={{ borderColor: formErrors.stageName ? T.red : undefined }}
                  value={formData.stageName || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, stageName: e.target.value }));
                    if (formErrors.stageName) setFormErrors((prev) => ({ ...prev, stageName: "" }));
                  }}
                />
                {formErrors.stageName && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.stageName}</span>}
              </div>
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
                  {routeOptions.map((opt) => (
                    <option key={opt.routeId} value={opt.routeId}>
                      {opt.routeName}
                    </option>
                  ))}
                </select>
                {formErrors.routeId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.routeId}</span>}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  From Section <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.sectionFromId ? T.red : undefined }}
                  value={formData.sectionFromId || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, sectionFromId: e.target.value }));
                    if (formErrors.sectionFromId) setFormErrors((prev) => ({ ...prev, sectionFromId: "" }));
                  }}
                >
                  <option value="">Select From Section</option>
                  {stopOptions.map((opt) => (
                    <option
                      key={opt.stopId}
                      value={opt.stopId}
                      disabled={Boolean(formData.sectionToId && String(opt.stopId) === String(formData.sectionToId))}
                    >
                      {opt.stopName}
                    </option>
                  ))}
                </select>
                {formErrors.sectionFromId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.sectionFromId}</span>}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  To Section <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.sectionToId ? T.red : undefined }}
                  value={formData.sectionToId || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, sectionToId: e.target.value }));
                    if (formErrors.sectionToId) setFormErrors((prev) => ({ ...prev, sectionToId: "" }));
                  }}
                >
                  <option value="">Select To Section</option>
                  {stopOptions.map((opt) => (
                    <option
                      key={opt.stopId}
                      value={opt.stopId}
                      disabled={Boolean(formData.sectionFromId && String(opt.stopId) === String(formData.sectionFromId))}
                    >
                      {opt.stopName}
                    </option>
                  ))}
                </select>
                {formErrors.sectionToId && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.sectionToId}</span>}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Distance (km) <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  type="number"
                  style={{ borderColor: formErrors.distance ? T.red : undefined }}
                  value={formData.distance ?? ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, distance: e.target.value === "" ? ("" as any) : Number(e.target.value) }));
                    if (formErrors.distance) setFormErrors((prev) => ({ ...prev, distance: "" }));
                  }}
                />
                {formErrors.distance && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.distance}</span>}
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Stages" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.stageName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Stages;
