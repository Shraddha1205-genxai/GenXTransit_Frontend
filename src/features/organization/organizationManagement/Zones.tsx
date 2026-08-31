import React, { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import {
  Card,
  TableToolbar,
  Th,
  Td,
  Modal,
  Table,
  StatusBadge,
} from "../../../components/common";
import { zoneService } from "../../../api/organization/organizationManagement/zoneService";
import { regionService } from "../../../api/organization/organizationManagement/regionService";
import { useDebounce } from "../../../hooks/useDebounce";

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface SearchableMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

function SearchableMultiSelect({
  value = [],
  onChange,
  options,
  placeholder = "Select options",
  disabled = false,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (opt: string) => {
    const nextValue = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt];
    onChange(nextValue);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <style>{`
        .stc-field .multi-select-checkbox {
          width: 16px !important;
          height: 16px !important;
          min-height: 16px !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          appearance: checkbox !important;
          -webkit-appearance: checkbox !important;
          display: inline-block !important;
          cursor: pointer !important;
          background: transparent !important;
          border: 1px solid var(--border) !important;
        }
        .stc-field .multi-select-checkbox:hover,
        .stc-field .multi-select-checkbox:focus {
          border-color: var(--amber) !important;
          box-shadow: none !important;
        }
      `}</style>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          minHeight: "48px",
          padding: "8px 40px 8px 16px",
          background: disabled ? "var(--hover)" : "var(--panel)",
          border: "1.5px solid var(--border)",
          borderRadius: "10px",
          color: value.length > 0 ? "var(--text)" : "var(--text-soft)",
          fontSize: "14px",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          opacity: disabled ? 0.4 : 1,
          position: "relative",
        }}
      >
        {value.length > 0 ? (
          value.map((val) => (
            <span
              key={val}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "var(--hover)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "12px",
                color: "var(--text)",
              }}
            >
              {val}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(val);
                }}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginLeft: "2px",
                  color: "var(--text-soft)",
                }}
              >
                ×
              </span>
            </span>
          ))
        ) : (
          placeholder
        )}
        <span
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid var(--text-soft)",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            background: "var(--panel)",
            border: "1.5px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 1000,
            maxHeight: "220px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <input
              type="text"
              placeholder="Search districts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: "36px",
                width: "100%",
                padding: "0 12px",
                background: "var(--hover)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div
            style={{
              overflowY: "auto",
              flex: 1,
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    style={{
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "var(--text)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: isSelected ? "var(--hover)" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="multi-select-checkbox"
                    />
                    <span>{opt}</span>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "var(--text-soft)",
                  textAlign: "center",
                }}
              >
                No districts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface Zone {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  districts: string[];
  isActive: boolean;
}
export interface ZonePayload {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  regionId: string;
  districts: string[];
  isActive: boolean;
}

export function Zones() {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    record?: Zone;
  } | null>(null);
  const [toDelete, setToDelete] = useState<Zone | null>(null);
  const [formData, setFormData] = useState<Partial<Zone>>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const isActiveParam = statusFilter === "" ? undefined : statusFilter === "Active";

  const { data = [], isLoading: isLoadingZones, error: errorZones } = useQuery({
    queryKey: ["zones", debouncedSearch, regionFilter, statusFilter],
    queryFn: () => zoneService.getAll(debouncedSearch || undefined, regionFilter || undefined, isActiveParam),
    staleTime: 0,
  });

  const { data: regionOptions = [], isLoading: isLoadingRegions, error: errorRegions } = useQuery({
    queryKey: ["regions", true],
    queryFn: () => regionService.getAll(undefined, true),
  });

  // Fetch Maharashtra districts
  const { data: districtsData } = useQuery({
    queryKey: ["maharashtraDistricts"],
    queryFn: async () => {
      const res = await fetch("https://aniket-thapa.github.io/india-pincode-api/states/maharashtra.json");
      if (!res.ok) throw new Error("Failed to fetch districts");
      return res.json() as Promise<{ districts: { name: string; slug: string }[] }>;
    },
    staleTime: Infinity,
  });

  const districtsList = useMemo(() => {
    if (!districtsData?.districts) return [];
    return districtsData.districts.map((d) => toTitleCase(d.name)).sort();
  }, [districtsData]);

  const addMutation = useMutation({
    mutationFn: zoneService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success(res.message || "Zone created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create zone");
    },
  });

  const updateMutation = useMutation({
    mutationFn: zoneService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success(res.message || "Zone updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update zone");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: zoneService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast.success(res.message || "Zone deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete zone");
    },
  });

  const filteredData = data;

  const handleOpenAdd = () => {
    setFormData({
      zoneName: "",
      regionId: regionOptions?.[0]?.regionId || "",
      districts: [],
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Zone) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.zoneName || !formData.regionId) return;

    const districtsArray = Array.isArray(formData.districts)
      ? formData.districts
      : formData.districts
        ? String(formData.districts)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [];

    if (modal?.mode === "add") {
      addMutation.mutate({
        zoneName: formData.zoneName.trim(),
        regionId: formData.regionId,
        districts: districtsArray,
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        zoneId: modal.record.zoneId,
        zoneName: formData.zoneName.trim(),
        regionId: formData.regionId,
        districts: districtsArray,
        isActive: formData.isActive ?? true,
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate({ zoneId: toDelete.zoneId });
    setToDelete(null);
  };

  return (
    <div>
      <Card
        title="Zone"
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
            <Plus size={13} /> Add zone
          </button>
        }
      >
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search zones..."
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
              <Th>Zone Code</Th>
              <Th>Zone Name</Th>
              <Th>Region Name</Th>
              <Th>Districts</Th>
              <Th>Status</Th>
              {statusFilter !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoadingZones || isLoadingRegions ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading zones...</div>
                </Td>
              </tr>
            ) : errorZones || errorRegions ? (
              <tr>
                <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading data: {(errorZones as Error)?.message || (errorRegions as Error)?.message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {filteredData.map((item: Zone) => (
                  <tr key={item.zoneId} className="stc-row">
                    <Td mono>{item.zoneCode}</Td>
                    <Td>{item.zoneName}</Td>
                    <Td mono>{item.regionName}</Td>
                    <Td>{item.districts?.join(", ")}</Td>
                    <Td>
                      <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
                    </Td>
                    {statusFilter !== "Inactive" && (
                      <Td align="right">
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleOpenEdit(item)}
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
                            onClick={() => setToDelete(item)}
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
                    )}
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <Td colSpan={statusFilter === "Inactive" ? 5 : 6}>
                      {data.length === 0
                        ? "No records yet — use Add zone to create one."
                        : "No zones match the selected filters."}
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>

        {modal && (
          <Modal
            title={`${modal.mode === "add" ? "Add" : "Edit"} — Zone`}
            subtitle={
              modal.mode === "add" ? "Add a new zone" : "Update zone details"
            }
            onClose={() => setModal(null)}
            width={620}
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
                  <label className="stc-field-label">Zone Code</label>
                  <input value={formData.zoneCode || ""} readOnly />
                </div>
              )}

              <div className="stc-field">
                <label className="stc-field-label">Zone Name</label>
                <input
                  value={formData.zoneName || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, zoneName: e.target.value }))
                  }
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">Region Code</label>
                <select
                  value={formData.regionId || ""}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, regionId: e.target.value }))
                  }
                >
                  {regionOptions &&
                    regionOptions.length > 0 &&
                    regionOptions.map((opt) => (
                      <option key={opt.regionId} value={opt.regionId}>
                        {opt.regionCode} / {opt.regionName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="stc-field" style={{ gridColumn: "1 / -1" }}>
                <label className="stc-field-label">Districts</label>
                <SearchableMultiSelect
                  value={formData.districts || []}
                  onChange={(val) =>
                    setFormData((s) => ({
                      ...s,
                      districts: val,
                    }))
                  }
                  options={districtsList}
                  placeholder="Select Districts"
                />
              </div>

              {/* {modal.mode === "edit" && (
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
              )} */}
            </div>
          </Modal>
        )}

        {toDelete && (
          <Modal
            title="Delete — Zone"
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
              This will permanently remove {toDelete.zoneName} from the list.
              This can't be undone.
            </p>
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Zones;
