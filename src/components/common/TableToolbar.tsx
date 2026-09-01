import React from "react";

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilter {
  key: string;
  label: string;
  value: string;
  options: TableFilterOption[];
  disabled?: boolean;
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
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="stc-table-filter"
          value={filter.value}
          disabled={filter.disabled}
          onChange={(event) => filter.onChange(event.target.value)}
          aria-label={filter.label || "Select filter option"}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

export default TableToolbar;
