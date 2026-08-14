import React from "react";
import { Modal } from "./Modal";
import { T } from "../../constants/theme";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({ title, message, onConfirm, onClose }: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onClose} width={380}>
      <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.5, margin: "0 0 18px" }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: T.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Delete
        </button>
      </div>
    </Modal>
  );
}
