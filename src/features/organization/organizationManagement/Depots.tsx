import React, { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Bus, TrendingUp, Milestone, IndianRupee } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, KpiCard, Th, Td, Modal, Table, TableToolbar } from "../../../components/common";
import { depotService } from "../../../api/organization/organizationManagement/depotService";
import { corporationService } from "../../../api/organization/organizationManagement/corporationService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { divisionService } from "../../../api/organization/organizationManagement/divisionService";
import { zoneService } from "../../../api/organization/organizationManagement/zoneService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Depot {
  depotId: string;
  depotCode: string;
  depotName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  corpId: string;
  corpCode: string;
  corporationName: string;
  isActive: boolean;
  service: string;
  fleet: number;
  onRoad: number;
  tripsToday: number;
  revenueToday: number;
}

export interface DepotPayload {
  depotId: string;
  depotCode: string;
  depotName: string;
  regionId: string;
  divisionId: string;
  zoneId: string;
  corpId: string;
  isActive: boolean;
  service: string;
}

export interface Vehicle {
  reg: string;
  category: string;
  depot: string;
  status: string;
  nextService: string;
  docExpiry: string;
}

export interface DepotPageProps {
  vehiclesData?: Vehicle[];
}

const initialDefaultDepots: Depot[] = [
  { depotId: "001", depotCode: "MSRTC-PUN-01", depotName: "Pune (Swargate) ST Depot", corpId: "CORP-ID-1001", corpCode: "CORP-0001", corporationName: "Maharashtra State Road Transport Corporation", service: "ST", zoneName: "Pune Division", zoneId: "0001", zoneCode: "z-001",regionId: "01", regionCode: "r-01", regionName: "Pune Region", divisionId: "DIV-01", divisionCode: "DIV-01", divisionName: "Pune Division", fleet: 96, onRoad: 74, tripsToday: 268, revenueToday: 612400, isActive: true },
  { depotId: "002", depotCode: "BEST-MUM-04", depotName: "BEST Wadala Depot", corpId: "CORP-ID-1002", corpCode: "CORP-0002", corporationName: "BEST", service: "Local", zoneName: "Mumbai (Island City)", zoneId: "0002", zoneCode: "z-002",regionId: "02", regionCode: "r-02", regionName: "Mumbai Region", divisionId: "DIV-02", divisionCode: "DIV-02", divisionName: "Mumbai Division", fleet: 72, onRoad: 58, tripsToday: 341, revenueToday: 398600, isActive: true },
  { depotId: "003", depotCode: "PMPML-PUN-02", depotName: "PMPML Swargate Depot", corpId: "CORP-ID-1003", corpCode: "CORP-0003", corporationName: "PMPML", service: "Local", zoneName: "Pune Metropolitan Region", zoneId: "0003", zoneCode: "z-003",regionId: "03", regionCode: "r-03", regionName: "Pune Region", divisionId: "DIV-03", divisionCode: "DIV-03", divisionName: "Pune Division", fleet: 60, onRoad: 47, tripsToday: 219, revenueToday: 271500, isActive: true },
  { depotId: "004", depotCode: "MSRTC-MUM-03", depotName: "Mumbai Central (MSRTC) Depot", corpId: "CORP-ID-1001", corpCode: "CORP-001", corporationName: "Maharashtra State Road Transport Corporation", service: "ST", zoneName: "Mumbai Division", zoneId: "0004", zoneCode: "z-004",regionId: "04", regionCode: "r-04", regionName: "Mumbai Region", divisionId: "DIV-04", divisionCode: "DIV-04", divisionName: "Mumbai Division", fleet: 54, onRoad: 41, tripsToday: 132, revenueToday: 349800, isActive: true },
];

