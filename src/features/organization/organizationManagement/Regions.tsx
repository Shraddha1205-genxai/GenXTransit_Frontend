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
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Region {
  regionId: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
  divisions: number;
  depots: number;
  stations: number;
  workshops: number;
}

export interface RegionPayload {
  regionId: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
}

export function Regions() {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: Region;
  } | null>(null);
  const [toDelete, setToDelete] = useState<Region | null>(null);

  const [formData, setFormData] = useState<Partial<Region>>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("Active");

  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["regions", debouncedSearch, statusFilter],
    queryFn: () => regionService.getAll(debouncedSearch || undefined, isActiveParam),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: regionService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success(res.message || "Region created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create region");
    },
  });

  const updateMutation = useMutation({
    mutationFn: regionService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success(res.message || "Region updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update region");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: regionService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success(res.message || "Region deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete region");
    },
  });
  const filteredData = data;

  const handleOpenAdd = () => {
    setFormData({
      regionId: "",
      regionCode: "",
      regionName: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Region) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.regionName) return;
    const newRecord: RegionPayload = {
      regionId:
        modal?.mode === "edit" && modal.record ? modal.record.regionId : "",
      regionCode:
        modal?.mode === "edit" && modal.record ? modal.record.regionCode : "",
      regionName: formData.regionName.trim(),
      isActive: formData.isActive ?? true,
    };

    if (modal?.mode === "add") {
      addMutation.mutate({ regionName: newRecord.regionName, isActive: newRecord.isActive });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({ regionId: newRecord.regionId, regionName: newRecord.regionName, isActive: newRecord.isActive });
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate({ regionId: toDelete.regionId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Regions"
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
            <Plus size={13} /> Add region
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search regions..."
          filters={[
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
              <Th>Region code</Th>
              <Th>Region Name</Th>
              <Th>Divisions</Th>
              <Th>Depots</Th>
              <Th>Stations</Th>
              <Th>Workshops</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading regions...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading regions: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {filteredData.map((r: Region) => (
                  <tr key={r.regionId} className="stc-row">
                    <Td mono>{r.regionCode}</Td>
                    <Td>{r.regionName}</Td>
                    <Td>
                      <RouteChip>{r.divisions}</RouteChip>
                    </Td>
                    <Td>
                      <RouteChip>{r.depots}</RouteChip>
                    </Td>
                    <Td>
                      <RouteChip>{r.stations}</RouteChip>
                    </Td>
                    <Td>
                      <RouteChip>{r.workshops}</RouteChip>
                    </Td>
                    <Td>
                      <StatusBadge status={r.isActive ? "Active" : "Inactive"} />
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
                            onClick={() => handleOpenEdit(r)}
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
                            onClick={() => setToDelete(r)}
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
                    <Td colSpan={statusFilter === "Inactive" ? 7 : 8}>
                      {data.length === 0
                        ? "No records yet — use Add region to create one."
                        : "No regions match the search."}
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Regions`}
            subtitle={
              modal.mode === "add"
                ? "Create a new region"
                : "Update region details"
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
                <>
                  <div className="stc-field">
                    <label className="stc-field-label">Region code</label>
                    <input value={formData.regionCode || ""} readOnly />
                  </div>
                </>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Region Name</label>
                <input
                  value={formData.regionName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, regionName: e.target.value }))
                  }
                />
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
            title="Delete — Regions"
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
              This will permanently remove {toDelete.regionName} from the list.
              This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Regions;
