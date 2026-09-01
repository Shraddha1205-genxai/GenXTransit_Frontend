import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  Th,
  Td,
  Modal,
  Table,
  TableToolbar,
  StatusBadge,
} from "../../../components/common";
import { ticketTypeService } from "../../../api/organization/master/ticketTypeService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface TicketType {
  ticketId: string;
  ticketCode: string;
  ticketName: string;
  description: string;
  isActive: boolean;
}

export function TicketTypes() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("Active");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: TicketType } | null>(null);
  const [toDelete, setToDelete] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState<Partial<TicketType>>({});

  const isActiveParam = statusFilter === "Both" ? undefined : statusFilter === "Active";

  const { data: ticketTypes = [], isLoading, error } = useQuery({
    queryKey: ["ticketTypes", debouncedSearch, statusFilter],
    queryFn: () =>
      ticketTypeService.getAll(
        debouncedSearch || undefined,
        isActiveParam,
        1,
        100
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: ticketTypeService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes"] });
      toast.success(res.message || "Ticket type added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add ticket type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ticketTypeService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes"] });
      toast.success(res.message || "Ticket type updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update ticket type");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ticketTypeService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes"] });
      toast.success(res.message || "Ticket type deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete ticket type");
    },
  });

  const handleOpenAdd = () => {
    setFormData({
      ticketCode: "",
      ticketName: "",
      description: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: TicketType) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.ticketName) return;

    const payload = {
      ticketName: formData.ticketName || "",
      description: formData.description || "",
    };

    if (modal?.mode === "add") {
      addMutation.mutate(payload);
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        ...payload,
        ticketId: formData.ticketId || "",
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.ticketId) return;
    deleteMutation.mutate({ ticketId: toDelete.ticketId });
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
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search ticket types..."
          filters={[
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
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading ticket types...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading ticket types: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {ticketTypes.map((item: TicketType) => (
                  <tr key={item.ticketId} className="stc-row">
                    <Td mono>{item.ticketCode}</Td>
                    <Td>{item.ticketName}</Td>
                    <Td>{item.description}</Td>
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
                {ticketTypes.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 4 : 5}>No records yet — use Add type to create one.</Td>
                  </tr>
                )}
              </>
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
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Code</label>
                  <input
                    disabled
                    value={formData.ticketCode || ""}
                  />
                </div>
              )}
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
