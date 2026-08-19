import React from "react";

export interface FormFieldConfig {
  key: string;
  label: string;
  type: string;
  options?: string[];
}

interface FormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export function FormField({ field, value, onChange, disabled }: FormFieldProps) {
  return (
    <div className="stc-field">
      <label className="stc-field-label">{field.label}</label>
      {field.type === "select" && field.options ? (
        <select
          disabled={disabled}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          disabled={disabled}
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          placeholder={field.label}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}
