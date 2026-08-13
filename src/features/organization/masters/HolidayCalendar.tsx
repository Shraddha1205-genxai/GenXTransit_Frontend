import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal } from "../../../components/common";

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
  type: string;
}

export interface HolidayCalendarProps {
  data?: HolidayItem[];
  onAdd?: (item: Omit<HolidayItem, "id">) => void;
  onUpdate?: (id: string, item: HolidayItem) => void;
  onDelete?: (id: string) => void;
}

const initialDefaultHolidays: HolidayItem[] = [
  { id: "HOL-001", date: "2026-01-26", name: "Republic Day", type: "National" },
  { id: "HOL-002", date: "2026-08-15", name: "Independence Day", type: "National" },
  { id: "HOL-003", date: "2026-10-02", name: "Gandhi Jayanti", type: "National" },
];

const typeOptions = ["National", "Regional"];

export function HolidayCalendar({ data: propData, onAdd, onUpdate, onDelete }: HolidayCalendarProps) {
  const [internalData, setInternalData] = useState<HolidayItem[]>(initialDefaultHolidays);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: HolidayItem } | null>(null);
  const [toDelete, setToDelete] = useState<HolidayItem | null>(null);
  const [formData, setFormData] = useState<Partial<HolidayItem>>({});

  const handleOpenAdd = () => {
    setFormData({ date: "", name: "", type: typeOptions[0] });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: HolidayItem) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.date || !formData.name) return;

    const newRecord: HolidayItem = {
      id: modal?.mode === "edit" && modal.record ? modal.record.id : `HOL-${Date.now()}`,
      date: formData.date,
      name: formData.name,
      type: formData.type || typeOptions[0],
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd({ date: newRecord.date, name: newRecord.name, type: newRecord.type });
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.id, newRecord);
      } else {
        setInternalData((prev) => prev.map((item: HolidayItem) => (item.id === modal.record!.id ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.id);
    } else {
      setInternalData((prev) => prev.filter((item: HolidayItem) => item.id !== toDelete.id));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Holiday calendar"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add holiday
          </button>
        }
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Occasion</Th>
              <Th>Type</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: HolidayItem) => (
              <tr key={item.id} className="stc-row">
                <Td mono>{item.date}</Td>
                <Td>{item.name}</Td>
                <Td>{item.type}</Td>
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
                <Td colSpan={4}>No records yet — use Add holiday to create one.</Td>
              </tr>
            )}
          </tbody>
        </table>

        {modal && (
          <Modal title={`${modal.mode === "add" ? "Add" : "Edit"} — Holiday Calendar`} onClose={() => setModal(null)}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Date</label>
              <input
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.date || ""}
                onChange={(e) => setFormData((s) => ({ ...s, date: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Occasion</label>
              <input
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                value={formData.name || ""}
                onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", marginBottom: 5 }}>Type</label>
              <select
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, boxSizing: "border-box", background: T.panel }}
                value={formData.type || typeOptions[0]}
                onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
              >
                {typeOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={() => setModal(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.ink, color: "#F4F0E4", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Save
              </button>
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Holiday Calendar" onClose={() => setToDelete(null)}>
            <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.5, margin: "0 0 18px" }}>
              This will permanently remove {toDelete.name} from the list. This can't be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setToDelete(null)} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default HolidayCalendar;
