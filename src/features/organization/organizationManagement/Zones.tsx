import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  TableToolbar,
  Th,
  Td,
  Modal,
  Table,
  StatusBadge,
} from "../../../components/common";
import { zoneService } from "../../../api/organization/organizationManagement/zoneService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";

export interface Zone {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  districts: string[];
  isActive: boolean;
}
export interface ZonePayload {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  regionId: string;
  districts: string[];
  isActive: boolean;
}

export function Zones() {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: Zone;
  } | null>(null);
  const [toDelete, setToDelete] = useState<Zone | null>(null);
  const [formData, setFormData] = useState<Partial<Zone>>({});
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data = [], isLoading: isLoadingZones, error: errorZones } = useQuery({
    queryKey: ["zones", search, regionFilter, statusFilter],
    queryFn: () => zoneService.getAll(search || undefined, regionFilter || undefined, isActiveParam),
  });

  const { data: regionOptions = [], isLoading: isLoadingRegions, error: errorRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => regionService.getAll(),
  });

  const addMutation = useMutation({
    mutationFn: zoneService.insert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create zone");
    },
  });

  const updateMutation = useMutation({
    mutationFn: zoneService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update zone");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: zoneService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success("Zone deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete zone");
    },
  });

  if (isLoadingZones || isLoadingRegions) {
    return <div style={{ padding: 20, textAlign: "center", color: "var(--text-soft)" }}>Loading zones...</div>;
  }

  if (errorZones || errorRegions) {
    const errorMsg = (errorZones as Error)?.message || (errorRegions as Error)?.message;
    return <div style={{ padding: 20, textAlign: "center", color: "var(--red)" }}>Error loading data: {errorMsg}</div>;
  }

  const filteredData = data;

  const handleOpenAdd = () => {
    setFormData({
      zoneName: "",
      regionId: regionOptions?.[0]?.regionId || "",
      districts: [],
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Zone) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.zoneName || !formData.regionId) return;

    const districtsArray = Array.isArray(formData.districts)
      ? formData.districts
      : formData.districts
        ? String(formData.districts)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [];

    if (modal?.mode === "add") {
      addMutation.mutate({
        zoneName: formData.zoneName.trim(),
        regionId: formData.regionId,
        districts: districtsArray,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        zoneId: modal.record.zoneId,
        zoneName: formData.zoneName.trim(),
        regionId: formData.regionId,
        districts: districtsArray,
        isActive: formData.isActive ?? true,
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate({ zoneId: toDelete.zoneId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Zone"
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
            <Plus size={13} /> Add zone
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search zones..."
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
              <Th>Zone Code</Th>
              <Th>Zone Name</Th>
              <Th>Region Name</Th>
              <Th>Districts</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item: Zone) => (
              <tr key={item.zoneId} className="stc-row">
                <Td mono>{item.zoneCode}</Td>
                <Td>{item.zoneName}</Td>
                <Td mono>{item.regionName}</Td>
                <Td>{item.districts?.join(", ")}</Td>
                <Td>
                  <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                </Td>
                <Td align="right">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => handleOpenEdit(item)}
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
                      onClick={() => setToDelete(item)}
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
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  {data.length === 0
                    ? "No records yet — use Add zone to create one."
                    : "No zones match the selected filters."}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Zone`}
            subtitle={
              modal.mode === "add" ? "Add a new zone" : "Update zone details"
            }
            onClose={() => setModal(null)}
            width={620}
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
                  <label className="stc-field-label">Zone Code</label>
                  <input value={formData.zoneCode || ""} readOnly />
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Zone Name</label>
                <input
                  value={formData.zoneName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, zoneName: e.target.value }))
                  }
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Region Code</label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, regionId: e.target.value }))
                  }
                >
                  {regionOptions &&
                    regionOptions.length > 0 &&
                    regionOptions.map((opt) => (
                      <option key={opt.regionId} value={opt.regionId}>
                        {opt.regionCode}
                      </option>
                    ))}
                </select>
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Districts</label>
                <input
                  value={
                    Array.isArray(formData.districts)
                      ? formData.districts.join(", ")
                      : formData.districts || ""
                  }
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      districts: e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>

              {modal.mode === "edit" && (
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
              )}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal
            title="Delete — Zone"
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
              This will permanently remove {toDelete.zoneName} from the list.
              This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Zones;
