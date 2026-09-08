import React, { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { T } from "../../../constants/theme";
import { Modal } from "../../../components/common";
import { authService } from "../../../api/auth/authService";

interface PasswordInputProps {
  label: string;
  value: string;
  show: boolean;
  onChange: (v: string) => void;
  onToggle: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function PasswordInput({ label, value, show, onChange, onToggle, onKeyDown }: PasswordInputProps) {
  return (
    <div className="stc-field">
      <label className="stc-field-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ paddingRight: 36 }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center",
          }}
        >
          {show ? <EyeOff size={15} color={T.textFaint} /> : <Eye size={15} color={T.textFaint} />}
        </button>
      </div>
    </div>
  );
}

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!oldPassword) { toast.error("Current password is required."); return; }
    if (!newPassword) { toast.error("New password is required."); return; }
    if (newPassword.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (newPassword === oldPassword) { toast.error("New password must be different from current password."); return; }
    if (!confirmPassword) { toast.error("Please confirm your new password."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword, confirmPassword);
      toast.success("Password changed successfully.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      subtitle="Update your account password"
      icon={<KeyRound size={18} color={T.amber} />}
      onClose={onClose}
      width={460}
      footer={
        <>
          <button className="stc-btn stc-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="stc-btn stc-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <PasswordInput label="Current Password" value={oldPassword} show={showOld} onChange={setOldPassword} onToggle={() => setShowOld((v) => !v)} onKeyDown={(e) => e.key === "Enter" && handleSave()} />
        <PasswordInput label="New Password" value={newPassword} show={showNew} onChange={setNewPassword} onToggle={() => setShowNew((v) => !v)} onKeyDown={(e) => e.key === "Enter" && handleSave()} />
        <PasswordInput label="Confirm New Password" value={confirmPassword} show={showConfirm} onChange={setConfirmPassword} onToggle={() => setShowConfirm((v) => !v)} onKeyDown={(e) => e.key === "Enter" && handleSave()} />
      </div>
    </Modal>
  );
}
