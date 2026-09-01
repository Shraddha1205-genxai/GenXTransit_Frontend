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
import { seatLayoutService } from "../../../api/organization/master/seatLayoutService";
import { vehicleCategoryService } from "../../../api/organization/master/vehicleCategoryService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface SeatLayout {
  layoutId: string;
  layoutCode: string;
  categoryCode: string;
  categoryName: string;
  categoryId: string;
  description?: string;
  isActive: boolean;
}

export function SeatLayouts() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: SeatLayout } | null>(null);
  const [toDelete, setToDelete] = useState<SeatLayout | null>(null);
  const [formData, setFormData] = useState<Partial<SeatLayout>>({});

  const categoryIdParam = categoryIdFilter === "" ? undefined : Number(categoryIdFilter);
  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: seatLayouts = [], isLoading, error } = useQuery({
    queryKey: ["seatLayouts", debouncedSearch, categoryIdFilter, statusFilter],
    queryFn: () =>
      seatLayoutService.getAll(
        debouncedSearch || undefined,
        categoryIdParam,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["vehicleCategories", true],
    queryFn: () => vehicleCategoryService.getAll(undefined, undefined, undefined, true),
    staleTime: Infinity,
  });

  const addMutation = useMutation({
    mutationFn: seatLayoutService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["seatLayouts"] });
      toast.success(res?.message || "Seat layout added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add seat layout");
    },
  });

  const updateMutation = useMutation({
    mutationFn: seatLayoutService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["seatLayouts"] });
      toast.success(res?.message || "Seat layout updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update seat layout");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: seatLayoutService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["seatLayouts"] });
      toast.success(res?.message || "Seat layout deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete seat layout");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      layoutCode: "",
      categoryId: "",
      description: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: SeatLayout) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.description || !formData.categoryId) {
      toast.error("Please fill required fields.");
      return;
    }

    const payload = {
      description: formData.description || "",
      categoryId: formData.categoryId,
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        layoutId: formData.layoutId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.layoutId) return;
    deleteMutation.mutate({ layoutId: toDelete.layoutId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Seat layouts"
        action={
          <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add layout
            </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search seat layouts..."
          filters={[
            {
              key: "category",
              label: "Vehicle category",
              value: categoryIdFilter,
              onChange: setCategoryIdFilter,
              options: categoryOptions.map((opt) => ({ value: opt.categoryId, label: opt.categoryName })),
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
              <Th>Layout</Th>
              <Th>Vehicle category</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading seat layouts...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading seat layouts: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {seatLayouts.map((item: SeatLayout) => (
                  <tr key={item.layoutId} className="stc-row">
                    <Td mono>{item.layoutCode}</Td>
                    <Td>{item.description}</Td>
                    <Td mono>{item.categoryName || item.categoryCode || "-"}</Td>
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
                {seatLayouts.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>No records yet — use Add layout to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Seat Layouts`}
            subtitle={modal.mode === "add" ? "Add a new seat layout" : "Update seat layout"}
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
                    value={formData.layoutCode || ""}
                  />
                </div>
              )}
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Vehicle category</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryId: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.categoryId} value={opt.categoryId}>
                      {opt.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Layout Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Seat Layouts" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.layoutCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default SeatLayouts;
