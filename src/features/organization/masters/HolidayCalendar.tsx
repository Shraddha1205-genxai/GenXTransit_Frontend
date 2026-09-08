import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { T } from "../../../constants/theme";
import { Card } from "../../../components/common/Card";
import { Table, Th, Td } from "../../../components/common/Table";
import { Modal } from "../../../components/common/Modal";
import { TableToolbar } from "../../../components/common/TableToolbar";
import { useDebounce } from "../../../hooks/useDebounce";

import { holidayService, Holiday, CreateHolidayDto, UpdateHolidayDto } from "../../../api/organization/master/holidayService";
import { StatusBadge } from "../../../components/common";
import { usePermissions } from "../../../hooks/usePermissions";

const typeOptions = ["National", "Regional", "Local", "Other"];

export function HolidayCalendar() {
  const { canAdd, canEdit, canDelete } = usePermissions("HolidayCalendar");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Holiday } | null>(null);
  const [toDelete, setToDelete] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<Partial<Holiday>>({});

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ["holidays", debouncedSearch, typeFilter, startDate, endDate, statusFilter],
    queryFn: () => holidayService.getAll({
      searchText: debouncedSearch || undefined,
      type: typeFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isActive: isActiveParam,
      pageNumber: 1,
      pageSize: 1000
    })
  });

  const addMutation = useMutation({
    mutationFn: (dto: CreateHolidayDto) => holidayService.insert(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success(res?.message || "Holiday added successfully");
      setModal(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (dto: UpdateHolidayDto) => holidayService.update(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success(res?.message || "Holiday updated successfully");
      setModal(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => holidayService.delete(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success(res?.message || "Holiday deleted successfully");
      setToDelete(null);
    }
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({ holidayName: "", occasion: "", date: "", description: "", type: "" });
    setFormErrors({});
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Holiday) => {
    setFormData(record);
    setFormErrors({});
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!(formData.holidayName || "").trim()) {
      errors.holidayName = "Holiday Name is required.";
    }
    if (!(formData.date || "").trim()) {
      errors.date = "Date is required.";
    }
    if (!(formData.description || "").trim()) {
      errors.description = "Description is required.";
    }
    if (!formData.type) {
      errors.type = "Please select a Type.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill required fields.");
      return;
    }
    setFormErrors({});

    if (modal?.mode === "add") {
      addMutation.mutate({
        holidayName: formData.holidayName!,
        occasion: formData.occasion || "",
        date: formData.date!,
        description: formData.description!,
        type: formData.type!,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        holidayId: modal.record.holidayId,
        holidayName: formData.holidayName!,
        occasion: formData.occasion || "",
        date: formData.date!,
        description: formData.description!,
        type: formData.type!,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (toDelete) {
      deleteMutation.mutate(toDelete.holidayId);
    }
  };

  if (error) {
    toast.error(error.message || "Failed to load holidays");
  }

  return (
    <div>
      <Card
        title="Holiday calendar"
        action={
          canAdd ? (
            <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add holiday
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          searchPlaceholder="Search holidays..."
          search={search}
          onSearchChange={setSearch}
          filters={[
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              onChange: setTypeFilter,
              options: typeOptions.map((opt) => ({ value: opt, label: opt })),
            },
            {
              key: "startDate",
              label: "Start Date",
              value: startDate,
              onChange: setStartDate,
              type: "date"
            },
            {
              key: "endDate",
              label: "End Date",
              value: endDate,
              onChange: setEndDate,
              type: "date"
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
              <Th>Date</Th>
              <Th>Occasion</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>Loading...</Td>
              </tr>
            ) : holidays.length === 0 ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>No records yet — use Add holiday to create one.</Td>
              </tr>
            ) : (
              holidays.map((item: Holiday) => (
                <tr key={item.holidayId} className="stc-row">
                  <Td>{item.holidayCode || "-"}</Td>
                  <Td>{item.holidayName}</Td>
                  <Td mono>{item.date}</Td>
                  <Td>{item.occasion}</Td>
                  <Td>{item.type}</Td>
                  <Td>
                    <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                  </Td>
                  {statusFilter !== "Inactive" && (
                    <Td align="right">
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        {canEdit && (
                          <button disabled={statusFilter === "Both" && !item.isActive} onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: statusFilter === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: statusFilter === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Pencil size={14} color={T.textSoft} />
                          </button>
                        )}
                        {canDelete && (
                          <button disabled={statusFilter === "Both" && !item.isActive} onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: statusFilter === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: statusFilter === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Trash2 size={14} color={T.red} />
                          </button>
                        )}
                      </div>
                    </Td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Holiday Calendar`}
            subtitle={modal.mode === "add" ? "Add a new holiday" : "Update holiday"}
            onClose={() => setModal(null)}
            width={520}
            footer={
              <>
                <button className="stc-btn stc-btn-ghost" onClick={() => setModal(null)} disabled={addMutation.isPending || updateMutation.isPending}>Cancel</button>
                <button className="stc-btn stc-btn-primary" onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>Save changes</button>
              </>
            }
          >
            <div className="stc-form-grid">
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Code</label>
                  <input
                    value={formData.holidayCode || ""}
                    disabled
                    style={{ background: "#f5f5f5", cursor: "not-allowed" }}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">
                  Holiday Name <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  style={{ borderColor: formErrors.holidayName ? T.red : undefined }}
                  value={formData.holidayName || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, holidayName: e.target.value }));
                    if (formErrors.holidayName) setFormErrors((prev) => ({ ...prev, holidayName: "" }));
                  }}
                />
                {formErrors.holidayName && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.holidayName}</span>}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Occasion</label>
                <input
                  value={formData.occasion || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, occasion: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Date (YYYY-MM-DD) <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  type="date"
                  style={{ borderColor: formErrors.date ? T.red : undefined }}
                  value={formData.date || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, date: e.target.value }));
                    if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: "" }));
                  }}
                />
                {formErrors.date && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.date}</span>}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Description <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  style={{ borderColor: formErrors.description ? T.red : undefined }}
                  value={formData.description || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, description: e.target.value }));
                    if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: "" }));
                  }}
                />
                {formErrors.description && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.description}</span>}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Type <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  style={{ borderColor: formErrors.type ? T.red : undefined }}
                  value={formData.type || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, type: e.target.value }));
                    if (formErrors.type) setFormErrors((prev) => ({ ...prev, type: "" }));
                  }}
                >
                  <option value="">Select Type</option>
                  {typeOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {formErrors.type && <span style={{ color: T.red, fontSize: 11 }}>{formErrors.type}</span>}
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal 
            title="Delete — Holiday Calendar" 
            subtitle="This action cannot be undone" 
            icon={<Trash2 size={20} color={T.red} />} 
            iconVariant="danger" 
            onClose={() => setToDelete(null)} 
            width={420} 
            footer={
              <>
                <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)} disabled={deleteMutation.isPending}>Cancel</button>
                <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>Delete</button>
              </>
            }
          >
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.holidayName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default HolidayCalendar;
