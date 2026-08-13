import React, { useState } from "react";
import { Plus, Pencil, Trash2, Bus, TrendingUp, Milestone, IndianRupee, X } from "lucide-react";

/* Design Tokens */
const T = {
  ink: "#101B26",
  panel: "#FFFFFF",
  canvas: "#EFEEE6",
  border: "#DEDBCF",
  text: "#16212B",
  textSoft: "#5B6672",
  textFaint: "#8B9098",
  amber: "#E5A339",
  amberDeep: "#8A5A14",
  amberFill: "#FBEBD1",
  green: "#2F8F5B",
  greenFill: "#E1F3E9",
  red: "#C6453B",
  redFill: "#FBE7E5",
  blue: "#3E7CB1",
  blueFill: "#E5EFF6",
  gray: "#8B9098",
  grayFill: "#EEEDE7",
};

export interface Depot {
  code: string;
  name: string;
  corp: string;
  service: string;
  zone: string;
  fleet: number;
  onRoad: number;
  tripsToday: number;
  revenueToday: number;
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
  onAddDepot?: (item: Depot) => void;
  onUpdateDepot?: (code: string, item: Depot) => void;
  onDeleteDepot?: (code: string) => void;
}

const initialDefaultDepots: Depot[] = [
  { code: "MSRTC-PUN-01", name: "Pune (Swargate) ST Depot", corp: "MSRTC", service: "ST", zone: "Pune Division", fleet: 96, onRoad: 74, tripsToday: 268, revenueToday: 612400 },
  { code: "BEST-MUM-04", name: "BEST Wadala Depot", corp: "BEST", service: "Local", zone: "Mumbai (Island City)", fleet: 72, onRoad: 58, tripsToday: 341, revenueToday: 398600 },
  { code: "PMPML-PUN-02", name: "PMPML Swargate Depot", corp: "PMPML", service: "Local", zone: "Pune Metropolitan Region", fleet: 60, onRoad: 47, tripsToday: 219, revenueToday: 271500 },
  { code: "MSRTC-MUM-03", name: "Mumbai Central (MSRTC) Depot", corp: "MSRTC", service: "ST", zone: "Mumbai Division", fleet: 54, onRoad: 41, tripsToday: 132, revenueToday: 349800 },
  { code: "BEST-MUM-07", name: "BEST Colaba Depot", corp: "BEST", service: "Local", zone: "Mumbai (Island City)", fleet: 45, onRoad: 36, tripsToday: 208, revenueToday: 226100 },
];

const initialDefaultVehicles: Vehicle[] = [
  { reg: "MH-12-AB-4421", category: "AC Shivneri", depot: "MSRTC-PUN-01", status: "Active", nextService: "12 Aug 2026", docExpiry: "Fitness · 18 Aug 2026" },
  { reg: "MH-12-CD-1187", category: "Express (ST)", depot: "MSRTC-PUN-01", status: "Active", nextService: "22 Aug 2026", docExpiry: "Insurance · 02 Sep 2026" },
  { reg: "MH-01-EF-7702", category: "AC Local (BEST)", depot: "BEST-MUM-04", status: "Under maintenance", nextService: "In progress", docExpiry: "PUC · 09 Aug 2026" },
  { reg: "MH-14-GH-2290", category: "Ordinary Local (PMPML)", depot: "PMPML-PUN-02", status: "Breakdown", nextService: "Awaiting spare", docExpiry: "Permit · 30 Nov 2026" },
  { reg: "MH-02-JK-5561", category: "AC Shivneri", depot: "MSRTC-MUM-03", status: "Active", nextService: "05 Sep 2026", docExpiry: "Fitness · 14 Aug 2026" },
  { reg: "MH-01-LM-9034", category: "Double-decker (BEST)", depot: "BEST-MUM-07", status: "Active", nextService: "19 Aug 2026", docExpiry: "Road tax · 01 Oct 2026" },
];

/* Helper components */
function RouteChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="stc-mono" style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", background: T.amberFill, color: T.amberDeep, fontSize: 12, fontWeight: 600, borderRadius: 3, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    "Active": [T.greenFill, T.green],
    "Under maintenance": [T.amberFill, T.amberDeep],
    "Breakdown": [T.redFill, T.red],
  };
  const [bg, fg] = map[status] || [T.grayFill, T.gray];
  return <span style={{ background: bg, color: fg, fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 3, whiteSpace: "nowrap" }}>{status}</span>;
}

function KpiCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string | number; sub?: string; icon: React.ElementType; tone?: "amber" | "red" | "green" }) {
  const toneColor = tone === "amber" ? T.amberDeep : tone === "red" ? T.red : tone === "green" ? T.green : T.text;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 500 }}>{label}</span>
        <Icon size={16} color={T.textFaint} />
      </div>
      <span className="stc-display" style={{ fontSize: 28, fontWeight: 600, color: toneColor }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: T.textSoft }}>{sub}</span>}
    </div>
  );
}

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
          <h3 className="stc-display" style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
          {action}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return <th style={{ textAlign: align || "left", fontSize: 11, fontWeight: 600, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.04em", padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>{children}</th>;
}

function Td({ children, align, mono }: { children: React.ReactNode; align?: "left" | "right" | "center"; mono?: boolean }) {
  return <td className={mono ? "stc-mono" : ""} style={{ textAlign: align || "left", fontSize: 13, color: T.text, padding: "10px", borderBottom: `1px solid ${T.border}` }}>{children}</td>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(16,27,38,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, borderRadius: 8, width: 460, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(16,27,38,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.panel }}>
          <h3 className="stc-display" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={17} color={T.textSoft} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

export function DepotPage({
  depotsData: propDepots,
  vehiclesData = initialDefaultVehicles,
  onAddDepot,
  onUpdateDepot,
  onDeleteDepot,
}: DepotPageProps) {
  const [internalDepots, setInternalDepots] = useState<Depot[]>(initialDefaultDepots);
  const depots = propDepots || internalDepots;

  const [selCode, setSelCode] = useState<string>(depots[0]?.code || "");
  const selected = depots.find((d) => d.code === selCode) || depots[0];

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Depot } | null>(null);
  const [toDelete, setToDelete] = useState<Depot | null>(null);
  const [formData, setFormData] = useState<Partial<Depot>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", corp: "MSRTC", service: "ST", zone: "", fleet: 0, onRoad: 0, tripsToday: 0, revenueToday: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Depot) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: Depot = {
      code: formData.code,
      name: formData.name,
      corp: formData.corp || "MSRTC",
      service: formData.service || "ST",
      zone: formData.zone || "",
      fleet: Number(formData.fleet) || 0,
      onRoad: Number(formData.onRoad) || 0,
      tripsToday: Number(formData.tripsToday) || 0,
      revenueToday: Number(formData.revenueToday) || 0,
    };

    if (modal?.mode === "add") {
      if (onAddDepot) onAddDepot(newRecord);
      else setInternalDepots((prev) => [...prev, newRecord]);
      setSelCode(newRecord.code);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdateDepot) onUpdateDepot(modal.record.code, newRecord);
      else setInternalDepots((prev) => prev.map((d) => (d.code === modal.record!.code ? newRecord : d)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDeleteDepot) onDeleteDepot(toDelete.code);
    else setInternalDepots((prev) => prev.filter((d) => d.code !== toDelete.code));
    if (selected?.code === toDelete.code) {
      const remaining = depots.filter((d) => d.code !== toDelete.code);
      if (remaining.length > 0) setSelCode(remaining[0].code);
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
            {depots.map((d) => (
              <div
                key={d.code}
                onClick={() => setSelCode(d.code)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                  padding: "10px 12px", borderRadius: 4, cursor: "pointer",
                  background: selected?.code === d.code ? T.amberFill : "transparent",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{d.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: d.service === "ST" ? T.blueFill : T.greenFill, color: d.service === "ST" ? T.blue : T.green }}>
                      {d.corp} · {d.service}
                    </span>
                  </div>
                  <div className="stc-mono" style={{ fontSize: 11, color: T.textSoft, marginTop: 2 }}>{d.code} · {d.zone}</div>
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
              <Card title={`Fleet at ${selected.code} · managed from Fleet`}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr><Th>Registration</Th><Th>Category</Th><Th>Status</Th><Th>Next service / doc</Th></tr>
                  </thead>
                  <tbody>
                    {vehiclesData.filter((v) => v.depot === selected.code).map((v) => (
                      <tr key={v.reg} className="stc-row">
                        <Td mono><RouteChip>{v.reg}</RouteChip></Td>
                        <Td>{v.category}</Td>
                        <Td><StatusBadge status={v.status} /></Td>
                        <Td>{v.nextService === "In progress" || v.nextService === "Awaiting spare" ? v.nextService : v.docExpiry}</Td>
                      </tr>
                    ))}
                    {vehiclesData.filter((v) => v.depot === selected.code).length === 0 && (
                      <tr><Td colSpan={4}>No vehicles homed at this depot.</Td></tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Depot`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Depot code</label>
            <input disabled={modal.mode === "edit"} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.code || ""} onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Name</label>
            <input style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.name || ""} onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Corporation</label>
            <select style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box", background: T.panel }} value={formData.corp || "MSRTC"} onChange={(e) => setFormData((s) => ({ ...s, corp: e.target.value }))}>
              {["MSRTC", "BEST", "PMPML"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Service</label>
            <select style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box", background: T.panel }} value={formData.service || "ST"} onChange={(e) => setFormData((s) => ({ ...s, service: e.target.value }))}>
              {["ST", "Local"].map((svc) => <option key={svc} value={svc}>{svc}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Zone</label>
            <input style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.zone || ""} onChange={(e) => setFormData((s) => ({ ...s, zone: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Fleet strength</label>
            <input type="number" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.fleet ?? 0} onChange={(e) => setFormData((s) => ({ ...s, fleet: Number(e.target.value) }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>On road</label>
            <input type="number" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.onRoad ?? 0} onChange={(e) => setFormData((s) => ({ ...s, onRoad: Number(e.target.value) }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Trips today</label>
            <input type="number" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.tripsToday ?? 0} onChange={(e) => setFormData((s) => ({ ...s, tripsToday: Number(e.target.value) }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Revenue today (₹)</label>
            <input type="number" style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }} value={formData.revenueToday ?? 0} onChange={(e) => setFormData((s) => ({ ...s, revenueToday: Number(e.target.value) }))} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={() => setModal(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.ink, color: "#F4F0E4", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete — Depot" onClose={() => setToDelete(null)}>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.5, margin: "0 0 18px" }}>
            This will permanently remove {toDelete.code} from the list. This can't be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setToDelete(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleConfirmDelete} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DepotPage;
