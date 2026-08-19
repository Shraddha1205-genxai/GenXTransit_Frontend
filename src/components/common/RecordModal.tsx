import React, { useState } from "react";
import { FilePlus, FilePen } from "lucide-react";
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
      if (v[f.key] === undefined)
        v[f.key] = f.type === "number" ? 0 : (f.options ? f.options[0] : "");
    });
    return v;
  });

  const useGrid = fields.length >= 4;
  const Icon = mode === "add" ? FilePlus : FilePen;

  return (
    <Modal
      title={title}
      subtitle={mode === "add" ? "Add a new record" : "Edit record"}
      icon={<Icon size={20} color={T.amber} />}
      onClose={onClose}
      width={useGrid ? 640 : 520}
      footer={
        <>
          <button className="stc-btn stc-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="stc-btn stc-btn-primary" onClick={() => onSave(values)}>
            {mode === "add" ? "Create" : "Save changes"}
          </button>
        </>
      }
    >
      <div className={`stc-form-grid${useGrid ? "" : " stc-form-grid--single"}`}>
        {fields.map((f) => (
          <FormField
            key={f.key}
            field={f}
            value={values[f.key]}
            disabled={mode === "edit" && f.key === idKey}
            onChange={(v) => setValues((s: any) => ({ ...s, [f.key]: v }))}
          />
        ))}
      </div>
    </Modal>
  );
}
