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
import { stationService } from "../../../api/organization/organizationManagement/stationService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { divisionService } from "../../../api/organization/organizationManagement/divisionService";
import { depotService } from "../../../api/organization/organizationManagement/depotService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface BusStation {
  stationId: string;
  stationCode: string;
  stationName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  platforms: number;
  dailyFootfall: number;
  isActive: boolean;
}
export interface BusStationPayload {
  stationId: string;
  stationCode: string;
  stationName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  platforms: number;
  isActive: boolean;
}
export interface BusStationPageProps {}

const initialDefaultBusStations: BusStation[] = [
  {
    stationId: "001",
    stationCode: "STN-0001",
    stationName: "Swargate Bus Station",
    regionId: "0001",
    regionName: "Mumbai",
    regionCode: "REG-0001",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0001",
    depotName: "Mumbai Depot",
    depotCode: "MSRTC-PUN-01",
    platforms: 14,
    dailyFootfall: 38000,
    isActive: true,
  },
  {
    stationId: "002",
    stationCode: "STN-0002",
    stationName: "Mumbai Central Bus Terminus",
    regionId: "0002",
    regionName: "Pune",
    regionCode: "REG-0002",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0003",
    depotName: "Pune Depot",
    depotCode: "MSRTC-MUM-03",
    platforms: 10,
    dailyFootfall: 22500,
    isActive: true,
  },
  {
    stationId: "003",
    stationCode: "STN-0003",
    stationName: "Colaba Bus Depot Stand",
    regionId: "0002",
    regionName: "Pune",
    regionCode: "REG-0002",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0003",
    depotName: "Pune Depot",
    depotCode: "BEST-MUM-07",
    platforms: 6,
    dailyFootfall: 9200,
    isActive: true,
  },
];

export function BusStation({}: BusStationPageProps) {
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
  const { data: stations = [], isLoading, error } = useQuery({
    queryKey: ["stations", debouncedSearch, filterRegion, filterDivision, filterDepot, filterStatus],
    queryFn: () =>
      stationService.getAll(
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
    mutationFn: stationService.insert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Bus station created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create bus station");
    },
  });

  const updateMutation = useMutation({
    mutationFn: stationService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Bus station updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update bus station");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Bus station deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete bus station");
    },
  });

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: BusStation } | null>(null);
  const [toDelete, setToDelete] = useState<BusStation | null>(null);
  const [formData, setFormData] = useState<Partial<BusStation>>({});

  const handleOpenAdd = () => {
    setFormData({
      stationCode: "",
      stationName: "",
      regionId: "",
      divisionId: "",
      depotId: "",
      platforms: 0,
      dailyFootfall: 0,
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: BusStation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.stationName || !formData.regionId || !formData.divisionId || !formData.depotId) return;

    if (modal?.mode === "add") {
      addMutation.mutate({
        stationName: formData.stationName.trim(),
        regionId: formData.regionId,
        divisionId: formData.divisionId,
        depotId: formData.depotId,
        platforms: Number(formData.platforms) || 0,
        dailyFootfall: Number(formData.dailyFootfall) || 0,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        stationId: modal.record.stationId,
        stationName: formData.stationName.trim(),
        regionId: formData.regionId,
        divisionId: formData.divisionId,
        depotId: formData.depotId,
        platforms: Number(formData.platforms) || 0,
        dailyFootfall: Number(formData.dailyFootfall) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.stationId) return;
    deleteMutation.mutate({ stationId: toDelete.stationId });
    setToDelete(null);
  };



  return (
    <div>
      <Card
        title="Bus Stations"
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
              <Plus size={13} /> Add bus station
            </button>
          )
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search bus stations..."
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
              <Th>Station Code</Th>
              <Th>Station Name</Th>
              <Th>Region Code</Th>
              <Th>Division Code</Th>
              <Th>Depot Code</Th>
              <Th>Platforms</Th>
              <Th>Daily Footfall</Th>
              <Th>Status</Th>
              {filterStatus !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={filterStatus !== "Inactive" ? 9 : 8}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading bus stations...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={filterStatus !== "Inactive" ? 9 : 8}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading bus stations: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {stations.map((b: BusStation) => (
                  <tr key={b.stationId} className="stc-row">
                    <Td mono>
                      <RouteChip>{b.stationCode}</RouteChip>
                    </Td>
                    <Td>{b.stationName}</Td>
                    <Td mono>{b.regionCode}</Td>
                    <Td mono>{b.divisionCode}</Td>
                    <Td mono>{b.depotCode}</Td>
                    <Td>{b.platforms}</Td>
                    <Td>{b.dailyFootfall}</Td>
                    <Td>
                      <StatusBadge status={b.isActive ? "Active" : "Inactive"} />
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
                            onClick={() => handleOpenEdit(b)}
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
                            onClick={() => setToDelete(b)}
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
                {stations.length === 0 && (
                  <tr>
                    <Td colSpan={filterStatus !== "Inactive" ? 9 : 8}>
                      No bus stations match the selected filters.
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Bus Station`}
            subtitle={
              modal.mode === "add"
                ? "Add a new bus station"
                : "Update station details"
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
                  <label className="stc-field-label">Station Code</label>
                  <input value={formData.stationCode || ""} readOnly />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Station Name</label>
                <input
                  value={formData.stationName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, stationName: e.target.value }))
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
                  {regionOptions.map((c) => (
                    <option key={c.regionId} value={c.regionId}>
                      {c.regionName}
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
                    .map((c) => (
                      <option key={c.divisionId} value={c.divisionId}>
                        {c.divisionName}
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
                    .map((c) => (
                      <option key={c.depotId} value={c.depotId}>
                        {c.depotName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Platforms</label>
                <input
                  type="number"
                  value={formData.platforms ?? 0}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      platforms: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Daily Footfall</label>
                <input
                  type="number"
                  value={formData.dailyFootfall ?? 0}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      dailyFootfall: Number(e.target.value),
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
            title="Delete — Bus Station"
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
              This will permanently remove {toDelete.stationName} from the list.
              This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default BusStation;
