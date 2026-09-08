import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import { Card, RouteChip, TableToolbar, Th, Td, Modal, Table } from "../../../components/common";
import { parkingYardService } from "../../../api/organization/organizationManagement/parkingYardService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { divisionService } from "../../../api/organization/organizationManagement/divisionService";
import { depotService } from "../../../api/organization/organizationManagement/depotService";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePermissions } from "../../../hooks/usePermissions";

export interface ParkingYard {
  yardId: string;
  yardCode: string;
  yardName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  capacity: number;
  occupied: number;
  isActive: boolean;
}
export interface ParkingYardPayload {
  yardId: string;
  yardCode: string;
  yardName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  capacity: number;
  occupied: number;
  isActive: boolean;
}
export interface ParkingYardPageProps {}

const initialDefaultParkingYards: ParkingYard[] = [
  { yardId: "01", yardCode: "PY-PUN-01", yardName: "Swargate Overnight Yard",regionId: "001", regionCode: "REG-PUN", regionName: "Pune", divisionId: "001", divisionCode: "DIV-PUN", divisionName: "Pune Division", depotId: "MSRTC-PUN-01", depotCode: "DEP-PUN-01", depotName: "MSRTC-PUN-01", capacity: 110, occupied: 88, isActive: true },
  { yardId: "02", yardCode: "PY-MUM-04", yardName: "Wadala Parking Yard",regionId: "002", regionCode: "REG-MUM", regionName: "Mumbai", divisionId: "002", divisionCode: "DIV-MUM", divisionName: "Mumbai Division", depotId: "BEST-MUM-04", depotCode: "DEP-MUM-04", depotName: "BEST-MUM-04", capacity: 85, occupied: 74, isActive: true },
  { yardId: "03", yardCode: "PY-MUM-07", yardName: "Colaba Parking Yard",regionId: "002", regionCode: "REG-MUM", regionName: "Mumbai", divisionId: "002", divisionCode: "DIV-MUM", divisionName: "Mumbai Division", depotId: "BEST-MUM-07", depotCode: "DEP-MUM-07", depotName: "BEST-MUM-07", capacity: 52, occupied: 40, isActive: true },
];

