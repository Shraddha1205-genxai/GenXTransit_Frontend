import React, { useState } from "react";
import { Plus, Pencil, Trash2, Bus, TrendingUp, Milestone, IndianRupee } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, KpiCard, Th, Td, Modal, Table } from "../../../components/common";

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
  status: "Active" | "Inactive";
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
  status: "Active" | "Inactive";
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
  depotsData?: Depot[];
  vehiclesData?: Vehicle[];
  corporationOptions?: { corpId: string; corpCode: string; corporationName: string }[];
  regionOptions?: { regionId: string; regionCode: string; regionName: string }[];
  divisionOptions?: { divisionId: string; divisionCode: string; divisionName: string }[];
  zoneOptions?: { zoneId: string; zoneCode: string; zoneName: string }[];
  onAddDepot?: (item: DepotPayload) => void;
  onUpdateDepot?: (item: DepotPayload) => void;
  onDeleteDepot?: (depotId: string) => void;
}

const initialDefaultDepots: Depot[] = [
  { depotId: "001", depotCode: "MSRTC-PUN-01", depotName: "Pune (Swargate) ST Depot", corpId: "CORP-ID-1001", corpCode: "CORP-0001", corporationName: "Maharashtra State Road Transport Corporation", service: "ST", zoneName: "Pune Division", zoneId: "0001", zoneCode: "z-001",regionId: "01", regionCode: "r-01", regionName: "Pune Region", divisionId: "DIV-01", divisionCode: "DIV-01", divisionName: "Pune Division", fleet: 96, onRoad: 74, tripsToday: 268, revenueToday: 612400, status: "Active" },
  { depotId: "002", depotCode: "BEST-MUM-04", depotName: "BEST Wadala Depot", corpId: "CORP-ID-1002", corpCode: "CORP-0002", corporationName: "BEST", service: "Local", zoneName: "Mumbai (Island City)", zoneId: "0002", zoneCode: "z-002",regionId: "02", regionCode: "r-02", regionName: "Mumbai Region", divisionId: "DIV-02", divisionCode: "DIV-02", divisionName: "Mumbai Division", fleet: 72, onRoad: 58, tripsToday: 341, revenueToday: 398600, status: "Active" },
  { depotId: "003", depotCode: "PMPML-PUN-02", depotName: "PMPML Swargate Depot", corpId: "CORP-ID-1003", corpCode: "CORP-0003", corporationName: "PMPML", service: "Local", zoneName: "Pune Metropolitan Region", zoneId: "0003", zoneCode: "z-003",regionId: "03", regionCode: "r-03", regionName: "Pune Region", divisionId: "DIV-03", divisionCode: "DIV-03", divisionName: "Pune Division", fleet: 60, onRoad: 47, tripsToday: 219, revenueToday: 271500, status: "Active" },
  { depotId: "004", depotCode: "MSRTC-MUM-03", depotName: "Mumbai Central (MSRTC) Depot", corpId: "CORP-ID-1001", corpCode: "CORP-001", corporationName: "Maharashtra State Road Transport Corporation", service: "ST", zoneName: "Mumbai Division", zoneId: "0004", zoneCode: "z-004",regionId: "04", regionCode: "r-04", regionName: "Mumbai Region", divisionId: "DIV-04", divisionCode: "DIV-04", divisionName: "Mumbai Division", fleet: 54, onRoad: 41, tripsToday: 132, revenueToday: 349800, status: "Active" },
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
  depotsData: propDepots,
  vehiclesData = initialDefaultVehicles,
  corporationOptions=[],
  regionOptions=[],
  divisionOptions=[],
  zoneOptions=[],
  onAddDepot,
  onUpdateDepot,
  onDeleteDepot,
}: DepotPageProps) {
  const [internalDepots, setInternalDepots] = useState<Depot[]>(initialDefaultDepots);
  const depots = propDepots || internalDepots;

  const [selCode, setSelCode] = useState<string>(depots[0]?.depotCode || "");
  const selected = depots.find((d: Depot) => d.depotCode === selCode) || depots[0];

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
    if (!formData.depotName) return;
    const newRecord: DepotPayload = {
      depotId: modal?.mode === "edit" && modal.record ? modal.record.depotId : "",
      depotCode: modal?.mode === "edit" && formData.depotCode ? formData.depotCode : "",
      depotName: formData.depotName,
      corpId: formData.corpId || "MSRTC",
      service: formData.service || "ST",
      zoneId: formData.zoneId || "",
      regionId: formData.regionId || "",
      divisionId: formData.divisionId || "",
      status: formData.status || "Active",
    };

    if (modal?.mode === "add") {
      if (onAddDepot) onAddDepot(newRecord);
      else setInternalDepots((prev) => [...prev]);
      setSelCode(newRecord.depotCode);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdateDepot) onUpdateDepot(newRecord);
      else setInternalDepots((prev) => prev.map((d) => (d)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDeleteDepot) onDeleteDepot(toDelete.depotId);
    else setInternalDepots((prev) => prev.filter((d) => d.depotId !== toDelete.depotId));
    if (selected?.depotId === toDelete.depotId) {
      const remaining = depots.filter((d) => d.depotId !== toDelete.depotId);
      if (remaining.length > 0) setSelCode(remaining[0].depotId);
    }
    setToDelete(null);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12 }}>
        <Card
          title="Depots"
          action={
            <button onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}>
              <Plus size={13} /> Add depot
            </button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(d); }} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                    <Pencil size={13} color={T.textSoft} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setToDelete(d); }} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                    <Trash2 size={13} color={T.red} />
                  </button>
                </div>
              </div>
            ))}
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
              <select value={formData.corpId || "MSRTC"} onChange={(e) => setFormData((s) => ({ ...s, corpId: e.target.value }))}>
                {corporationOptions.map((c) => <option key={c.corpId} value={c.corpId}>{c.corporationName}</option>)}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Service</label>
              <select value={formData.service || "ST"} onChange={(e) => setFormData((s) => ({ ...s, service: e.target.value }))}>
                {["ST", "Local"].map((svc) => <option key={svc} value={svc}>{svc}</option>)}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Zone</label>
              <select value={formData.zoneId || "MSRTC"} onChange={(e) => setFormData((s) => ({ ...s, zoneId: e.target.value }))}>
                {zoneOptions.map((c) => <option key={c.zoneId} value={c.zoneId}>{c.zoneName}</option>)}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Region</label>
              <select value={formData.regionId || "MSRTC"} onChange={(e) => setFormData((s) => ({ ...s, regionId: e.target.value }))}>
                {regionOptions.map((c) => <option key={c.regionId} value={c.regionId}>{c.regionName}</option>)}
              </select>
            </div>
            <div className="stc-field">
              <label className="stc-field-label">Divisions</label>
              <select value={formData.divisionId || "MSRTC"} onChange={(e) => setFormData((s) => ({ ...s, divisionId: e.target.value }))}>
                {divisionOptions.map((c) => <option key={c.divisionId} value={c.divisionId}>{c.divisionName}</option>)}
              </select>
            </div>
            {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.status || "Active"}
                    onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value as "Active" | "Inactive" }))}
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