const initialDefaultVehicles: Vehicle[] = [
  { reg: "MH-12-AB-4421", category: "AC Shivneri", depot: "MSRTC-PUN-01", status: "Active", nextService: "12 Aug 2026", docExpiry: "Fitness · 18 Aug 2026" },
  { reg: "MH-12-CD-1187", category: "Express (ST)", depot: "MSRTC-PUN-01", status: "Active", nextService: "22 Aug 2026", docExpiry: "Insurance · 02 Sep 2026" },
  { reg: "MH-01-EF-7702", category: "AC Local (BEST)", depot: "BEST-MUM-04", status: "Under maintenance", nextService: "In progress", docExpiry: "PUC · 09 Aug 2026" },
  { reg: "MH-14-GH-2290", category: "Ordinary Local (PMPML)", depot: "PMPML-PUN-02", status: "Breakdown", nextService: "Awaiting spare", docExpiry: "Permit · 30 Nov 2026" },
  { reg: "MH-02-JK-5561", category: "AC Shivneri", depot: "MSRTC-MUM-03", status: "Active", nextService: "05 Sep 2026", docExpiry: "Fitness · 14 Aug 2026" },
  { reg: "MH-01-LM-9034", category: "Double-decker (BEST)", depot: "BEST-MUM-07", status: "Active", nextService: "19 Aug 2026", docExpiry: "Road tax · 01 Oct 2026" },
];

