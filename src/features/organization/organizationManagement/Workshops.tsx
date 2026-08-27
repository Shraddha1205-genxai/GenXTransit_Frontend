import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  RouteChip,
  StatusBadge,
  TableToolbar,
  Th,
  Td,
  Modal,
  Table,
} from "../../../components/common";
import { workshopService } from "../../../api/organization/organizationManagement/workshopService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { divisionService } from "../../../api/organization/organizationManagement/divisionService";
import { depotService } from "../../../api/organization/organizationManagement/depotService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Workshop {
  workShopId: string;
  workShopCode: string;
  workShopName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}
export interface WorkshopPayload {
  workShopId: string;
  workShopCode: string;
  workShopName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}
export interface WorkshopPageProps {}

const initialDefaultWorkshops: Workshop[] = [
  {
    workShopId: "WS-0001",
    workShopCode: "WS-0001",
    workShopName: "Swargate Central Workshop",
    regionId: "REG-0001",
    regionCode: "REG-0001",
    regionName: "Region 1",
    divisionId: "DIV-0001",
    divisionCode: "DIV-0001",
    divisionName: "Division 1",
    depotId: "MSRTC-PUN-01",
    depotCode: "MSRTC-PUN-01",
    depotName: "Depot 1",
    workBays: 12,
    activeRepairJobs: 7,
    isActive: true,
  },
  {
    workShopId: "WS-0002",
    workShopCode: "WS-0002",
    workShopName: "Wadala Repair Workshop",
    regionId: "REG-0002",
    regionCode: "REG-0002",
    regionName: "Region 2",
    divisionId: "DIV-0003",
    divisionCode: "DIV-0003",
    divisionName: "Division 3",
    depotId: "BEST-MUM-04",
    depotCode: "BEST-MUM-04",
    depotName: "Depot 4",
    workBays: 8,
    activeRepairJobs: 5,
    isActive: true,
  },
  {
    workShopId: "WS-0003",
    workShopCode: "WS-0003",
    workShopName: "PMPML Swargate Workshop",
    regionId: "REG-0001",
    regionCode: "REG-0001",
    regionName: "Region 1",
    divisionId: "DIV-₀₀₀₁",
    divisionCode: "DIV-₀₀₀₁",
    divisionName: "Division 1",
    depotId: "PMPML-PUN-₀₂",
    depotCode: "PMPML-PUN-₀₂",
    depotName: "Depot 2",
    workBays: 6,
    activeRepairJobs: 2,
    isActive: true,
  },
];

