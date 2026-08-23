import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, StatusBadge, Th, Td, Modal, Table } from "../../../components/common";

export interface Corporation {
  id: string;
  corpCode: string;
  corporationName: string;
  stateName: string;
  districtName: string;
  cityName: string;
  status: "Active" | "Inactive";
}

export interface CorporationPageProps {
  data?: Corporation[];
  onAdd?: (item: Corporation) => void;
  onUpdate?: (id: string, item: Corporation) => void;
  onDelete?: (id: string) => void;
}

const initialDefaultCorporations: Corporation[] = [
  {
    id: "CORP-ID-1001",
    corpCode: "CORP-0001",
    corporationName: "Maharashtra State Road Transport Corporation",
    stateName: "Maharashtra",
    districtName: "Pune",
    cityName: "Pune",
    status: "Active",
  },
  {
    id: "CORP-ID-1002",
    corpCode: "CORP-0002",
    corporationName: "Brihanmumbai Electric Supply and Transport",
    stateName: "Maharashtra",
    districtName: "Mumbai",
    cityName: "Mumbai",
    status: "Active",
  },
  {
    id: "CORP-ID-1003",
    corpCode: "CORP-0003",
    corporationName: "Pune Mahanagar Parivahan Mahamandal Limited",
    stateName: "Maharashtra",
    districtName: "Pune",
    cityName: "Pune",
    status: "Active",
  },
];

const generateCorpCode = (existing: Corporation[]) => {
  const numbers = existing
    .map((item) => Number((item.corpCode.match(/(\d+)$/) ?? ["0", "0"])[1]))
    .filter((n) => Number.isFinite(n));
  const next = (Math.max(0, ...numbers) + 1).toString().padStart(4, "0");
  return `CORP-${next}`;
};

export function Corporations({ data: propData, onAdd, onUpdate, onDelete }: CorporationPageProps) {
  const [internalData, setInternalData] = useState<Corporation[]>(initialDefaultCorporations);
  const data = propData ?? internalData;

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Corporation } | null>(null);
  const [toDelete, setToDelete] = useState<Corporation | null>(null);
  const [formData, setFormData] = useState<Partial<Corporation>>({});

  const handleOpenAdd = () => {
    setFormData({
      id: `CORP-ID-${Date.now()}`,
      corpCode: generateCorpCode(data),
      corporationName: "",
      stateName: "",
      districtName: "",
      cityName: "",
      status: "Active",
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Corporation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.corporationName || !formData.stateName || !formData.districtName || !formData.cityName) return;

    const newRecord: Corporation = {
      id: modal?.mode === "edit" && modal.record ? modal.record.id : `CORP-ID-${Date.now()}`,
      corpCode: modal?.mode === "edit" && modal.record ? modal.record.corpCode : generateCorpCode(data),
      corporationName: formData.corporationName.trim(),
      stateName: formData.stateName.trim(),
      districtName: formData.districtName.trim(),
      cityName: formData.cityName.trim(),
      status: modal?.mode === "edit" ? (formData.status || "Active") : "Active",
    };

    if (modal?.mode === "add") {
      if (onAdd) {
        onAdd(newRecord);
      } else {
        setInternalData((prev) => [...prev, newRecord]);
      }
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) {
        onUpdate(modal.record.id, newRecord);
      } else {
        setInternalData((prev) => prev.map((item) => (item.id === modal.record!.id ? newRecord : item)));
      }
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.id);
    } else {
      setInternalData((prev) => prev.filter((item) => item.id !== toDelete.id));
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Corporations"
        action={
          <button
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.amberDeep, background: "none", border: "none", cursor: "pointer" }}
          >
            <Plus size={13} /> Add corporation
          </button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Corp Code</Th>
              <Th>Corporation Name</Th>
              <Th>State</Th>
              <Th>District</Th>
              <Th>City</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Corporation) => (
              <tr key={item.id} className="stc-row">
                <Td mono>{item.corpCode}</Td>
                <Td>{item.corporationName}</Td>
                <Td>{item.stateName}</Td>
                <Td>{item.districtName}</Td>
                <Td>{item.cityName}</Td>
                <Td><StatusBadge status={item.status} /></Td>
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
                <Td colSpan={8}>No records yet — use Add corporation to create one.</Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Corporation`}
            subtitle={modal.mode === "add" ? "Add a new corporation" : "Update corporation details"}
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
                  <label className="stc-field-label">Corp Code</label>
                  <input value={formData.corpCode || ""} readOnly />
                </div>
              )}

              {modal.mode === "add" && (
                <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 12, color: T.textSoft, padding: "8px 10px", borderRadius: 6, background: T.grayFill }}>
                    Auto-generated corp code: <strong>{formData.corpCode || "CORP-0001"}</strong>
                  </div>
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: modal.mode === "add" ? "1 / -1" : undefined }}>
                <label className="stc-field-label">Corporation Name</label>
                <input
                  value={formData.corporationName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, corporationName: e.target.value }))}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">State Name</label>
                <input
                  value={formData.stateName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, stateName: e.target.value }))}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">District Name</label>
                <input
                  value={formData.districtName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, districtName: e.target.value }))}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">City Name</label>
                <input
                  value={formData.cityName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, cityName: e.target.value }))}
                />
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
          <Modal title="Delete — Corporation" subtitle="This action cannot be undone" icon={<Trash2 size={20} color={T.red} />} iconVariant="danger" onClose={() => setToDelete(null)} width={420} footer={
            <>
              <button className="stc-btn stc-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="stc-btn stc-btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </>
          }>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
              This will permanently remove {toDelete.corporationName} from the list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Corporations;
