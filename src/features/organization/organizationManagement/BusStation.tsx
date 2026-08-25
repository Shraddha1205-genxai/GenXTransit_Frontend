import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import {
  Card,
  RouteChip,
  StatusBadge,
  TableToolbar,
  Th,
  Td,
  Modal,
  Table,
} from "../../../components/common";

export interface BusStation {
  stationId: string;
  stationCode: string;
  stationName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  depotId: string;
  depotCode: string;
  depotName: string;
  platforms: number;
  dailyFootfall: number;
  isActive: boolean;
}
export interface BusStationPayload {
  stationId: string;
  stationCode: string;
  stationName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  platforms: number;
  isActive: boolean;
}
export interface BusStationPageProps {
  data?: BusStation[];
  regionOptions?: {
    regionId: string;
    regionCode: string;
    regionName: string;
  }[];
  divisionOptions?: {
    divisionId: string;
    divisionCode: string;
    divisionName: string;
  }[];
  depotOptions?: { depotId: string; depotCode: string; depotName: string }[];
  onAdd?: (item: BusStationPayload) => void;
  onUpdate?: (item: BusStationPayload) => void;
  onDelete?: (stationId: string) => void;
}

const initialDefaultBusStations: BusStation[] = [
  {
    stationId: "001",
    stationCode: "STN-0001",
    stationName: "Swargate Bus Station",
    regionId: "0001",
    regionName: "Mumbai",
    regionCode: "REG-0001",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0001",
    depotName: "Mumbai Depot",
    depotCode: "MSRTC-PUN-01",
    platforms: 14,
    dailyFootfall: 38000,
    isActive: true,
  },
  {
    stationId: "002",
    stationCode: "STN-0002",
    stationName: "Mumbai Central Bus Terminus",
    regionId: "0002",
    regionName: "Pune",
    regionCode: "REG-0002",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0003",
    depotName: "Pune Depot",
    depotCode: "MSRTC-MUM-03",
    platforms: 10,
    dailyFootfall: 22500,
    isActive: true,
  },
  {
    stationId: "003",
    stationCode: "STN-0003",
    stationName: "Colaba Bus Depot Stand",
    regionId: "0002",
    regionName: "Pune",
    regionCode: "REG-0002",
    divisionId: "0001",
    divisionCode: "DIV-0001",
    divisionName: "Mumbai Division",
    depotId: "0003",
    depotName: "Pune Depot",
    depotCode: "BEST-MUM-07",
    platforms: 6,
    dailyFootfall: 9200,
    isActive: true,
  },
];

