import React from "react";
import { T } from "../../constants/theme";

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
  const common = {
    disabled,
    style: {
      width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13,
      fontFamily: "inherit", color: disabled ? T.textFaint : T.text, background: disabled ? T.canvas : T.panel, boxSizing: "border-box" as const,
    },
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 5 }}>
        {field.label}
      </label>
      {field.type === "select" && field.options ? (
        <select {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          {...common}
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}
