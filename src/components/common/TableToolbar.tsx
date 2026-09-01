import React, { useState, useRef, useEffect, useMemo } from "react";

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilter {
  key: string;
  label: string;
  value: string;
  options?: TableFilterOption[];
  disabled?: boolean;
  type?: "select" | "date";
  searchable?: boolean;
  hideDefaultOption?: boolean;
  onChange: (value: string) => void;
}

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: TableFilter[];
  style?: React.CSSProperties;
}

function CuteFilterDropdown({ filter }: { filter: TableFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 140),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedLabel = filter.label.trim().toLowerCase();
  const isStatusFilter =
    filter.key === "status" ||
    filter.key === "filterStatus" ||
    normalizedLabel === "status" ||
    normalizedLabel === "all status" ||
    normalizedLabel === "all statuses";
  const shouldHideDefault = filter.hideDefaultOption || isStatusFilter;

  const selectedOption = filter.options?.find((opt) => opt.value === filter.value);
  const displayText = selectedOption?.label || (filter.value ? filter.value : filter.label);

  return (
    <div ref={containerRef} style={{ position: "relative", minWidth: 100, flex: "0 1 auto", maxWidth: 130 }}>
      <button
        ref={buttonRef}
        type="button"
        disabled={filter.disabled}
        onClick={() => {
          if (!filter.disabled) {
            updateCoords();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          height: 38,
          padding: "0 30px 0 14px",
          background: filter.value ? "var(--amber-fill)" : "var(--panel)",
          border: filter.value ? "none" : "1.5px solid var(--border)",
          borderRadius: 10,
          color: filter.value ? "var(--text)" : "var(--text-soft)",
          fontSize: 13,
          fontWeight: filter.value ? 600 : 500,
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          cursor: filter.disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          position: "relative",
          transition: "all 0.18s ease",
          opacity: filter.disabled ? 0.5 : 1,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayText}</span>
        {filter.value && !filter.disabled && !isStatusFilter ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              filter.onChange("");
              setIsOpen(false);
            }}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              fontWeight: "bold",
              color: "var(--amber-deep)",
              cursor: "pointer",
              padding: "2px 4px",
              lineHeight: 1,
            }}
            title="Clear filter"
          >
            ✕
          </span>
        ) : (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: isOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
              fontSize: 10,
              color: filter.value ? "var(--amber-deep)" : "var(--text-soft)",
              transition: "transform 0.2s ease",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        )}
      </button>

      {isOpen && !filter.disabled && (
        <div
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 999999,
            maxHeight: 240,
            overflowY: "auto",
            background: "var(--panel)",
            border: "1.5px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
          className="stc-no-scrollbar"
        >
          {!shouldHideDefault && (
            <div
              style={{
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: !filter.value ? 600 : 400,
                borderRadius: 8,
                cursor: "pointer",
                color: !filter.value ? "var(--amber-deep)" : "var(--text-soft)",
                background: !filter.value ? "var(--amber-fill)" : "transparent",
                transition: "background 0.15s ease",
              }}
              onClick={() => {
                filter.onChange("");
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                if (filter.value) e.currentTarget.style.background = "var(--hover)";
              }}
              onMouseLeave={(e) => {
                if (filter.value) e.currentTarget.style.background = "transparent";
              }}
            >
              {filter.label}
            </div>
          )}

          {filter.options?.map((opt) => {
            const isSelected = opt.value === filter.value;
            return (
              <div
                key={opt.value}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  borderRadius: 8,
                  cursor: "pointer",
                  color: isSelected ? "var(--amber-deep)" : "var(--text)",
                  background: isSelected ? "var(--amber-fill)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background 0.15s ease",
                }}
                onClick={() => {
                  filter.onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{opt.label}</span>
                {isSelected && <span style={{ fontSize: 12, color: "var(--amber-deep)", fontWeight: "bold" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchableFilter({ filter }: { filter: TableFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 140),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = filter.options?.find((opt) => opt.value === filter.value);
  const displayValue = isOpen ? searchTerm : (selectedOption?.label || filter.value || "");

  const filteredOptions = useMemo(() => {
    if (!filter.options) return [];
    if (!searchTerm.trim()) return filter.options;
    return filter.options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filter.options, searchTerm]);

  return (
    <div ref={containerRef} style={{ position: "relative", minWidth: 100, flex: "0 1 auto", maxWidth: 130 }}>
      <input
        ref={inputRef}
        type="text"
        className="stc-table-filter"
        placeholder={filter.label}
        value={displayValue}
        disabled={filter.disabled}
        onFocus={() => {
          updateCoords();
          setIsOpen(true);
          setSearchTerm("");
        }}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          updateCoords();
          setIsOpen(true);
          if (!e.target.value) {
            filter.onChange("");
          }
        }}
        style={{
          paddingRight: filter.value ? 24 : 10,
          textOverflow: "ellipsis",
          width: "100%",
          height: 38,
          borderRadius: 10,
          background: filter.value ? "var(--amber-fill)" : "var(--panel)",
          border: filter.value ? "none" : "1.5px solid var(--border)",
          color: filter.value ? "var(--text)" : "var(--text-soft)",
          fontWeight: filter.value ? 600 : 500,
        }}
      />
      {filter.value && !filter.disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            filter.onChange("");
            setSearchTerm("");
            setIsOpen(false);
          }}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: "bold",
            color: "var(--amber-deep)",
            padding: "2px 4px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
      {isOpen && !filter.disabled && (
        <div
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 999999,
            maxHeight: 240,
            overflowY: "auto",
            background: "var(--panel)",
            border: "1.5px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
          className="stc-no-scrollbar"
        >
          {!filter.hideDefaultOption && (
            <div
              style={{
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: !filter.value ? 600 : 400,
                borderRadius: 8,
                cursor: "pointer",
                color: !filter.value ? "var(--amber-deep)" : "var(--text-soft)",
                background: !filter.value ? "var(--amber-fill)" : "transparent",
              }}
              onClick={() => {
                filter.onChange("");
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                if (filter.value) e.currentTarget.style.background = "var(--hover)";
              }}
              onMouseLeave={(e) => {
                if (filter.value) e.currentTarget.style.background = "transparent";
              }}
            >
              {filter.label}
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-soft)" }}>No matches found</div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === filter.value;
              return (
                <div
                  key={opt.value}
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    borderRadius: 8,
                    cursor: "pointer",
                    color: isSelected ? "var(--amber-deep)" : "var(--text)",
                    background: isSelected ? "var(--amber-fill)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onClick={() => {
                    filter.onChange(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{opt.label}</span>
                  {isSelected && <span style={{ fontSize: 12, color: "var(--amber-deep)", fontWeight: "bold" }}>✓</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  style,
}: TableToolbarProps) {
  return (
    <div className="stc-table-toolbar" style={style}>
      <input
        className="stc-table-search"
        type="search"
        value={search}
        placeholder={searchPlaceholder}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label={searchPlaceholder}
      />
      {filters.map((filter) => {
        if (filter.searchable) {
          return <SearchableFilter key={filter.key} filter={filter} />;
        }

        return filter.type === "date" ? (
          <input
            key={filter.key}
            type="date"
            className="stc-table-filter"
            value={filter.value}
            disabled={filter.disabled}
            onChange={(event) => filter.onChange(event.target.value)}
            aria-label={filter.label}
          />
        ) : (
          <CuteFilterDropdown key={filter.key} filter={filter} />
        );
      })}
    </div>
  );
}

export default TableToolbar;
