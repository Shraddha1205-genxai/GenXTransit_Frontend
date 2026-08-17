import React from "react";
import { X } from "lucide-react";
import { T } from "../../constants/theme";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ title, onClose, children, width }: ModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(16,27,38,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <div
        className="stc-no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.panel, borderRadius: 8, width: width || 460, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(16,27,38,0.35)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.panel }}>
          <h3 className="stc-display" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={17} color={T.textSoft} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}
