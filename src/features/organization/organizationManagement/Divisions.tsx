import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import {
  Card,
  RouteChip,
  TableToolbar,
  Th,
  Td,
  Modal,
  Table,
  StatusBadge,
} from "../../../components/common";

export interface Division {
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  depots: number;
  workshops: number;
  stations: number;
  parkingYards: number;
  isActive: boolean;
}

export interface DivisionPayload {
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  regionId: string;
  isActive: boolean;
}
export interface DivisionPageProps {
  data?: Division[];
  regionOptions?: {
    regionId: string;
    regionCode: string;
    regionName?: string;
  }[];
  onAdd?: (item: DivisionPayload) => void;
  onUpdate?: (item: DivisionPayload) => void;
  onDelete?: (divisionId: string) => void;
}

const initialDefaultDivisions: Division[] = [
  {
    divisionId: "DIV-ID-1001",
    divisionCode: "DIV-0001",
    depots: 2,
    workshops: 1,
    stations: 3,
    parkingYards: 1,
    divisionName: "Pune Division",
    regionId: "0001",
    regionCode: "REG-0001",
    regionName: "Pune Region",
    isActive: true,
  },
  {
    divisionId: "DIV-ID-1002",
    divisionCode: "DIV-0002",
    depots: 1,
    workshops: 1,
    stations: 2,
    parkingYards: 1,
    divisionName: "Solapur Division",
    regionId: "0001",
    regionCode: "REG-0001",
    regionName: "Pune Region",
    isActive: true,
  },
  {
    divisionId: "DIV-ID-1003",
    divisionCode: "DIV-0003",
    depots: 1,
    workshops: 1,
    stations: 2,
    parkingYards: 1,
    divisionName: "Mumbai Division",
    regionId: "0002",
    regionCode: "REG-0002",
    regionName: "Mumbai Region",
    isActive: true,
  },
];

export function Divisions({
  data: propData,
  regionOptions = [],
  onAdd,
  onUpdate,
  onDelete,
}: DivisionPageProps) {
  const [internalData, setInternalData] = useState<Division[]>(
    initialDefaultDivisions,
  );
  const data = propData || internalData;

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: DivisionPayload;
  } | null>(null);
  const [toDelete, setToDelete] = useState<DivisionPayload | null>(null);
  const [formData, setFormData] = useState<Partial<DivisionPayload>>({});
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = data.filter((division) => {
    const query = search.toLowerCase();
    return (
      (!query ||
        [
          division.divisionCode,
          division.divisionName,
          division.regionName,
        ].some((value) => String(value).toLowerCase().includes(query))) &&
      (!regionFilter || division.regionId === regionFilter) &&
      (!statusFilter ||
        (statusFilter === "Active" ? division.isActive : !division.isActive))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      divisionId: "",
      divisionCode: "",
      divisionName: "",
      regionId: regionOptions[0]?.regionId || "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: DivisionPayload) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.divisionName) return;
    const newRecord: DivisionPayload = {
      divisionId:
        modal?.mode === "edit" && modal.record ? modal.record.divisionId : "",
      divisionCode:
        modal?.mode === "edit" && modal.record ? modal.record.divisionCode : "",
      divisionName: formData.divisionName.trim(),
      regionId: formData.regionId || regionOptions[0]?.regionId || "",
      isActive: formData.isActive ?? true,
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
        setInternalData((prev) => prev.map((item) => item));
      }
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) {
      onDelete(toDelete.divisionId);
    } else {
      setInternalData((prev) =>
        prev.filter((item) => item.divisionId !== toDelete.divisionId),
      );
    }
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Divisions"
        action={
          <button
            onClick={handleOpenAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: T.amberDeep,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={13} /> Add division
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search divisions..."
          filters={[
            {
              key: "region",
              label: "All regions",
              value: regionFilter,
              onChange: setRegionFilter,
              options: regionOptions.map((region) => ({
                value: region.regionId,
                label: region.regionName || region.regionCode,
              })),
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          ]}
        />
        <Table>
          <thead>
            <tr>
              <Th>Division Code</Th>
              <Th>Division Name</Th>
              <Th>Region</Th>
              <Th>Depots</Th>
              <Th>Workshops</Th>
              <Th>Stations</Th>
              <Th>Parking Yards</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d: Division) => (
              <tr key={d.divisionId} className="stc-row">
                <Td mono>{d.divisionCode}</Td>
                <Td>{d.divisionName}</Td>
                <Td mono>
                  <RouteChip> {d.regionName} </RouteChip>
                </Td>
                <Td mono>{d.depots}</Td>
                <Td mono>{d.workshops}</Td>
                <Td mono>{d.stations}</Td>
                <Td mono>{d.parkingYards}</Td>
                <Td>
                  <StatusBadge status={d.isActive ? "Active" : "Inactive"} />
                </Td>
                <Td align="right">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => handleOpenEdit(d)}
                      title="Edit"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                      }}
                    >
                      <Pencil size={14} color={T.textSoft} />
                    </button>
                    <button
                      onClick={() => setToDelete(d)}
                      title="Delete"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                      }}
                    >
                      <Trash2 size={14} color={T.red} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <Td colSpan={9}>
                  {data.length === 0
                    ? "No records yet — use Add division to create one."
                    : "No divisions match the selected filters."}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Divisions`}
            subtitle={
              modal.mode === "add"
                ? "Create a new division"
                : "Update division details"
            }
            onClose={() => setModal(null)}
            width={520}
            footer={
              <>
                <button
                  className="stc-btn stc-btn-ghost"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="stc-btn stc-btn-primary"
                  onClick={handleSave}
                >
                  Save changes
                </button>
              </>
            }
          >
            <div className="stc-form-grid">
              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Division Code</label>
                  <input value={formData.divisionCode || ""} readOnly />
                </div>
              )}

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Division Name</label>
                <input
                  value={formData.divisionName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, divisionName: e.target.value }))
                  }
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Region</label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, regionId: e.target.value }))
                  }
                >
                  {regionOptions.length > 0 &&
                    regionOptions.map((opt) => (
                      <option key={opt.regionId} value={opt.regionId}>
                        {opt.regionName}
                      </option>
                    ))}
                </select>
              </div>

              {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.isActive ? "Active" : "Inactive"}
                    onChange={(e) =>
                      setFormData((s) => ({
                        ...s,
                        isActive: e.target.value === "Active",
                      }))
                    }
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
          <Modal
            title="Delete — Divisions"
            subtitle="This action cannot be undone"
            icon={<Trash2 size={20} color={T.red} />}
            iconVariant="danger"
            onClose={() => setToDelete(null)}
            width={420}
            footer={
              <>
                <button
                  className="stc-btn stc-btn-ghost"
                  onClick={() => setToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="stc-btn stc-btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </>
            }
          >
            <p
              style={{
                fontSize: 14,
                color: T.textSoft,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              This will permanently remove {toDelete.divisionName} from the
              list. This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Divisions;
