import React, { useState } from "react";
import { Modal } from "./Modal";
import { FormField, FormFieldConfig } from "./FormField";
import { T } from "../../constants/theme";

interface RecordModalProps {
  title: string;
  fields: FormFieldConfig[];
  initial: any;
  idKey: string;
  mode: "add" | "edit";
  onSave: (val: any) => void;
  onClose: () => void;
}

export function RecordModal({ title, fields, initial, idKey, mode, onSave, onClose }: RecordModalProps) {
  const [values, setValues] = useState(() => {
    const v = { ...initial };
    fields.forEach((f) => {
      if (v[f.key] === undefined) v[f.key] = f.type === "number" ? 0 : (f.options ? f.options[0] : "");
    });
    return v;
  });
  return (
    <Modal title={title} onClose={onClose}>
      {fields.map((f) => (
        <FormField
          key={f.key}
          field={f}
          value={values[f.key]}
          disabled={mode === "edit" && f.key === idKey}
          onChange={(v) => setValues((s: any) => ({ ...s, [f.key]: v }))}
        />
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={() => onSave(values)} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.ink, color: "#F4F0E4", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Save
        </button>
      </div>
    </Modal>
  );
}
