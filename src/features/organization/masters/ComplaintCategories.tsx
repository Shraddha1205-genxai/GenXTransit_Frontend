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
import { complaintCategoryService } from "../../../api/organization/master/complaintCategoryService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface ComplaintCategory {
  complaintId: string;
  complaintCode: string;
  complaintTitle: string;
  complaintCategory: string;
  sla: string;
  description?: string;
  isActive: boolean;
}

const categories = ["General", "Technical", "Billing", "Service", "Other"];
const slas = ["24 Hours", "48 Hours", "72 Hours", "1 Week", "2 Weeks"];

export function ComplaintCategories() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState("");
  const [slaFilter, setSlaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: ComplaintCategory } | null>(null);
  const [toDelete, setToDelete] = useState<ComplaintCategory | null>(null);
  const [formData, setFormData] = useState<Partial<ComplaintCategory>>({});

  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data: complaintCategories = [], isLoading, error } = useQuery({
    queryKey: ["complaintCategories", debouncedSearch, complaintCategoryFilter, slaFilter, statusFilter],
    queryFn: () =>
      complaintCategoryService.getAll(
        debouncedSearch || undefined,
        complaintCategoryFilter || undefined,
        slaFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: complaintCategoryService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["complaintCategories"] });
      toast.success(res?.message || "Complaint category added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add complaint category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: complaintCategoryService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["complaintCategories"] });
      toast.success(res?.message || "Complaint category updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update complaint category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: complaintCategoryService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["complaintCategories"] });
      toast.success(res?.message || "Complaint category deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete complaint category");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      complaintCode: "",
      complaintTitle: "",
      complaintCategory: categories[0],
      sla: slas[0],
      description: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ComplaintCategory) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.complaintTitle) return;

    const payload = {
      complaintTitle: formData.complaintTitle || "",
      complaintCategory: formData.complaintCategory || categories[0],
      sla: formData.sla || slas[0],
      description: formData.description || "",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        complaintId: formData.complaintId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.complaintId) return;
    deleteMutation.mutate({ complaintId: toDelete.complaintId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Complaint categories"
        action={
          statusFilter !== "Inactive" && (
            <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add category
            </button>
          )
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search complaint categories..."
          filters={[
            {
              key: "complaintCategory",
              label: "Category",
              value: complaintCategoryFilter,
              onChange: setComplaintCategoryFilter,
              options: categories.map((c) => ({ value: c, label: c })),
            },
            {
              key: "sla",
              label: "SLA",
              value: slaFilter,
              onChange: setSlaFilter,
              options: slas.map((s) => ({ value: s, label: s })),
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
              <Th>Code</Th>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>SLA</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading complaint categories...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading complaint categories: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {complaintCategories.map((item: ComplaintCategory) => (
                  <tr key={item.complaintId} className="stc-row">
                    <Td mono>{item.complaintCode}</Td>
                    <Td>{item.complaintTitle}</Td>
                    <Td>{item.complaintCategory}</Td>
                    <Td>{item.sla}</Td>
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
                {complaintCategories.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>No records yet — use Add category to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Complaint Categories`}
            subtitle={modal.mode === "add" ? "Add a new category" : "Update category"}
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
                    value={formData.complaintCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Category</label>
                <select
                  value={formData.complaintCategory || categories[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, complaintCategory: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Title</label>
                <input
                  value={formData.complaintTitle || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, complaintTitle: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">SLA</label>
                <select
                  value={formData.sla || slas[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, sla: e.target.value }))}
                >
                  <option value="">Select SLA</option>
                  {slas.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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
          <Modal title="Delete — Complaint Categories" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.complaintCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default ComplaintCategories;
