import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface BusStation {
  code: string;
  name: string;
  depot: string;
  platforms: number;
  footfall: string;
}

export interface BusStationPageProps {
  data?: BusStation[];
  depotOptions?: string[];
  onAdd?: (item: BusStation) => void;
  onUpdate?: (code: string, item: BusStation) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultBusStations: BusStation[] = [
  { code: "BS-PUN-SWG", name: "Swargate Bus Station", depot: "MSRTC-PUN-01", platforms: 14, footfall: "38,000/day" },
  { code: "BS-MUM-CST", name: "Mumbai Central Bus Terminus", depot: "MSRTC-MUM-03", platforms: 10, footfall: "22,500/day" },
  { code: "BS-MUM-COL", name: "Colaba Bus Depot Stand", depot: "BEST-MUM-07", platforms: 6, footfall: "9,200/day" },
];

export function BusStation({ data: propData, depotOptions = [], onAdd, onUpdate, onDelete }: BusStationPageProps) {
  const [internalData, setInternalData] = useState<BusStation[]>(initialDefaultBusStations);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: BusStation } | null>(null);
  const [toDelete, setToDelete] = useState<BusStation | null>(null);
  const [formData, setFormData] = useState<Partial<BusStation>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", depot: depotOptions[0] || "", platforms: 0, footfall: "" });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: BusStation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    const newRecord: BusStation = {
      code: formData.code,
      name: formData.name,
      depot: formData.depot || depotOptions[0] || "",
      platforms: Number(formData.platforms) || 0,
      footfall: formData.footfall || "",
    };

    if (modal?.mode === "add") {
      if (onAdd) onAdd(newRecord);
      else setInternalData((prev) => [...prev, newRecord]);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) onUpdate(modal.record.code, newRecord);
      else setInternalData((prev) => prev.map((item) => (item.code === modal.record!.code ? newRecord : item)));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) onDelete(toDelete.code);
    else setInternalData((prev) => prev.filter((item) => item.code !== toDelete.code));
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Bus Stations"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add bus station
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Station code</Th>
              <Th>Name</Th>
              <Th>Homed depot</Th>
              <Th>Platforms</Th>
              <Th>Daily footfall</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((b: BusStation) => (
              <tr key={b.code} className="stc-row">
                <Td mono><RouteChip>{b.code}</RouteChip></Td>
                <Td>{b.name}</Td>
                <Td mono>{b.depot}</Td>
                <Td>{b.platforms}</Td>
                <Td>{b.footfall}</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(b)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(b)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><Td colSpan={6}>No records yet — use Add bus station to create one.</Td></tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Bus Station`}
            subtitle={modal.mode === "add" ? "Add a new bus station" : "Update station details"}
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
              <div className="stc-field">
                <label className="stc-field-label">Station code</label>
                <input
                  disabled={modal.mode === "edit"}
                  value={formData.code || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, code: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.name || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Homed depot</label>
                <select
                  value={formData.depot || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, depot: e.target.value }))}
                >
                  {depotOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Platforms</label>
                <input
                  type="number"
                  value={formData.platforms ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, platforms: Number(e.target.value) }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Daily footfall</label>
                <input
                  value={formData.footfall || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, footfall: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Bus Station" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.code} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default BusStation;
