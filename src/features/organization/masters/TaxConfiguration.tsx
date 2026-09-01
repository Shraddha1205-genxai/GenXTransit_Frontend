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
import { taxConfigurationService } from "../../../api/organization/master/taxConfigurationService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface TaxConfiguration {
  taxId: string;
  taxCode: string;
  taxType: string;
  rate: number;
  description?: string;
  isActive: boolean;
}

const taxTypes = ["GST", "Service Tax", "VAT", "Cess", "Others"];

export function TaxConfiguration() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [taxTypeFilter, setTaxTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: TaxConfiguration } | null>(null);
  const [toDelete, setToDelete] = useState<TaxConfiguration | null>(null);
  const [formData, setFormData] = useState<Partial<TaxConfiguration>>({});

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: taxConfigurations = [], isLoading, error } = useQuery({
    queryKey: ["taxConfigurations", debouncedSearch, taxTypeFilter, statusFilter],
    queryFn: () =>
      taxConfigurationService.getAll(
        debouncedSearch || undefined,
        taxTypeFilter || undefined,
        undefined, // rateFrom
        undefined, // rateTo
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: taxConfigurationService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["taxConfigurations"] });
      toast.success(res?.message || "Tax configuration added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add tax configuration");
    },
  });

  const updateMutation = useMutation({
    mutationFn: taxConfigurationService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["taxConfigurations"] });
      toast.success(res?.message || "Tax configuration updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update tax configuration");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taxConfigurationService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["taxConfigurations"] });
      toast.success(res?.message || "Tax configuration deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete tax configuration");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      taxCode: "",
      taxType: "",
      rate: 0,
      description: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: TaxConfiguration) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.taxType) {
      toast.error("Please select a Tax Type.");
      return;
    }

    const payload = {
      taxType: formData.taxType,
      rate: Number(formData.rate) || 0,
      description: formData.description || "",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        taxId: formData.taxId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.taxId) return;
    deleteMutation.mutate({ taxId: toDelete.taxId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Tax configuration"
        action={
          <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add tax
            </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tax configurations..."
          filters={[
            {
              key: "taxType",
              label: "Tax Type",
              value: taxTypeFilter,
              onChange: setTaxTypeFilter,
              options: taxTypes.map((t) => ({ value: t, label: t })),
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
              <Th>Type</Th>
              <Th>Rate</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading tax configurations...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading tax configurations: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {taxConfigurations.map((item: TaxConfiguration) => (
                  <tr key={item.taxId} className="stc-row">
                    <Td mono>{item.taxCode}</Td>
                    <Td>{item.taxType}</Td>
                    <Td>{item.rate}%</Td>
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
                {taxConfigurations.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>No records yet — use Add tax to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Tax Configuration`}
            subtitle={modal.mode === "add" ? "Add a new tax rule" : "Update tax rule"}
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
                    value={formData.taxCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Type</label>
                <select
                  value={formData.taxType || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, taxType: e.target.value }))}
                >
                  <option value="">Select TAX Type</option>
                  {taxTypes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Rate (%)</label>
                <input
                  type="number"
                  value={formData.rate ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, rate: Number(e.target.value) }))}
                />
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
          <Modal title="Delete — Tax Configuration" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.taxCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default TaxConfiguration;
