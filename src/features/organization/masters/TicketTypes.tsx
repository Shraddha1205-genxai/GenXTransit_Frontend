import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface TicketType {
  ticketId: string;
  ticketCode: string;
  ticketName: string;
  description: string;
  isActive: boolean;
}

export interface TicketTypesProps {
  data?: TicketType[];
  onAdd?: (item: TicketType) => void;
  onUpdate?: (item: TicketType) => void;
  onDelete?: (ticketId: string) => void;
}

const initialDefaultTicketTypes: TicketType[] = [
  { ticketId: "TT-ADULT", ticketCode: "TT-ADULT", ticketName: "Adult", description: "Standard full fare", isActive: true },
  { ticketId: "TT-STUDENT", ticketCode: "TT-STUDENT", ticketName: "Student", description: "Concession ticket", isActive: true },
  { ticketId: "TT-SENIOR", ticketCode: "TT-SENIOR", ticketName: "Senior citizen", description: "Discounted fare", isActive: true },
];

export function TicketTypes({ data: propData, onAdd, onUpdate, onDelete }: TicketTypesProps) {
  const [internalData, setInternalData] = useState<TicketType[]>(initialDefaultTicketTypes);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: TicketType } | null>(null);
  const [toDelete, setToDelete] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState<Partial<TicketType>>({});

  const handleOpenAdd = () => {
    setFormData({ ticketId: "", ticketCode: "", ticketName: "", description: "", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: TicketType) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.ticketId || !formData.ticketName) return;

    const newRecord: TicketType = {
      ticketId: formData.ticketId || "",
      ticketCode: formData.ticketCode || "",
      ticketName: formData.ticketName || "",
      description: formData.description || "",
      isActive: formData.isActive || true,
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(newRecord);
      } else {
        setInternalData((prev) => prev.map((item: TicketType) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.ticketId);
    } else {
      setInternalData((prev) => prev.filter((item: TicketType) => item.ticketId !== toDelete.ticketId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Ticket types"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add type
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: TicketType) => (
              <tr key={item.ticketId} className="stc-row">
                <Td mono>{item.ticketCode}</Td>
                <Td>{item.ticketName}</Td>
                <Td>{item.description}</Td>
                <Td>{item.isActive ? "Active" : "Inactive"}</Td>
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
                <Td colSpan={4}>No records yet — use Add type to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Ticket Types`}
            subtitle={modal.mode === "add" ? "Add a new ticket type" : "Update ticket type"}
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
                  disabled={modal.mode === "edit"}
                  value={formData.ticketCode || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, ticketCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Name</label>
                <input
                  value={formData.ticketName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, ticketName: e.target.value }))}
                />
              </div>
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              {/* {modal.mode === "edit" && (
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
              )} */}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal title="Delete — Ticket Types" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.ticketCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default TicketTypes;
