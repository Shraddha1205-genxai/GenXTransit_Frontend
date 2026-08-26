import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Th, Td, Modal, Table } from "../../../components/common";

export interface NotificationTemplate {
  notificationId: string
  notificationCode: string;
  notificationTitle: string;
  channel: string;
  description?: string;
  isActive: boolean;
}

export interface NotificationTemplatesProps {
  data?: NotificationTemplate[];
  onAdd?: (item: NotificationTemplate) => void;
  onUpdate?: (item: NotificationTemplate) => void;
  onDelete?: (notificationId: string) => void;
}

const initialDefaultNotificationTemplates: NotificationTemplate[] = [
  { notificationId: "NT-DELAY", notificationCode: "NT-DELAY", notificationTitle: "Trip delay alert", channel: "SMS + Push", isActive: true },
  { notificationId: "NT-CONFIRM", notificationCode: "NT-CONFIRM", notificationTitle: "Booking confirmation", channel: "SMS + Email", isActive: true },
  { notificationId: "NT-REFUND", notificationCode: "NT-REFUND", notificationTitle: "Refund processed", channel: "Push", isActive: true },
];

export function NotificationTemplates({ data: propData, onAdd, onUpdate, onDelete }: NotificationTemplatesProps) {
  const [internalData, setInternalData] = useState<NotificationTemplate[]>(initialDefaultNotificationTemplates);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: NotificationTemplate } | null>(null);
  const [toDelete, setToDelete] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>({});

  const handleOpenAdd = () => {
    setFormData({ notificationId: "", notificationCode: "", notificationTitle: "", channel: "", description:"", isActive: true });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: NotificationTemplate) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.notificationCode || !formData.notificationTitle) return;

    const newRecord: NotificationTemplate = {
      notificationId: formData.notificationId || "",
      notificationCode: formData.notificationCode || "",
      notificationTitle: formData.notificationTitle || "",
      channel: formData.channel || "",
      description: formData.description || "",
      isActive: formData.isActive ?? false,
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
        setInternalData((prev) => prev.map((item: NotificationTemplate) => (item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.notificationId);
    } else {
      setInternalData((prev) => prev.filter((item: NotificationTemplate) => item.notificationId !== toDelete.notificationId));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Notification templates"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add template
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Title</Th>
              <Th>Channel</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: NotificationTemplate) => (
              <tr key={item.notificationId} className="stc-row">
                <Td mono>{item.notificationCode}</Td>
                <Td>{item.notificationTitle}</Td>
                <Td>{item.channel}</Td>
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
                <Td colSpan={5}>No records yet — use Add template to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Notification Templates`}
            subtitle={modal.mode === "add" ? "Add a new template" : "Update template"}
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
              {modal.mode == "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Code</label>
                  <input
                    disabled={modal.mode === "edit"}
                    value={formData.notificationCode || ""}
                    onChange={(e) => setFormData((s) => ({ ...s, notificationCode: e.target.value }))}
                />
              </div>)}
              <div className="stc-field">
                <label className="stc-field-label">Title</label>
                <input
                  value={formData.notificationTitle || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, notificationTitle: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Channel</label>
                <input
                  value={formData.channel || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, channel: e.target.value }))}
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
          <Modal title="Delete — Notification Templates" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.notificationCode} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default NotificationTemplates;
