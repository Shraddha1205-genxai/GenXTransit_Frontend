import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import { Card, StatusBadge, Th, Td, Modal, Table, TableToolbar } from "../../../components/common";
import { corporationService } from "../../../api/organization/organizationManagement/corporationService";
import { useDebounce } from "../../../hooks/useDebounce";
import { getStates, getDistrictsByState, getAllDistricts, INDIA_GEO_DATA } from "../../../constants/indiaGeoData";

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [maxListHeight, setMaxListHeight] = useState(180);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 65;
      const computedMaxHeight = Math.min(180, Math.max(90, spaceBelow));
      setMaxListHeight(computedMaxHeight);

      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const modalBody = buttonRef.current?.closest(".stc-modal-body");
      if (modalBody) {
        modalBody.scrollTo({
          top: modalBody.scrollHeight,
          behavior: "smooth",
        });
      } else {
        buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      updateCoords();

      const timer1 = setTimeout(updateCoords, 50);
      const timer2 = setTimeout(updateCoords, 150);
      const timer3 = setTimeout(updateCoords, 300);

      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen]);

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
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!disabled) {
            updateCoords();
            setIsOpen(!isOpen);
          }
        }}
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
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 999999,
            border: "1.5px solid var(--border)",
            borderRadius: "10px",
            background: "var(--panel)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
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
              maxHeight: `${maxListHeight}px`,
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

  const statesList = useMemo(() => getStates(), []);

  const districtsList = useMemo(() => {
    if (formData.stateName) {
      return getDistrictsByState(formData.stateName);
    }
    return getAllDistricts();
  }, [formData.stateName]);

  const stateSlug = useMemo(() => {
    if (!formData.stateName) return "";
    return formData.stateName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  }, [formData.stateName]);

  const districtSlug = useMemo(() => {
    if (!formData.districtName) return "";
    return formData.districtName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  }, [formData.districtName]);

  const { data: districtOfficesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ["districtOffices", stateSlug, districtSlug, formData.districtName],
    queryFn: async () => {
      if (!formData.districtName || !districtSlug) return null;

      let sSlug = stateSlug;
      if (!sSlug) {
        const foundState = Object.entries(INDIA_GEO_DATA).find(([_, dists]) =>
          dists.some((d) => d.toLowerCase() === formData.districtName?.toLowerCase())
        );
        if (foundState) {
          sSlug = foundState[0].toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        }
      }

      if (!sSlug) return null;
      const res = await fetch(`https://aniket-thapa.github.io/india-pincode-api/districts/${sSlug}/${districtSlug}.json`);
      if (!res.ok) return null;
      return res.json() as Promise<{ offices: { officeName: string }[] }>;
    },
    enabled: !!formData.districtName,
    staleTime: Infinity,
  });

  const finalCities = useMemo(() => {
    if (!formData.districtName) return [];

    if (districtOfficesData?.offices && districtOfficesData.offices.length > 0) {
      const cleanedNames = districtOfficesData.offices.map((office) => {
        return toTitleCase(
          office.officeName
            .replace(/\s+(B\.O|S\.O|H\.O)(\s*\(.*?\))?$/i, "")
            .replace(/\s+\(.*?\)$/i, "")
            .trim()
        );
      });
      const uniqueCities = Array.from(new Set(cleanedNames)).sort();
      const formattedDistrict = toTitleCase(formData.districtName);
      if (!uniqueCities.includes(formattedDistrict)) {
        uniqueCities.unshift(formattedDistrict);
      }
      return uniqueCities;
    }

    return [toTitleCase(formData.districtName)];
  }, [districtOfficesData, formData.districtName]);

  const filterDistrictsList = useMemo(() => {
    if (filterState) {
      return getDistrictsByState(filterState);
    }
    return getAllDistricts();
  }, [filterState]);

  const filterDistrictSlug = useMemo(() => {
    if (!filterDistrict) return "";
    return filterDistrict.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  }, [filterDistrict]);

  const { data: filterOfficesData, isLoading: isLoadingFilterCities } = useQuery({
    queryKey: ["filterOffices", filterDistrictSlug, filterDistrict],
    queryFn: async () => {
      if (!filterDistrict || !filterDistrictSlug) return null;

      let sSlug = filterState ? filterState.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") : "";
      if (!sSlug) {
        const foundState = Object.entries(INDIA_GEO_DATA).find(([_, dists]) =>
          dists.some((d) => d.toLowerCase() === filterDistrict.toLowerCase())
        );
        if (foundState) {
          sSlug = foundState[0].toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        }
      }

      if (!sSlug) return null;
      const res = await fetch(`https://aniket-thapa.github.io/india-pincode-api/districts/${sSlug}/${filterDistrictSlug}.json`);
      if (!res.ok) return null;
      return res.json() as Promise<{ offices: { officeName: string }[] }>;
    },
    enabled: !!filterDistrict,
    staleTime: Infinity,
  });

  const finalFilterCities = useMemo(() => {
    if (!filterDistrict) return [];

    if (filterOfficesData?.offices && filterOfficesData.offices.length > 0) {
      const cleanedNames = filterOfficesData.offices.map((office) => {
        return toTitleCase(
          office.officeName
            .replace(/\s+(B\.O|S\.O|H\.O)(\s*\(.*?\))?$/i, "")
            .replace(/\s+\(.*?\)$/i, "")
            .trim()
        );
      });
      const uniqueCities = Array.from(new Set(cleanedNames)).sort();
      const formattedDistrict = toTitleCase(filterDistrict);
      if (!uniqueCities.includes(formattedDistrict)) {
        uniqueCities.unshift(formattedDistrict);
      }
      return uniqueCities;
    }

    return [toTitleCase(filterDistrict)];
  }, [filterOfficesData, filterDistrict]);

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
              searchable: true,
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
              searchable: true,
              onChange: (val) => {
                setFilterDistrict(val);
                setFilterCity("");
              },
              options: filterDistrictsList.map((d) => ({ value: d, label: d })),
            },
            {
              key: "city",
              label: isLoadingFilterCities ? "Loading cities..." : "All Cities",
              value: filterCity,
              searchable: true,
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
            bodyStyle={{ maxHeight: "300px" }}
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
