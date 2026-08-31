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
import { vehicleCategoryService } from "../../../api/organization/master/vehicleCategoryService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface VehicleCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  capacity: number;
  type: string;
  class: string;
  isActive: boolean;
}

export function VehicleCategories() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: VehicleCategory } | null>(null);
  const [toDelete, setToDelete] = useState<VehicleCategory | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleCategory>>({});

  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data: vehicleCategories = [], isLoading, error } = useQuery({
    queryKey: ["vehicleCategories", debouncedSearch, typeFilter, classFilter, statusFilter],
    queryFn: () =>
      vehicleCategoryService.getAll(
        debouncedSearch || undefined,
        typeFilter || undefined,
        classFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: vehicleCategoryService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleCategories"] });
      toast.success(res.message || "Vehicle category added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add vehicle category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: vehicleCategoryService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleCategories"] });
      toast.success(res.message || "Vehicle category updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update vehicle category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleCategoryService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleCategories"] });
      toast.success(res.message || "Vehicle category deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete vehicle category");
    },
  });

  const handleOpenAdd = () => {
    setFormData({ categoryCode: "", categoryName: "", capacity: 0, type: "Non AC", class: "Standard" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: VehicleCategory) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.categoryName) return;

    if (modal?.mode === "add") {
      addMutation.mutate({
        categoryName: formData.categoryName || "",
        capacity: String(formData.capacity ?? 0),
        type: formData.type || "Non AC",
        class: formData.class || "Standard",
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        categoryId: formData.categoryId || "",
        categoryName: formData.categoryName || "",
        capacity: String(formData.capacity ?? 0),
        type: formData.type || "Non AC",
        class: formData.class || "Standard",
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.categoryId) return;
    deleteMutation.mutate({ categoryId: toDelete.categoryId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Vehicle categories"
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
          searchPlaceholder="Search categories..."
          filters={[
            {
              key: "type",
              label: "Type",
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { value: "AC", label: "AC" },
                { value: "Non AC", label: "Non AC" },
              ],
            },
            {
              key: "class",
              label: "Class",
              value: classFilter,
              onChange: setClassFilter,
              options: [
                { value: "Luxury", label: "Luxury" },
                { value: "Standard", label: "Standard" },
                { value: "City", label: "City" },
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
              ],
            },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th align="center">Capacity</Th>
              <Th>Type</Th>
              <Th>Class</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 6 : 7}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading categories...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 6 : 7}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading categories: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {vehicleCategories.map((item: VehicleCategory) => (
                  <tr key={item.categoryId} className="stc-row">
                    <Td mono>{item.categoryCode}</Td>
                    <Td>{item.categoryName}</Td>
                    <Td align="center">{item.capacity}</Td>
                    <Td>{item.type}</Td>
                    <Td>{item.class}</Td>
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
                {vehicleCategories.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 6 : 7}>No records yet — use Add category to create one.</Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Vehicle Categories`}
            subtitle={modal.mode === "add" ? "Add a new vehicle category" : "Update vehicle category"}
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
                    value={formData.categoryCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.categoryName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, categoryName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, capacity: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Type</label>
                <select
                  value={formData.type || "Non AC"}
                  onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
                >
                  <option value="AC">AC</option>
                  <option value="Non AC">Non AC</option>
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Class</label>
                <select
                  value={formData.class || "Standard"}
                  onChange={(e) => setFormData((s) => ({ ...s, class: e.target.value }))}
                >
                  <option value="Luxury">Luxury</option>
                  <option value="Standard">Standard</option>
                  <option value="City">City</option>
                </select>
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Vehicle Categories" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.categoryName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default VehicleCategories;
