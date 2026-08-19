import React from "react";
import { X } from "lucide-react";
import { T } from "../../constants/theme";

interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconVariant?: "default" | "danger";
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export function Modal({ title, subtitle, icon, iconVariant = "default", onClose, children, footer, width }: ModalProps) {
  return (
    <div className="stc-modal-backdrop" onClick={onClose}>
      <div
        className="stc-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: width || 520 }}
      >
        {/* ── Header ── */}
        <div className="stc-modal-header">
          <div className="stc-modal-header-left">
            {icon && <div className={`stc-modal-icon${iconVariant === "danger" ? " danger" : ""}`}>{icon}</div>}
            <div className="stc-modal-titles">
              <span className="stc-modal-title">{title}</span>
              {subtitle && <span className="stc-modal-subtitle">{subtitle}</span>}
            </div>
          </div>
          <button className="stc-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="stc-modal-body">{children}</div>

        {/* ── Footer ── */}
        {footer && <div className="stc-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
