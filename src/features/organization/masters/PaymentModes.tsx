import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  StatusBadge,
  Th,
  Td,
  Modal,
  Table,
  TableToolbar,
} from "../../../components/common";
import { paymentModeService } from "../../../api/organization/master/paymentModeService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface PaymentMode {
  modeId: string;
  modeCode: string;
  modeName: string;
  modeStatus: string;
  description: string;
  isActive: boolean;
}

export function PaymentModes() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [modeStatusFilter, setModeStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: PaymentMode } | null>(null);
  const [toDelete, setToDelete] = useState<PaymentMode | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMode>>({});

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: paymentModes = [], isLoading, error } = useQuery({
    queryKey: ["paymentModes", debouncedSearch, modeStatusFilter, statusFilter],
    queryFn: () =>
      paymentModeService.getAll(
        debouncedSearch || undefined,
        modeStatusFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: paymentModeService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["paymentModes"] });
      toast.success(res?.message || "Payment mode added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add payment mode");
    },
  });

  const updateMutation = useMutation({
    mutationFn: paymentModeService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["paymentModes"] });
      toast.success(res?.message || "Payment mode updated successfully.");
    },
    onError: (err: any) => {
      console.log("Dfsdfsd", err);
      toast.error(err.message || "Failed to update payment mode");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: paymentModeService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["paymentModes"] });
      toast.success(res?.message || "Payment mode deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete payment mode");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      modeCode: "",
      modeName: "",
      modeStatus: "",
      description: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: PaymentMode) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.modeName) return;

    const payload = {
      modeName: formData.modeName || "",
      modeStatus: formData.modeStatus || "",
      description: formData.description || "",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        modeId: formData.modeId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.modeId) return;
    deleteMutation.mutate({ modeId: toDelete.modeId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Payment modes"
        action={
          <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add mode
            </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search payment modes..."
          filters={[
            {
              key: "modeStatus",
              label: "Mode Status",
              value: modeStatusFilter,
              onChange: setModeStatusFilter,
              options: [
                { value: "Live", label: "Live" },
                { value: "Under Maintenance", label: "Under Maintenance" },
                { value: "Disabled", label: "Disabled" },
              ],
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
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Mode Status</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading payment modes...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading payment modes: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {paymentModes.map((item: PaymentMode) => (
                  <tr key={item.modeId} className="stc-row">
                    <Td mono>{item.modeCode}</Td>
                    <Td>{item.modeName}</Td>
                    <Td>{item.modeStatus || "-"}</Td>
                    <Td>{item.description || "-"}</Td>
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
                {paymentModes.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>No records yet — use Add mode to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Payment Modes`}
            subtitle={modal.mode === "add" ? "Add a new payment mode" : "Update payment mode"}
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
                  <label className="stc-field-label">Code</label>
                  <input
                    disabled
                    value={formData.modeCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.modeName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, modeName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Mode Status</label>
                <select
                  value={formData.modeStatus}
                  onChange={(e) => setFormData((s) => ({ ...s, modeStatus: e.target.value }))}
                >
                  <option value="">Select Mode Status</option>
                  <option value="Live">Live</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Payment Modes" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.modeCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default PaymentModes;