export function Depots({
  vehiclesData = initialDefaultVehicles,
}: DepotPageProps) {
  const queryClient = useQueryClient();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterCorp, setFilterCorp] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active");

  // Selection state
  const [selCode, setSelCode] = useState<string>("");

  const isActiveParam = filterStatus === "" ? undefined : filterStatus === "Active";

  // Main Query
  const { data: rawDepotsData = [], isLoading, error } = useQuery({
    queryKey: ["depots", debouncedSearch, filterCorp, filterRegion, filterDivision, filterZone, filterStatus],
    queryFn: () =>
      depotService.getAll(
        debouncedSearch || undefined,
        filterCorp || undefined,
        filterRegion || undefined,
        filterDivision || undefined,
        filterZone || undefined,
        isActiveParam
      ),
    staleTime: 0,
  });

  const depots = useMemo(() => {
    return rawDepotsData.map((d) => ({
      ...d,
      fleet: d.fleet ?? 45,
      onRoad: d.onRoad ?? 38,
      tripsToday: d.tripsToday ?? 120,
      revenueToday: d.revenueToday ?? 245000,
    }));
  }, [rawDepotsData]);

  // Dropdown option queries
  const { data: corporationOptions = [] } = useQuery({
    queryKey: ["corporations", true],
    queryFn: () => corporationService.getAll(undefined, undefined, undefined, undefined, true),
    staleTime: Infinity,
  });

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

  const { data: zoneOptions = [] } = useQuery({
    queryKey: ["zones", true],
    queryFn: () => zoneService.getAll(undefined, undefined, true),
    staleTime: Infinity,
  });

  const selected = useMemo(() => {
    return depots.find((d) => d.depotCode === selCode || d.depotId === selCode) || depots[0];
  }, [depots, selCode]);

  // Set default selection when depots load
  useEffect(() => {
    if (depots.length > 0 && !selCode) {
      setSelCode(depots[0].depotCode);
    }
  }, [depots, selCode]);

  // Mutations
  const addMutation = useMutation({
    mutationFn: depotService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["depots"] });
      toast.success(res.message || "Depot created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create depot");
    },
  });

  const updateMutation = useMutation({
    mutationFn: depotService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["depots"] });
      toast.success(res.message || "Depot updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update depot");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: depotService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["depots"] });
      toast.success(res.message || "Depot deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete depot");
    },
  });

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: DepotPayload } | null>(null);
  const [toDelete, setToDelete] = useState<Depot | null>(null);
  const [formData, setFormData] = useState<Partial<Depot>>({});

  const handleOpenAdd = () => {
    setFormData({ depotCode: "", depotName: "", corpId: "", service: "ST", zoneId: "", regionId: "", divisionId: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: DepotPayload) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.depotName || !formData.corpId || !formData.regionId || !formData.divisionId || !formData.zoneId) return;

    if (modal?.mode === "add") {
      addMutation.mutate({
        depotName: formData.depotName.trim(),
        corpId: formData.corpId,
        service: formData.service || "ST",
        regionId: formData.regionId,
        divisionId: formData.divisionId,
        zoneId: formData.zoneId,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        depotId: modal.record.depotId,
        depotName: formData.depotName.trim(),
        corpId: formData.corpId,
        service: formData.service || "ST",
        regionId: formData.regionId,
        divisionId: formData.divisionId,
        zoneId: formData.zoneId,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.depotId) return;
    deleteMutation.mutate({ depotId: toDelete.depotId });
    setToDelete(null);
  };



  return (
    <div>
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search depots..."
        style={{ gridTemplateColumns: "minmax(200px, 1.5fr) repeat(5, minmax(130px, 1fr))" }}
        filters={[
          {
            key: "corporation",
            label: "All Corporations",
            value: filterCorp,
            onChange: (val) => {
              setFilterCorp(val);
              setFilterRegion("");
              setFilterDivision("");
              setFilterZone("");
            },
            options: corporationOptions.map((c) => ({ value: String(c.corpId), label: c.corporationName })),
          },
          {
            key: "region",
            label: "All Regions",
            value: filterRegion,
            onChange: (val) => {
              setFilterRegion(val);
              setFilterDivision("");
              setFilterZone("");
            },
            options: regionOptions.map((r) => ({ value: String(r.regionId), label: r.regionName })),
            disabled: !filterCorp,
          },
          {
            key: "division",
            label: "All Divisions",
            value: filterDivision,
            onChange: (val) => {
              setFilterDivision(val);
              setFilterZone("");
            },
            options: divisionOptions
              .filter((d) => !filterRegion || String(d.regionId) === filterRegion)
              .map((d) => ({ value: String(d.divisionId), label: d.divisionName })),
            disabled: !filterRegion,
          },
          {
            key: "zone",
            label: "All Zones",
            value: filterZone,
            onChange: setFilterZone,
            options: zoneOptions
              .filter((z) => !filterRegion || String(z.regionId) === filterRegion)
              .map((z) => ({ value: String(z.zoneId), label: z.zoneName })),
            disabled: !filterRegion,
          },
          {
            key: "status",
            label: "All Status",
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ],
          },
        ]}
      />
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12 }}>
        <Card
          title="Depots"
          action={
            filterStatus !== "Inactive" && (
              <button onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}>
                <Plus size={13} /> Add depot
              </button>
            )
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {isLoading ? (
              <div style={{ padding: "10px 12px", fontSize: 13, color: T.textSoft, textAlign: "center" }}>
                Loading depots...
              </div>
            ) : error ? (
              <div style={{ padding: "10px 12px", fontSize: 13, color: T.red, textAlign: "center" }}>
                Error loading depots: {(error as Error).message}
              </div>
            ) : (
              <>
                {depots.map((d: Depot) => (
                  <div
                    key={d.depotCode}
                    onClick={() => setSelCode(d.depotCode)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                      padding: "10px 12px", borderRadius: 4, cursor: "pointer",
                      background: selected?.depotCode === d.depotCode ? T.amberFill : "transparent",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{d.depotName}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: d.service === "ST" ? T.blueFill : T.greenFill, color: d.service === "ST" ? T.blue : T.green }}>
                          {d.corporationName} · {d.service}
                        </span>
                      </div>
                      <div className="stc-mono" style={{ fontSize: 11, color: T.textSoft, marginTop: 2 }}>{d.depotCode} · {d.zoneCode}</div>
                    </div>
                    {filterStatus !== "Inactive" && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(d); }} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                          <Pencil size={13} color={T.textSoft} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setToDelete(d); }} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                          <Trash2 size={13} color={T.red} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {depots.length === 0 && (
                  <div style={{ padding: "10px 12px", fontSize: 13, color: T.textSoft, textAlign: "center" }}>
                    No depots match filter.
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {selected && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
                <KpiCard label="Fleet strength" value={selected.fleet} icon={Bus} />
                <KpiCard label="On road" value={selected.onRoad} sub={`${selected.fleet ? Math.round((selected.onRoad / selected.fleet) * 100) : 0}% utilisation`} icon={TrendingUp} tone="green" />
                <KpiCard label="Trips today" value={selected.tripsToday} icon={Milestone} />
                <KpiCard label="Revenue today" value={`₹${(selected.revenueToday / 1000).toFixed(1)}K`} icon={IndianRupee} tone="green" />
              </div>
              <Card title={`Fleet at ${selected.depotCode} · managed from Fleet`}>
                <Table>
                  <thead>
                    <tr><Th>Registration</Th><Th>Category</Th><Th>Status</Th><Th>Next service / doc</Th></tr>
                  </thead>
                  <tbody>
                    {vehiclesData.filter((v: Vehicle) => v.depot === selected.depotCode).map((v: Vehicle) => (
                      <tr key={v.reg} className="stc-row">
                        <Td mono><RouteChip>{v.reg}</RouteChip></Td>
                        <Td>{v.category}</Td>
                        <Td><StatusBadge status={v.status} /></Td>
                        <Td>{v.nextService === "In progress" || v.nextService === "Awaiting spare" ? v.nextService : v.docExpiry}</Td>
                      </tr>
                    ))}
                    {vehiclesData.filter((v: Vehicle) => v.depot === selected.depotCode).length === 0 && (
                      <tr><Td colSpan={4}>No vehicles homed at this depot.</Td></tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          title={`${modal.mode === "add" ? "Add" : "Edit"} — Depot`}
          subtitle={modal.mode === "add" ? "Create a new depot record" : "Update depot details"}
          onClose={() => setModal(null)}
          width={640}
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
                <label className="stc-field-label">Depot code</label>
                <input disabled={modal.mode === "edit"} value={formData.depotCode || ""} onChange={(e) => setFormData((s) => ({ ...s, depotCode: e.target.value }))} />
              </div>
            )}
            <div className="stc-field">
              <label className="stc-field-label">Name</label>
              <input value={formData.depotName || ""} onChange={(e) => setFormData((s) => ({ ...s, depotName: e.target.value }))} />
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Corporation</label>
              <select
                value={formData.corpId || ""}
                onChange={(e) =>
                  setFormData((s) => ({
                    ...s,
                    corpId: e.target.value,
                    regionId: "",
                    divisionId: "",
                    zoneId: "",
                  }))
                }
              >
                <option value="">Select Corporation</option>
                {corporationOptions.map((c) => (
                  <option key={String(c.corpId || "")} value={String(c.corpId || "")}>
                    {c.corporationName}
                  </option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Service</label>
              <select
                value={formData.service || ""}
                onChange={(e) => setFormData((s) => ({ ...s, service: e.target.value }))}
              >
                <option value="">Select Service</option>
                {["ST", "Local"].map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Region</label>
              <select
                value={formData.regionId || ""}
                disabled={!formData.corpId}
                onChange={(e) =>
                  setFormData((s) => ({
                    ...s,
                    regionId: e.target.value,
                    divisionId: "",
                    zoneId: "",
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
                    zoneId: "",
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
              <label className="stc-field-label">Zone</label>
              <select
                value={formData.zoneId || ""}
                disabled={!formData.regionId}
                onChange={(e) => setFormData((s) => ({ ...s, zoneId: e.target.value }))}
              >
                <option value="">Select Zone</option>
                {zoneOptions
                  .filter((z) => !formData.regionId || String(z.regionId) === formData.regionId)
                  .map((c) => (
                    <option key={c.zoneId} value={c.zoneId}>
                      {c.zoneName}
                    </option>
                  ))}
              </select>
            </div>
            {/* {modal.mode === "edit" && (
              <div className="stc-field">
                <label className="stc-field-label">Status</label>
                <select
                  value={formData.isActive !== undefined ? (formData.isActive ? "Active" : "Inactive") : "Active"}
                  onChange={(e) => setFormData((s) => ({ ...s, isActive: e.target.value === "Active" }))}
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
        <Modal title="Delete — Depot" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
          <>
            <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
          </>
        }>
          <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
            This will permanently remove {toDelete.depotCode} from the list. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Depots;
