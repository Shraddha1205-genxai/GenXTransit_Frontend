import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  StatusBadge,
  Th,
  Td,
  Modal,
  Table,
  TableToolbar,
} from "../../../components/common";
import { notificationTemplateService } from "../../../api/organization/master/notificationTemplateService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface NotificationTemplate {
  notificationId: string;
  notificationCode: string;
  notificationTitle: string;
  channel: string;
  description?: string;
  isActive: boolean;
}

const channels = ["Email", "SMS", "Push", "InApp"];

export function NotificationTemplates() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: NotificationTemplate } | null>(null);
  const [toDelete, setToDelete] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>({});

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: notificationTemplates = [], isLoading, error } = useQuery({
    queryKey: ["notificationTemplates", debouncedSearch, channelFilter, statusFilter],
    queryFn: () =>
      notificationTemplateService.getAll(
        debouncedSearch || undefined,
        channelFilter || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: notificationTemplateService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] });
      toast.success(res?.message || "Notification template added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add notification template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: notificationTemplateService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] });
      toast.success(res?.message || "Notification template updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update notification template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationTemplateService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] });
      toast.success(res?.message || "Notification template deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete notification template");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      notificationCode: "",
      notificationTitle: "",
      channel: channels[0],
      description: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: NotificationTemplate) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.notificationTitle) return;

    const payload = {
      notificationTitle: formData.notificationTitle || "",
      channel: formData.channel || channels[0],
      description: formData.description || "",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        notificationId: formData.notificationId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.notificationId) return;
    deleteMutation.mutate({ notificationId: toDelete.notificationId });
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
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search notification templates..."
          filters={[
            {
              key: "channel",
              label: "Channel",
              value: channelFilter,
              onChange: setChannelFilter,
              options: channels.map((c) => ({ value: c, label: c })),
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Both", label: "Both" },
              ],
            },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Title</Th>
              <Th>Channel</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading notification templates...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading notification templates: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {notificationTemplates.map((item: NotificationTemplate) => (
                  <tr key={item.notificationId} className="stc-row">
                    <Td mono>{item.notificationCode}</Td>
                    <Td>{item.notificationTitle}</Td>
                    <Td>{item.channel}</Td>
                    <Td>
                      <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                    </Td>
                    {statusFilter !== "Inactive" && (
                      <Td align="right">
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          <button disabled={statusFilter === "Both" && !item.isActive} onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: statusFilter === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: statusFilter === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Pencil size={14} color={T.textSoft} />
                          </button>
                          <button disabled={statusFilter === "Both" && !item.isActive} onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: statusFilter === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: statusFilter === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Trash2 size={14} color={T.red} />
                          </button>
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
                {notificationTemplates.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>No records yet — use Add template to create one.</Td>
                  </tr>
                )}
              </>
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
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Code</label>
                  <input
                    disabled
                    value={formData.notificationCode || ""}
                  />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Title</label>
                <input
                  value={formData.notificationTitle || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, notificationTitle: e.target.value }))}
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Channel</label>
                <select
                  value={formData.channel || channels[0]}
                  onChange={(e) => setFormData((s) => ({ ...s, channel: e.target.value }))}
                >
                   <option key="" value="">
                      Select Channel
                    </option>
                  {channels.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Description</label>
                <input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
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
