import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, Th, Td, Modal, Table } from "../../../components/common";

export interface Stop {
  code: string;
  name: string;
  route: string;
  seq: number;
}

export interface StopProps {
  data?: Stop[];
  routeOptions?: string[];
  onAdd?: (item: Stop) => void;
  onUpdate?: (code: string, item: Stop) => void;
  onDelete?: (code: string) => void;
}

const initialDefaultStops: Stop[] = [
  { code: "STP-0142", name: "Lonavala Ghat", route: "MSRTC-9502", seq: 4 },
  { code: "STP-0143", name: "Panvel Junction", route: "MSRTC-8801", seq: 6 },
  { code: "STP-0144", name: "Prabhadevi", route: "BEST-AC-84", seq: 9 },
  { code: "STP-0145", name: "Wakad Chowk", route: "PMPML-56", seq: 3 },
];

export function Stop({ data: propData, routeOptions = [], onAdd, onUpdate, onDelete }: StopProps) {
  const [internalData, setInternalData] = useState<Stop[]>(initialDefaultStops);
  const data = propData || internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Stop } | null>(null);
  const [toDelete, setToDelete] = useState<Stop | null>(null);
  const [formData, setFormData] = useState<Partial<Stop>>({});

  const handleOpenAdd = () => {
    setFormData({ code: "", name: "", route: routeOptions[0] || "", seq: 0 });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Stop) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) return;

    const newRecord: Stop = {
      code: formData.code,
      name: formData.name,
      route: formData.route || routeOptions[0] || "",
      seq: Number(formData.seq) || 0,
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.code, newRecord);
      } else {
        setInternalData((prev) => prev.map((item: Stop) => (item.code === modal.record!.code ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.code);
    } else {
      setInternalData((prev) => prev.filter((item: Stop) => item.code !== toDelete.code));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Stops"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add stop
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Stop code</Th>
              <Th>Name</Th>
              <Th>Route</Th>
              <Th align="right">Sequence</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Stop) => (
              <tr key={item.code} className="stc-row">
                <Td mono><RouteChip>{item.code}</RouteChip></Td>
                <Td>{item.name}</Td>
                <Td mono>{item.route}</Td>
                <Td align="right">{item.seq}</Td>
                <Td align="right">
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <Td colSpan={5}>No records yet — use Add stop to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Stops`}
            subtitle={modal.mode === "add" ? "Add a new stop" : "Update stop details"}
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
                <label className="stc-field-label">Stop code</label>
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
                <label className="stc-field-label">Route</label>
                <select
                  value={formData.route || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, route: e.target.value }))}
                >
                  {routeOptions.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Sequence</label>
                <input
                  type="number"
                  value={formData.seq ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, seq: Number(e.target.value) }))}
                />
              </div>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Stops" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
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

export default Stop;
