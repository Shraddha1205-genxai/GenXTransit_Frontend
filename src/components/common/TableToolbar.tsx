import React from "react";

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
        const normalizedLabel = filter.label.trim().toLowerCase();
        const isStatusFilter =
          filter.key === "status" ||
          filter.key === "filterStatus" ||
          normalizedLabel === "status" ||
          normalizedLabel === "all status" ||
          normalizedLabel === "all statuses";
        const shouldHideDefault = filter.hideDefaultOption || isStatusFilter;

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
          <select
            key={filter.key}
            className="stc-table-filter"
            value={filter.value}
            disabled={filter.disabled}
            onChange={(event) => filter.onChange(event.target.value)}
            aria-label={filter.label}
          >
            {!shouldHideDefault && <option value="">{filter.label}</option>}
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}

export default TableToolbar;
