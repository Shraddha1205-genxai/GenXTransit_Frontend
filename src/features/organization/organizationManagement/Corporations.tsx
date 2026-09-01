import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import { Card, StatusBadge, Th, Td, Modal, Table, TableToolbar } from "../../../components/common";
import { corporationService } from "../../../api/organization/organizationManagement/corporationService";
import { useDebounce } from "../../../hooks/useDebounce";

export interface Corporation {
  corpId: string | false | undefined;
  corpCode: string | undefined;
  corporationName: string;
  stateName: string;
  districtName: string;
  cityName: string;
  isActive: boolean;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
}: SearchableSelectProps) {
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

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          height: "48px",
          padding: "0 40px 0 16px",
          background: disabled ? "var(--hover)" : "var(--panel)",
          border: "1.5px solid var(--border)",
          borderRadius: "10px",
          color: value ? "var(--text)" : "var(--text-soft)",
          fontSize: "14px",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          opacity: disabled ? 0.4 : 1,
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = "var(--text-soft)";
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        <span>{value || placeholder}</span>
        <span
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "10px",
            color: "var(--text-soft)",
            pointerEvents: "none",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            right: 0,
            zIndex: 1000,
            border: "1.5px solid var(--border)",
            borderRadius: "10px",
            background: "var(--panel)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: "36px",
              padding: "0 12px",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              background: "var(--hover)",
              color: "var(--text)",
              fontSize: "13px",
              outline: "none",
              width: "100%",
            }}
            autoFocus
          />
          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
            className="stc-no-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "8px 12px", color: "var(--text-soft)", fontSize: "13px" }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text)",
                    background: value === opt ? "var(--amber-fill)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (value !== opt) e.currentTarget.style.background = "var(--hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (value !== opt) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Corporations() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active");

  const isActiveParam = filterStatus === "Both" ? undefined : filterStatus === "Active";

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["corporations", debouncedSearch, filterState, filterDistrict, filterCity, filterStatus],
    queryFn: () =>
      corporationService.getAll(
        debouncedSearch || undefined,
        filterState || undefined,
        filterDistrict || undefined,
        filterCity || undefined,
        isActiveParam
      ),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: corporationService.insert,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["corporations"] });
      toast.success(res?.message || "Corporation created successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create corporation");
    },
  });

  const updateMutation = useMutation({
    mutationFn: corporationService.update,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["corporations"] });
      toast.success(res?.message || "Corporation updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update corporation");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: corporationService.delete,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["corporations"] });
      toast.success(res?.message || "Corporation deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete corporation");
    },
  });

  const [modal, setModal] = useState<{ mode: "add" | "edit"; record?: Corporation } | null>(null);
  const [toDelete, setToDelete] = useState<Corporation | null>(null);
  const [formData, setFormData] = useState<Partial<Corporation>>({});

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  };

  const { data: statesData = [] } = useQuery({
    queryKey: ["indiaStates"],
    queryFn: async () => {
      const res = await fetch("https://aniket-thapa.github.io/india-pincode-api/states.json");
      if (!res.ok) throw new Error("Failed to fetch states");
      return res.json() as Promise<{ name: string; slug: string }[]>;
    },
    staleTime: Infinity,
  });

  const statesList = useMemo(() => {
    return statesData.map((s) => toTitleCase(s.name)).sort();
  }, [statesData]);

  const selectedStateObj = useMemo(() => {
    if (!formData.stateName) return null;
    return statesData.find(
      (s) => s.name.toLowerCase() === formData.stateName?.toLowerCase()
    );
  }, [statesData, formData.stateName]);

  const stateSlug = selectedStateObj?.slug;

  const { data: districtsData } = useQuery({
    queryKey: ["indiaDistricts", stateSlug],
    queryFn: async () => {
      if (!stateSlug) return null;
      const res = await fetch(`https://aniket-thapa.github.io/india-pincode-api/states/${stateSlug}.json`);
      if (!res.ok) throw new Error("Failed to fetch districts");
      return res.json() as Promise<{ districts: { name: string; slug: string }[] }>;
    },
    enabled: !!stateSlug,
    staleTime: Infinity,
  });

  const districtsList = useMemo(() => {
    if (!districtsData?.districts) return [];
    return districtsData.districts.map((d) => toTitleCase(d.name)).sort();
  }, [districtsData]);

  const selectedDistrictObj = useMemo(() => {
    if (!districtsData?.districts || !formData.districtName) return null;
    return districtsData.districts.find(
      (d) => d.name.toLowerCase() === formData.districtName?.toLowerCase()
    );
  }, [districtsData, formData.districtName]);

  const districtSlug = selectedDistrictObj?.slug;

  const { data: officesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ["indiaOffices", stateSlug, districtSlug],
    queryFn: async () => {
      if (!stateSlug || !districtSlug) return null;
      const res = await fetch(`https://aniket-thapa.github.io/india-pincode-api/districts/${stateSlug}/${districtSlug}.json`);
      if (!res.ok) throw new Error("Failed to fetch offices");
      return res.json() as Promise<{ offices: { officeName: string }[] }>;
    },
    enabled: !!stateSlug && !!districtSlug,
    staleTime: Infinity,
  });

  const citiesList = useMemo(() => {
    if (!officesData?.offices) return [];
    const names = officesData.offices.map((office) => {
      return toTitleCase(
        office.officeName
          .replace(/\s+(B\.O|S\.O|H\.O)(\s*\(.*?\))?$/i, "")
          .replace(/\s+\(.*?\)$/i, "")
          .trim()
      );
    });
    return Array.from(new Set(names)).sort();
  }, [officesData]);

  const finalCities = useMemo(() => {
    return citiesList.length > 0 ? citiesList : [formData.districtName || ""];
  }, [citiesList, formData.districtName]);

  const filterStateObj = useMemo(() => {
    if (!filterState) return null;
    return statesData.find((s) => s.name.toLowerCase() === filterState.toLowerCase());
  }, [statesData, filterState]);

  const filterStateSlug = filterStateObj?.slug;

  const { data: filterDistrictsData } = useQuery({
    queryKey: ["filterDistricts", filterStateSlug],
    queryFn: async () => {
      if (!filterStateSlug) return null;
      const res = await fetch(`https://aniket-thapa.github.io/india-pincode-api/states/${filterStateSlug}.json`);
      if (!res.ok) throw new Error("Failed to fetch districts");
      return res.json() as Promise<{ districts: { name: string; slug: string }[] }>;
    },
    enabled: !!filterStateSlug,
    staleTime: Infinity,
  });

  const filterDistrictsList = useMemo(() => {
    if (!filterDistrictsData?.districts) return [];
    return filterDistrictsData.districts.map((d) => toTitleCase(d.name)).sort();
  }, [filterDistrictsData]);

  const selectedFilterDistrictObj = useMemo(() => {
    if (!filterDistrictsData?.districts || !filterDistrict) return null;
    return filterDistrictsData.districts.find(
      (d) => d.name.toLowerCase() === filterDistrict.toLowerCase()
    );
  }, [filterDistrictsData, filterDistrict]);

  const filterDistrictSlug = selectedFilterDistrictObj?.slug;

  const { data: filterOfficesData, isLoading: isLoadingFilterCities } = useQuery({
    queryKey: ["filterOffices", filterStateSlug, filterDistrictSlug],
    queryFn: async () => {
      if (!filterStateSlug || !filterDistrictSlug) return null;
      const res = await fetch(`https://aniket-thapa.github.io/india-pincode-api/districts/${filterStateSlug}/${filterDistrictSlug}.json`);
      if (!res.ok) throw new Error("Failed to fetch offices");
      return res.json() as Promise<{ offices: { officeName: string }[] }>;
    },
    enabled: !!filterStateSlug && !!filterDistrictSlug,
    staleTime: Infinity,
  });

  const filterCitiesList = useMemo(() => {
    if (!filterOfficesData?.offices) return [];
    const names = filterOfficesData.offices.map((office) => {
      return toTitleCase(
        office.officeName
          .replace(/\s+(B\.O|S\.O|H\.O)(\s*\(.*?\))?$/i, "")
          .replace(/\s+\(.*?\)$/i, "")
          .trim()
      );
    });
    return Array.from(new Set(names)).sort();
  }, [filterOfficesData]);

  const finalFilterCities = useMemo(() => {
    return filterCitiesList.length > 0 ? filterCitiesList : [filterDistrict || ""];
  }, [filterCitiesList, filterDistrict]);

  const handleOpenAdd = () => {
    setFormData({
      corporationName: "",
      stateName: "",
      districtName: "",
      cityName: "",
      isActive: true,
    });
    setModal({ mode: "add" });
  };

  const handleOpenEdit = (record: Corporation) => {
    setFormData(record);
    setModal({ mode: "edit", record });
  };

  const handleSave = () => {
    if (!formData.corporationName || !formData.stateName || !formData.districtName || !formData.cityName) return;

    if (modal?.mode === "add") {
      addMutation.mutate({
        corporationName: formData.corporationName.trim(),
        stateName: formData.stateName.trim(),
        districtName: formData.districtName.trim(),
        cityName: formData.cityName.trim(),
        isActive: true,
      });
    } else if (modal?.mode === "edit" && modal.record) {
      updateMutation.mutate({
        corporationId: String(modal.record.corpId),
        corporationName: formData.corporationName.trim(),
        stateName: formData.stateName.trim(),
        districtName: formData.districtName.trim(),
        cityName: formData.cityName.trim(),
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }

    setModal(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete || !toDelete.corpId) return;
    deleteMutation.mutate({ corporationId: String(toDelete.corpId) });
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
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search corporations..."
          style={{ gridTemplateColumns: "minmax(220px, 1.5fr) repeat(4, minmax(150px, 1fr))" }}
          filters={[
            {
              key: "state",
              label: "All States",
              value: filterState,
              onChange: (val) => {
                setFilterState(val);
                setFilterDistrict("");
                setFilterCity("");
              },
              options: statesList.map((state) => ({ value: state, label: state })),
            },
            {
              key: "district",
              label: "All Districts",
              value: filterDistrict,
              onChange: (val) => {
                setFilterDistrict(val);
                setFilterCity("");
              },
              options: filterDistrictsList.map((d) => ({ value: d, label: d })),
              disabled: !filterState,
            },
            {
              key: "city",
              label: isLoadingFilterCities ? "Loading cities..." : "All Cities",
              value: filterCity,
              onChange: setFilterCity,
              options: finalFilterCities.map((c) => ({ value: c, label: c })),
              disabled: !filterDistrict || isLoadingFilterCities,
            },
            {
              key: "status",
              label: "All Status",
              value: filterStatus,
              onChange: setFilterStatus,
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
              <Th>Corp Code</Th>
              <Th>Corporation Name</Th>
              <Th>State</Th>
              <Th>District</Th>
              <Th>City</Th>
              <Th>Status</Th>
              {filterStatus !== "Inactive" && <Th align="right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={filterStatus === "Inactive" ? 6 : 7}>
                  <div style={{ textAlign: "center", color: "var(--text-soft)", padding: 10 }}>Loading corporations...</div>
                </Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={filterStatus === "Inactive" ? 6 : 7}>
                  <div style={{ textAlign: "center", color: "var(--red)", padding: 10 }}>Error loading corporations: {(error as Error).message}</div>
                </Td>
              </tr>
            ) : (
              <>
                {data.map((item: Corporation) => (
                  <tr key={item?.corpId || Math.random()} className="stc-row">
                    <Td mono>{item.corpCode}</Td>
                    <Td>{item.corporationName}</Td>
                    <Td>{item.stateName}</Td>
                    <Td>{item.districtName}</Td>
                    <Td>{item.cityName}</Td>
                    <Td><StatusBadge status={item.isActive ? "Active" : "Inactive"} /></Td>
                    {filterStatus !== "Inactive" && (
                      <Td align="right">
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          <button disabled={filterStatus === "Both" && !item.isActive} onClick={() => handleOpenEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: filterStatus === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: filterStatus === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Pencil size={14} color={T.textSoft} />
                          </button>
                          <button disabled={filterStatus === "Both" && !item.isActive} onClick={() => setToDelete(item)} title="Delete" style={{ background: "none", border: "none", cursor: filterStatus === "Both" && !item.isActive ? "not-allowed" : "pointer", padding: 2, display: "flex", opacity: filterStatus === "Both" && !item.isActive ? 0.5 : 1 }}>
                            <Trash2 size={14} color={T.red} />
                          </button>
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <Td colSpan={filterStatus === "Inactive" ? 6 : 7}>No records yet — use Add corporation to create one.</Td>
                  </tr>
                )}
              </>
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

              <div className="stc-field" style={{ gridColumn: modal.mode === "add" ? "1 / -1" : undefined }}>
                <label className="stc-field-label">Corporation Name</label>
                <input
                  value={formData.corporationName || ""}
                  onChange={(e) => setFormData((s) => ({ ...s, corporationName: e.target.value }))}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">State Name</label>
                <SearchableSelect
                  value={formData.stateName || ""}
                  onChange={(val) => {
                    setFormData((s) => ({
                      ...s,
                      stateName: val,
                      districtName: "",
                      cityName: "",
                    }));
                  }}
                  options={statesList}
                  placeholder="Select State"
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">District Name</label>
                <SearchableSelect
                  value={formData.districtName || ""}
                  onChange={(val) => {
                    setFormData((s) => ({
                      ...s,
                      districtName: val,
                      cityName: "",
                    }));
                  }}
                  options={districtsList}
                  placeholder="Select District"
                  disabled={!formData.stateName}
                />
              </div>

              <div className="stc-field">
                <label className="stc-field-label">City Name</label>
                <SearchableSelect
                  value={formData.cityName || ""}
                  onChange={(val) => setFormData((s) => ({ ...s, cityName: val }))}
                  options={finalCities}
                  placeholder={isLoadingCities ? "Loading cities..." : "Select Area/City"}
                  disabled={!formData.districtName || isLoadingCities}
                />
              </div>

              {/* {modal.mode === "edit" && (
                <div className="stc-field">
                  <label className="stc-field-label">Status</label>
                  <select
                    value={formData.isActive !== undefined ? (formData.isActive ? "Active" : "Inactive") : "Active"}
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