export function ParkingYards({}: ParkingYardPageProps) {
  const queryClient = useQueryClient();
  const { canAdd, canEdit, canDelete } = usePermissions("ParkingYards");

  // Search & Filter States
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterDepot, setFilterDepot] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active");

  const isActiveParam = filterStatus === "" ? undefined : filterStatus === "Active";

  // Main Query
  const { data: parkingYards = [], isLoading, error } = useQuery({
    queryKey: ["parkingYards", debouncedSearch, filterRegion, filterDivision, filterDepot, filterStatus],
    queryFn: () =>
      parkingYardService.getAll(
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
    mutationFn: parkingYardService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["parkingYards"] });
      toast.success(res.message || "Parking yard created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create parking yard");
    },
  });

  const updateMutation = useMutation({
    mutationFn: parkingYardService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["parkingYards"] });
      toast.success(res.message || "Parking yard updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update parking yard");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: parkingYardService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["parkingYards"] });
      toast.success(res.message || "Parking yard deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete parking yard");
    },
  });

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: ParkingYard } | null>(null);
  const [toDelete, setToDelete] = useState<ParkingYard | null>(null);
  const [formData, setFormData] = useState<Partial<ParkingYard>>({});

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData({
      yardCode: "",
      yardName: "",
      regionId: "",
      divisionId: "",
      depotId: "",
      capacity: "" as any,
      occupied: 0,
      isActive: true,
    });
    setFormErrors({});
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: ParkingYard) => {
    setFormData(record);
    setFormErrors({});
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!formData.yardName || !formData.yardName.trim()) {
      errors.yardName = "Parking Yard Name is required.";
    }
    if (!formData.regionId) {
      errors.regionId = "Please select a Region.";
    }
    if (!formData.divisionId) {
      errors.divisionId = "Please select a Division.";
    }
    if (!formData.depotId) {
      errors.depotId = "Please select a Depot.";
    }

    const cap = Number(formData.capacity);
    if (
      formData.capacity === undefined ||
      formData.capacity === null ||
      formData.capacity === ("" as any) ||
      isNaN(cap) ||
      cap <= 0
    ) {
      errors.capacity = "Capacity is required and must be greater than 0.";
    }

    const occ = Number(formData.occupied ?? 0);
    if (isNaN(occ) || occ < 0) {
      errors.occupied = "Occupied count cannot be negative.";
    } else if (!isNaN(cap) && cap > 0 && occ >= cap) {
      errors.occupied = "Occupied count must be less than Capacity.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill required fields correctly.");
      return;
    }
    setFormErrors({});

    if (modal?.mode === "add") {
      addMutation.mutate({
        yardName: formData.yardName!.trim(),
        regionId: formData.regionId!,
        divisionId: formData.divisionId!,
        depotId: formData.depotId!,
        capacity: Number(formData.capacity) || 0,
        occupied: Number(formData.occupied) || 0,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        yardId: modal.record.yardId,
        yardName: formData.yardName!.trim(),
        regionId: formData.regionId!,
        divisionId: formData.divisionId!,
        depotId: formData.depotId!,
        capacity: Number(formData.capacity) || 0,
        occupied: Number(formData.occupied) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.yardId) return;
    deleteMutation.mutate({ yardId: toDelete.yardId });
    setToDelete(null);
  };



  return (
    <div>
      <Card
        title="Parking Yards"
        action={
          canAdd ? (
            <button
              onClick={handleOpenAdd}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
            >
              <Plus size={13} /> Add parking yard
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search parking yards..."
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
              <Th>Yard code</Th>
              <Th>Yard Name</Th>
              <Th>Region</Th>
              <Th>Division</Th>
              <Th>Depot</Th>
              <Th>Capacity</Th>
              <Th>Occupied</Th>
              {filterStatus !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={filterStatus !== "Inactive" ? 8 : 7}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading parking yards...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={filterStatus !== "Inactive" ? 8 : 7}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading parking yards: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {parkingYards.map((p: ParkingYard) => (
                  <tr key={p.yardId} className="stc-row">
                    <Td mono><RouteChip>{p.yardCode}</RouteChip></Td>
                    <Td>{p.yardName}</Td>
                    <Td mono>{p.regionCode}</Td>
                    <Td mono>{p.divisionCode}</Td>
                    <Td mono>{p.depotCode}</Td>
                    <Td>{p.capacity}</Td>
                    <Td>{p.occupied} ({p.capacity ? Math.round((p.occupied / p.capacity) * 100) : 0}%)</Td>
                    {filterStatus !== "Inactive" && (
                      <Td align="right">
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          {canEdit && (
                            <button onClick={() => handleOpenEdit(p)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                              <Pencil size={14} color={T.textSoft} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setToDelete(p)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                              <Trash2 size={14} color={T.red} />
                            </button>
                          )}
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
                {parkingYards.length === 0 && (
                  <tr>
                    <Td colSpan={filterStatus !== "Inactive" ? 8 : 7}>
                      No parking yards match the selected filters.
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Parking Yard`}
            subtitle={modal.mode === "add" ? "Add a new parking yard" : "Update yard details"}
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
                  <label className="stc-field-label">Yard code</label>
                  <input
                    disabled={modal.mode === "edit"}
                    value={formData.yardCode || ""}
                    onChange={(e) => setFormData((s) => ({ ...s, yardCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">
                  Yard Name <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  value={formData.yardName || ""}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, yardName: e.target.value }));
                    if (formErrors.yardName) setFormErrors((prev) => ({ ...prev, yardName: "" }));
                  }}
                  style={{ borderColor: formErrors.yardName ? T.red : undefined }}
                />
                {formErrors.yardName && (
                  <span style={{ color: T.red, fontSize: 12, marginTop: 4, display: "block" }}>
                    {formErrors.yardName}
                  </span>
                )}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Region <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) => {
                    setFormData((s) => ({
                      ...s,
                      regionId: e.target.value,
                      divisionId: "",
                      depotId: "",
                    }));
                    if (formErrors.regionId) setFormErrors((prev) => ({ ...prev, regionId: "" }));
                  }}
                  style={{ borderColor: formErrors.regionId ? T.red : undefined }}
                >
                  <option value="">Select Region</option>
                  {regionOptions.map((opt) => (
                    <option key={opt.regionId} value={opt.regionId}>
                      {opt.regionName}
                    </option>
                  ))}
                </select>
                {formErrors.regionId && (
                  <span style={{ color: T.red, fontSize: 12, marginTop: 4, display: "block" }}>
                    {formErrors.regionId}
                  </span>
                )}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Divisions <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  value={formData.divisionId || ""}
                  disabled={!formData.regionId}
                  onChange={(e) => {
                    setFormData((s) => ({
                      ...s,
                      divisionId: e.target.value,
                      depotId: "",
                    }));
                    if (formErrors.divisionId) setFormErrors((prev) => ({ ...prev, divisionId: "" }));
                  }}
                  style={{ borderColor: formErrors.divisionId ? T.red : undefined }}
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
                {formErrors.divisionId && (
                  <span style={{ color: T.red, fontSize: 12, marginTop: 4, display: "block" }}>
                    {formErrors.divisionId}
                  </span>
                )}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Depot <span style={{ color: T.red }}>*</span>
                </label>
                <select
                  value={formData.depotId || ""}
                  disabled={!formData.divisionId}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, depotId: e.target.value }));
                    if (formErrors.depotId) setFormErrors((prev) => ({ ...prev, depotId: "" }));
                  }}
                  style={{ borderColor: formErrors.depotId ? T.red : undefined }}
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
                {formErrors.depotId && (
                  <span style={{ color: T.red, fontSize: 12, marginTop: 4, display: "block" }}>
                    {formErrors.depotId}
                  </span>
                )}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">
                  Capacity <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter yard capacity"
                  value={formData.capacity ?? ""}
                  onChange={(e) => {
                    setFormData((s) => ({
                      ...s,
                      capacity: e.target.value === "" ? ("" as any) : Number(e.target.value),
                    }));
                    if (formErrors.capacity) setFormErrors((prev) => ({ ...prev, capacity: "" }));
                    if (formErrors.occupied) setFormErrors((prev) => ({ ...prev, occupied: "" }));
                  }}
                  style={{ borderColor: formErrors.capacity ? T.red : undefined }}
                />
                {formErrors.capacity && (
                  <span style={{ color: T.red, fontSize: 12, marginTop: 4, display: "block" }}>
                    {formErrors.capacity}
                  </span>
                )}
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Occupied</label>
                <input
                  type="number"
                  placeholder="Enter occupied count"
                  value={formData.occupied ?? 0}
                  onChange={(e) => {
                    setFormData((s) => ({
                      ...s,
                      occupied: e.target.value === "" ? 0 : Number(e.target.value),
                    }));
                    if (formErrors.occupied) setFormErrors((prev) => ({ ...prev, occupied: "" }));
                  }}
                  style={{ borderColor: formErrors.occupied ? T.red : undefined }}
                />
                {formErrors.occupied && (
                  <span style={{ color: T.red, fontSize: 12, marginTop: 4, display: "block" }}>
                    {formErrors.occupied}
                  </span>
                )}
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
          <Modal title="Delete — Parking Yard" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.yardName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default ParkingYards;