export function Workshops({}: WorkshopPageProps) {
  const queryClient = useQueryClient();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterDepot, setFilterDepot] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active");

  const isActiveParam = filterStatus === "" ? undefined : filterStatus === "Active";

  // Main Query
  const { data: workshops = [], isLoading, error } = useQuery({
    queryKey: ["workshops", debouncedSearch, filterRegion, filterDivision, filterDepot, filterStatus],
    queryFn: () =>
      workshopService.getAll(
        debouncedSearch || undefined,
        filterRegion || undefined,
        filterDivision || undefined,
        filterDepot || undefined,
        isActiveParam
      ),
    staleTime: 0,
  });

  // Dropdown options queries
  const { data: regionOptions = [] } = useQuery({
    queryKey: ["regions", true],
    queryFn: () => regionService.getAll(undefined, true),
    staleTime: Infinity,
  });

  const { data: divisionOptions = [] } = useQuery({
    queryKey: ["divisions", true],
    queryFn: () => divisionService.getAll(undefined, undefined, true),
    staleTime: Infinity,
  });

  const { data: depotOptions = [] } = useQuery({
    queryKey: ["depots", true],
    queryFn: () => depotService.getAll(undefined, undefined, undefined, undefined, undefined, true),
    staleTime: Infinity,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: workshopService.insert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      toast.success("Workshop created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create workshop");
    },
  });

  const updateMutation = useMutation({
    mutationFn: workshopService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      toast.success("Workshop updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update workshop");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workshopService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      toast.success("Workshop deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete workshop");
    },
  });

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Workshop } | null>(null);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<Partial<Workshop>>({});

  const handleOpenAdd = () => {
    setFormData({
      workShopCode: "",
      workShopName: "",
      regionId: "",
      divisionId: "",
      depotId: "",
      workBays: 0,
      activeRepairJobs: 0,
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Workshop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.workShopName || !formData.regionId || !formData.divisionId || !formData.depotId) return;

    if (modal?.mode === "add") {
      addMutation.mutate({
        workShopName: formData.workShopName.trim(),
        regionId: formData.regionId,
        divisionId: formData.divisionId,
        depotId: formData.depotId,
        workBays: Number(formData.workBays) || 0,
        activeRepairJobs: Number(formData.activeRepairJobs) || 0,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        workShopId: modal.record.workShopId,
        workShopName: formData.workShopName.trim(),
        regionId: formData.regionId,
        divisionId: formData.divisionId,
        depotId: formData.depotId,
        workBays: Number(formData.workBays) || 0,
        activeRepairJobs: Number(formData.activeRepairJobs) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.workShopId) return;
    deleteMutation.mutate({ workShopId: toDelete.workShopId });
    setToDelete(null);
  };



  return (
    <div>
      <Card
        title="Workshops"
        action={
          filterStatus !== "Inactive" && (
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
              <Plus size={13} /> Add workshop
            </button>
          )
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search workshops..."
          style={{ gridTemplateColumns: "minmax(200px, 1.5fr) repeat(4, minmax(130px, 1fr))" }}
          filters={[
            {
              key: "region",
              label: "All Regions",
              value: filterRegion,
              onChange: (val) => {
                setFilterRegion(val);
                setFilterDivision("");
                setFilterDepot("");
              },
              options: regionOptions.map((r) => ({ value: String(r.regionId), label: r.regionName })),
            },
            {
              key: "division",
              label: "All Divisions",
              value: filterDivision,
              onChange: (val) => {
                setFilterDivision(val);
                setFilterDepot("");
              },
              options: divisionOptions
                .filter((d) => !filterRegion || String(d.regionId) === filterRegion)
                .map((d) => ({ value: String(d.divisionId), label: d.divisionName })),
              disabled: !filterRegion,
            },
            {
              key: "depot",
              label: "All Depots",
              value: filterDepot,
              onChange: setFilterDepot,
              options: depotOptions
                .filter((d) => !filterDivision || String(d.divisionId) === filterDivision)
                .map((d) => ({ value: String(d.depotId), label: d.depotName })),
              disabled: !filterDivision,
            },
            {
              key: "status",
              label: "Status",
              value: filterStatus,
              onChange: setFilterStatus,
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
              <Th>WorkShop Code</Th>
              <Th>WorkShop Name</Th>
              <Th>Region Code</Th>
              <Th>Division Code</Th>
              <Th>Depot Code</Th>
              <Th>Work Bays</Th>
              <Th>Active Repair Jobs</Th>
              <Th>Status</Th>
              {filterStatus !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={filterStatus !== "Inactive" ? 9 : 8}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading workshops...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={filterStatus !== "Inactive" ? 9 : 8}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading workshops: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {workshops.map((w: Workshop) => (
                  <tr key={w.workShopId} className="stc-row">
                    <Td mono>
                      <RouteChip>{w.workShopCode}</RouteChip>
                    </Td>
                    <Td>{w.workShopName}</Td>
                    <Td mono>{w.regionCode}</Td>
                    <Td mono>{w.divisionCode}</Td>
                    <Td mono>{w.depotCode}</Td>
                    <Td>{w.workBays}</Td>
                    <Td>{w.activeRepairJobs}</Td>
                    <Td>
                      <StatusBadge status={w.isActive ? "Active" : "Inactive"} />
                    </Td>
                    {filterStatus !== "Inactive" && (
                      <Td align="right">
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleOpenEdit(w)}
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
                            onClick={() => setToDelete(w)}
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
                {workshops.length === 0 && (
                  <tr>
                    <Td colSpan={filterStatus !== "Inactive" ? 9 : 8}>
                      No workshops match the selected filters.
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Workshop`}
            subtitle={
              modal.mode === "add"
                ? "Add a new workshop"
                : "Update workshop details"
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
                  <label className="stc-field-label">WorkShop Code</label>
                  <input value={formData.workShopCode || ""} readOnly />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">WorkShop Name</label>
                <input
                  value={formData.workShopName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, workShopName: e.target.value }))
                  }
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Region</label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      regionId: e.target.value,
                      divisionId: "",
                      depotId: "",
                    }))
                  }
                >
                  <option value="">Select Region</option>
                  {regionOptions.map((opt) => (
                    <option key={opt.regionId} value={opt.regionId}>
                      {opt.regionName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Divisions</label>
                <select
                  value={formData.divisionId || ""}
                  disabled={!formData.regionId}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      divisionId: e.target.value,
                      depotId: "",
                    }))
                  }
                >
                  <option value="">Select Division</option>
                  {divisionOptions
                    .filter((d) => !formData.regionId || String(d.regionId) === formData.regionId)
                    .map((opt) => (
                      <option key={opt.divisionId} value={opt.divisionId}>
                        {opt.divisionName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depot</label>
                <select
                  value={formData.depotId || ""}
                  disabled={!formData.divisionId}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, depotId: e.target.value }))
                  }
                >
                  <option value="">Select Depot</option>
                  {depotOptions
                    .filter((d) => !formData.divisionId || String(d.divisionId) === formData.divisionId)
                    .map((opt) => (
                      <option key={opt.depotId} value={opt.depotId}>
                        {opt.depotName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Work Bays</label>
                <input
                  type="number"
                  value={formData.workBays ?? 0}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      workBays: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Active Repair Jobs</label>
                <input
                  type="number"
                  value={formData.activeRepairJobs ?? 0}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      activeRepairJobs: Number(e.target.value),
                    }))
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
            title="Delete — Workshop"
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
              This will permanently remove {toDelete.workShopName} from the
              list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Workshops;
