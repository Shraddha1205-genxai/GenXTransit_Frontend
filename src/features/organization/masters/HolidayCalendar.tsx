import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface HolidayItem {
  holidayId: string;
  holidayCode: string;
  holidayName: string;
  occasion: string;
  date: string;
  description: string;
  type: string;
  isActive: boolean;
}

export interface HolidayCalendarProps {
  data?: HolidayItem[];
  onAdd?: (item: HolidayItem) => void;
  onUpdate?: (item: HolidayItem) => void;
  onDelete?: (holidayId: string) => void;
}

const initialDefaultHolidays: HolidayItem[] = [
  { holidayId: "001", holidayCode: "h-001", holidayName: "Republic Day", occasion: "Republic Day", date: "2026-01-26", description: "Republic Day", type: "National", isActive: true },
  { holidayId: "002", holidayCode: "h-002", holidayName: "Independence Day", occasion: "Independence Day", date: "2026-08-15", description: "Independence Day", type: "National", isActive: true },
  { holidayId: "003", holidayCode: "h-003", holidayName: "Gandhi Jayanti", occasion: "Gandhi Jayanti", date: "2026-10-02", description: "Gandhi Jayanti", type: "National", isActive: true },
];

const typeOptions = ["National", "Regional"];

export function HolidayCalendar({ data: propData, onAdd, onUpdate, onDelete }: HolidayCalendarProps) {
  const [internalData, setInternalData] = useState<HolidayItem[]>(initialDefaultHolidays);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: HolidayItem } | null>(null);
  const [toDelete, setToDelete] = useState<HolidayItem | null>(null);
  const [formData, setFormData] = useState<Partial<HolidayItem>>({});

  const handleOpenAdd = () => {
    setFormData({ holidayId: "", holidayCode: "", holidayName: "", occasion: "", date: "", description: "", type: typeOptions[0] });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: HolidayItem) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.date || !formData.description) return;

    const newRecord: HolidayItem = {
      holidayId: modal?.mode === "edit" && modal.record ? modal.record.holidayId : "",
      holidayCode: modal?.mode === "edit" && modal.record ? modal.record.holidayCode : "",
      holidayName: modal?.mode === "edit" && modal.record ? modal.record.holidayName : "",
      occasion: modal?.mode === "edit" && modal.record ? modal.record.occasion : "",
      date: formData.date,
      description: formData.description,
      type: formData.type || typeOptions[0],
      isActive: true,
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd({ holidayId: newRecord.holidayId, holidayCode: newRecord.holidayCode, holidayName: newRecord.holidayName, occasion: newRecord.occasion, date: newRecord.date, description: newRecord.description, type: newRecord.type, isActive: newRecord.isActive });
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(newRecord);
      } else {
        setInternalData((prev) => prev.map((item: HolidayItem) => (item.holidayId === modal.record!.holidayId ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.holidayId);
    } else {
      setInternalData((prev) => prev.filter((item: HolidayItem) => item.holidayId !== toDelete.holidayId));
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
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Date</Th>
              <Th>Occasion</Th>
              <Th>Type</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: HolidayItem) => (
              <tr key={item.holidayId} className="stc-row">
                <Td>{item.holidayCode}</Td>
                <Td>{item.holidayName}</Td>
                <Td mono>{item.date}</Td>
                <Td>{item.occasion}</Td>
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
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Holiday Calendar`}
            subtitle={modal.mode === "add" ? "Add a new holiday" : "Update holiday"}
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
              {modal.mode == "edit" && (<div className="stc-field">
                <label className="stc-field-label">Code</label>
                <input
                  value={formData.holidayCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, holidayCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Holiday Name</label>
                <input
                  value={formData.holidayName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, holidayName: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Occasion</label>
                <input
                  value={formData.occasion || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, occasion: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Date</label>
                <input
                  value={formData.date || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, date: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Type</label>
                <select
                  value={formData.type || typeOptions[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
                >
                  {typeOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.isActive ? "Active" : "Inactive"}
                    onChange={(e) => setFormData((s) => ({ ...s, isActive: e.target.value === "Active" }))}
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
          <Modal title="Delete — Holiday Calendar" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.description} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default HolidayCalendar;
