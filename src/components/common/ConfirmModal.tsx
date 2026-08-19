import React from "react";
import { Trash2 } from "lucide-react";
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
    <Modal
      title={title}
      subtitle="This action cannot be undone"
      icon={<Trash2 size={20} color={T.red} />}
      iconVariant="danger"
      onClose={onClose}
      width={440}
      footer={
        <>
          <button className="stc-btn stc-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="stc-btn stc-btn-danger" onClick={onConfirm}>
            <Trash2 size={16} />
            Delete
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.7, margin: 0 }}>
        {message}
      </p>
    </Modal>
  );
}