export function BusStation({
  data: propData,
  regionOptions = [],
  divisionOptions = [],
  depotOptions = [],
  onAdd,
  onUpdate,
  onDelete,
}: BusStationPageProps) {
  const [internalData, setInternalData] = useState<BusStation[]>(
    initialDefaultBusStations,
  );
  const data = propData || internalData;

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: BusStation;
  } | null>(null);
  const [toDelete, setToDelete] = useState<BusStation | null>(null);
  const [formData, setFormData] = useState<Partial<BusStation>>({});
  const [search, setSearch] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = data.filter((station) => {
    const query = search.toLowerCase();
    return (
      (!query ||
        [
          station.stationCode,
          station.stationName,
          station.regionCode,
          station.divisionCode,
          station.depotCode,
        ].some((value) => String(value).toLowerCase().includes(query))) &&
      (!stationFilter || station.stationName === stationFilter) &&
      (!statusFilter ||
        (statusFilter === "Active" ? station.isActive : !station.isActive))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      stationCode: "",
      stationName: "",
      regionId: regionOptions[0].regionId || "",
      divisionId: divisionOptions[0].divisionId || "",
      depotId: depotOptions[0].depotId || "",
      platforms: 0,
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: BusStation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.stationName) return;
    const newRecord: BusStationPayload = {
      stationId:
        modal?.mode === "edit" && modal.record ? modal.record.stationId : "",
      stationCode:
        modal?.mode === "edit" && modal.record ? modal.record.stationCode : "",
      stationName: formData.stationName.trim(),
      regionId: formData.regionId || regionOptions[0].regionId || "",
      divisionId: formData.divisionId || divisionOptions[0].divisionId || "",
      depotId: formData.depotId || depotOptions[0].depotId || "",
      platforms: Number(formData.platforms) || 0,
      // dailyFootfall: Number(formData.dailyFootfall) || 0,
      isActive: modal?.mode === "edit" ? (formData.isActive ?? true) : true,
    };

    if (modal?.mode === "add") {
      if (onAdd) onAdd(newRecord);
      else setInternalData((prev) => [...prev]);
    } else if (modal?.mode === "edit" && modal.record) {
      if (onUpdate) onUpdate(newRecord);
      else setInternalData((prev) => prev.map((item) => item));
    }
    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    if (onDelete) onDelete(toDelete.stationId);
    else
      setInternalData((prev) =>
        prev.filter((item) => item.stationId !== toDelete.stationId),
      );
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Bus Stations"
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
            <Plus size={13} /> Add bus station
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search bus stations..."
          filters={[
            {
              key: "station",
              label: "All station names",
              value: stationFilter,
              onChange: setStationFilter,
              options: Array.from(
                new Set(data.map((station) => station.stationName)),
              )
                .sort()
                .map((name) => ({ value: name, label: name })),
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
              <Th>Station Code</Th>
              <Th>Station Name</Th>
              <Th>Region Code</Th>
              <Th>Division Code</Th>
              <Th>Depot Code</Th>
              <Th>Platforms</Th>
              <Th>Daily Footfall</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((b: BusStation) => (
              <tr key={b.stationId} className="stc-row">
                <Td mono>
                  <RouteChip>{b.stationCode}</RouteChip>
                </Td>
                <Td>{b.stationName}</Td>
                <Td mono>{b.regionCode}</Td>
                <Td mono>{b.divisionCode}</Td>
                <Td mono>{b.depotCode}</Td>
                <Td>{b.platforms}</Td>
                <Td>{b.dailyFootfall}</Td>
                <Td>
                  <StatusBadge status={b.isActive ? "Active" : "Inactive"} />
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
                      onClick={() => handleOpenEdit(b)}
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
                      onClick={() => setToDelete(b)}
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
                    ? "No records yet — use Add bus station to create one."
                    : "No bus stations match the selected filters."}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Bus Station`}
            subtitle={
              modal.mode === "add"
                ? "Add a new bus station"
                : "Update station details"
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
                  <label className="stc-field-label">Station Code</label>
                  <input value={formData.stationCode || ""} readOnly />
                </div>
              )}
              <div className="stc-field">
                <label className="stc-field-label">Station Name</label>
                <input
                  value={formData.stationName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, stationName: e.target.value }))
                  }
                />
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Region</label>
                <select
                  value={formData.regionId || "MSRTC"}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, regionId: e.target.value }))
                  }
                >
                  {regionOptions.map((c) => (
                    <option key={c.regionId} value={c.regionId}>
                      {c.regionName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Divisions</label>
                <select
                  value={formData.divisionId || "MSRTC"}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, divisionId: e.target.value }))
                  }
                >
                  {divisionOptions.map((c) => (
                    <option key={c.divisionId} value={c.divisionId}>
                      {c.divisionName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Depot</label>
                <select
                  value={formData.depotId || "MSRTC"}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, depotId: e.target.value }))
                  }
                >
                  {depotOptions.map((c) => (
                    <option key={c.depotId} value={c.depotId}>
                      {c.depotName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stc-field">
                <label className="stc-field-label">Platforms</label>
                <input
                  type="number"
                  value={formData.platforms ?? 0}
                  onChange={(e) =>
                    setFormData((s) => ({
                      ...s,
                      platforms: Number(e.target.value),
                    }))
                  }
                />
              </div>
              {/* <div className="stc-field">
                <label className="stc-field-label">Daily Footfall</label>
                <input
                  type="number"
                  value={formData.dailyFootfall ?? 0}
                  onChange={(e) => setFormData((s) => ({ ...s, dailyFootfall: Number(e.target.value) }))}
                />
              </div> */}
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
            title="Delete — Bus Station"
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
              This will permanently remove {toDelete.stationName} from the list.
              This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default BusStation;
