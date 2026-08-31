import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  RouteChip,
  TableToolbar,
  Th,
  Td,
  Modal,
  Table,
  StatusBadge,
} from "../../../components/common";
import { divisionService } from "../../../api/organization/organizationManagement/divisionService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Division {
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  depots: number;
  workshops: number;
  stations: number;
  parkingYards: number;
  isActive: boolean;
}

export interface DivisionPayload {
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  regionId: string;
  isActive: boolean;
}

export function Divisions() {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: DivisionPayload;
  } | null>(null);
  const [toDelete, setToDelete] = useState<DivisionPayload | null>(null);
  const [formData, setFormData] = useState<Partial<DivisionPayload>>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data = [], isLoading: isLoadingDivisions, error: errorDivisions } = useQuery({
    queryKey: ["divisions", debouncedSearch, regionFilter, statusFilter],
    queryFn: () => divisionService.getAll(debouncedSearch || undefined, regionFilter || undefined, isActiveParam),
    staleTime: 0,
  });

  const { data: regionOptions = [], isLoading: isLoadingRegions, error: errorRegions } = useQuery({
    queryKey: ["regions", true],
    queryFn: () => regionService.getAll(undefined, true),
  });

  const addMutation = useMutation({
    mutationFn: divisionService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      toast.success(res.message || "Division created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create division");
    },
  });

  const updateMutation = useMutation({
    mutationFn: divisionService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      toast.success(res.message || "Division updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update division");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: divisionService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      toast.success(res.message || "Division deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete division");
    },
  });

  const filteredData = data;

  const handleOpenAdd = () => {
    setFormData({
      divisionId: "",
      divisionCode: "",
      divisionName: "",
      regionId: regionOptions[0]?.regionId || "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: DivisionPayload) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.divisionName) return;

    const rId = formData.regionId || regionOptions[0]?.regionId || "";

    if (modal?.mode === "add") {
      addMutation.mutate({
        divisionName: formData.divisionName.trim(),
        regionId: rId,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        divisionId: modal.record.divisionId,
        divisionName: formData.divisionName.trim(),
        regionId: rId,
        isActive: formData.isActive ?? true,
      });
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate({ divisionId: toDelete.divisionId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Divisions"
        action={
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
            <Plus size={13} /> Add division
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search divisions..."
          filters={[
            {
              key: "region",
              label: "All regions",
              value: regionFilter,
              onChange: setRegionFilter,
              options: regionOptions.map((region) => ({
                value: region.regionId,
                label: region.regionName || region.regionCode,
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
              ],
            },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Division Code</Th>
              <Th>Division Name</Th>
              <Th>Region</Th>
              <Th>Depots</Th>
              <Th>Workshops</Th>
              <Th>Stations</Th>
              <Th>Parking Yards</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoadingDivisions || isLoadingRegions ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 8 : 9}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading divisions...</div>
                </Td>
              </tr>
            ) : errorDivisions || errorRegions ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 8 : 9}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading data: {(errorDivisions as Error)?.message || (errorRegions as Error)?.message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {filteredData.map((d: Division) => (
                  <tr key={d.divisionId} className="stc-row">
                    <Td mono>{d.divisionCode}</Td>
                    <Td>{d.divisionName}</Td>
                    <Td mono>
                      <RouteChip> {d.regionName} </RouteChip>
                    </Td>
                    <Td mono>{d.depots}</Td>
                    <Td mono>{d.workshops}</Td>
                    <Td mono>{d.stations}</Td>
                    <Td mono>{d.parkingYards}</Td>
                    <Td>
                      <StatusBadge status={d.isActive ? "Active" : "Inactive"} />
                    </Td>
                    {statusFilter !== "Inactive" && (
                      <Td align="right">
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleOpenEdit(d)}
                            title="Edit"
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
                          <button
                            onClick={() => setToDelete(d)}
                            title="Delete"
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
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 8 : 9}>
                      {data.length === 0
                        ? "No records yet — use Add division to create one."
                        : "No divisions match the selected filters."}
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Divisions`}
            subtitle={
              modal.mode === "add"
                ? "Create a new division"
                : "Update division details"
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
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Division Code</label>
                  <input value={formData.divisionCode || ""} readOnly />
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Division Name</label>
                <input
                  value={formData.divisionName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, divisionName: e.target.value }))
                  }
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Region</label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, regionId: e.target.value }))
                  }
                >
                  {regionOptions.length > 0 &&
                    regionOptions.map((opt) => (
                      <option key={opt.regionId} value={opt.regionId}>
                        {opt.regionName}
                      </option>
                    ))}
                </select>
              </div>

              {/* {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.isActive ? "Active" : "Inactive"}
                    onChange={(e) =>
                      setFormData((s) => ({
                        ...s,
                        isActive: e.target.value === "Active",
                      }))
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )} */}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal
            title="Delete — Divisions"
            subtitle="This action cannot be undone"
            icon={<Trash2 size={20} color={T.red} />}
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
              This will permanently remove {toDelete.divisionName} from the
              list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Divisions;
