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
  Modal,
  Table,
  TableToolbar,
} from "../../../components/common";
import { farePolicyService } from "../../../api/organization/master/farePolicyService";
import { routeService } from "../../../api/organization/master/routeService";
import { vehicleCategoryService } from "../../../api/organization/master/vehicleCategoryService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface FarePolicy {
  policyId: string;
  policyCode: string;
  model: string;
  policyStatus: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  baseFare: number;
  rateDescription: string;
  isActive: boolean;
}

const modelOptions = ["Fixed", "Distance", "Zone"];
const statusOptions = ["Published", "Simulated", "Draft"];

export function FarePolicies() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [modelFilter, setModelFilter] = useState("");
  const [policyStatusFilter, setPolicyStatusFilter] = useState("");
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [routeIdFilter, setRouteIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: FarePolicy } | null>(null);
  const [toDelete, setToDelete] = useState<FarePolicy | null>(null);
  const [formData, setFormData] = useState<Partial<FarePolicy>>({});

  const categoryIdParam = categoryIdFilter === "" ? undefined : Number(categoryIdFilter);
  const routeIdParam = routeIdFilter === "" ? undefined : Number(routeIdFilter);
  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: farePolicies = [], isLoading, error } = useQuery({
    queryKey: ["farePolicies", debouncedSearch, modelFilter, policyStatusFilter, categoryIdFilter, routeIdFilter, statusFilter],
    queryFn: () =>
      farePolicyService.getAll(
        debouncedSearch || undefined,
        modelFilter || undefined,
        policyStatusFilter || undefined,
        categoryIdParam,
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

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["vehicleCategories", true],
    queryFn: () => vehicleCategoryService.getAll(undefined, undefined, undefined, true),
    staleTime: Infinity,
  });

  const addMutation = useMutation({
    mutationFn: farePolicyService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["farePolicies"] });
      toast.success(res.message || "Fare policy added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add fare policy");
    },
  });

  const updateMutation = useMutation({
    mutationFn: farePolicyService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["farePolicies"] });
      toast.success(res.message || "Fare policy updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update fare policy");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: farePolicyService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["farePolicies"] });
      toast.success(res.message || "Fare policy deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete fare policy");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      policyCode: "",
      model: modelOptions[0],
      policyStatus: statusOptions[0],
      categoryId: categoryOptions[0]?.categoryId || "",
      routeId: routeOptions[0]?.routeId || "",
      baseFare: 0,
      rateDescription: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: FarePolicy) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    const payload = {
      model: formData.model || modelOptions[0],
      policyStatus: formData.policyStatus || "Draft",
      categoryId: formData.categoryId || categoryOptions[0]?.categoryId || "",
      routeId: formData.routeId || routeOptions[0]?.routeId || "",
      baseFare: String(formData.baseFare ?? 0),
      rateDescription: formData.rateDescription || "",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        policyId: formData.policyId || "0",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.policyId) return;
    deleteMutation.mutate({ policyId: toDelete.policyId});
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Fare policies"
        action={
          <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add policy
            </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search fare policies..."
          filters={[
            {
              key: "model",
              label: "Model",
              value: modelFilter,
              onChange: setModelFilter,
              options: modelOptions.map((opt) => ({ value: opt, label: opt })),
            },
            {
              key: "policyStatus",
              label: "Policy Status",
              value: policyStatusFilter,
              onChange: setPolicyStatusFilter,
              options: statusOptions.map((opt) => ({ value: opt, label: opt })),
            },
            {
              key: "category",
              label: "Category",
              value: categoryIdFilter,
              onChange: setCategoryIdFilter,
              options: categoryOptions.map((opt) => ({ value: opt.categoryId, label: opt.categoryName })),
            },
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
              <Th>Policy</Th>
              <Th>Model</Th>
              <Th>Base</Th>
              <Th>Category</Th>
              <Th>Route</Th>
              <Th>Policy Status</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading policies...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading policies: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {farePolicies.map((item: FarePolicy) => (
                  <tr key={item.policyId} className="stc-row">
                    <Td mono>
                      <div>
                        <RouteChip>{item.policyCode}</RouteChip>
                        <div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>{item.rateDescription}</div>
                      </div>
                    </Td>
                    <Td>{item.model}</Td>
                    <Td>₹{item.baseFare}</Td>
                    <Td mono>{item.categoryName || item.categoryCode || "-"}</Td>
                    <Td mono>{item.routeName || "-"}</Td>
                    <Td>{item.policyStatus}</Td>
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
                {farePolicies.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>No records yet — use Add policy to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Fare Policies`}
            subtitle={modal.mode === "add" ? "Create a new fare policy" : "Update fare policy"}
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
                  <label className="stc-field-label">Policy code</label>
                  <input
                    disabled
                    value={formData.policyCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Model</label>
                <select
                  value={formData.model || modelOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, model: e.target.value }))}
                >
                  {modelOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Category</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryId: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((opt: any) => <option key={opt.categoryId} value={opt.categoryId}>{opt.categoryName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Status</label>
                <select
                  value={formData.policyStatus || statusOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, policyStatus: e.target.value }))}
                >
                  {statusOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Base fare (₹)</label>
                <input
                  type="number"
                  value={formData.baseFare ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, baseFare: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.routeId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, routeId: e.target.value }))}
                >
                  <option value="">Select Route</option>
                  {routeOptions.map((opt: any) => <option key={opt.routeId} value={opt.routeId}>{opt.routeName}</option>)}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Rate description</label>
                <input
                  value={formData.rateDescription || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, rateDescription: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Fare Policies" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.policyCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default FarePolicies;
