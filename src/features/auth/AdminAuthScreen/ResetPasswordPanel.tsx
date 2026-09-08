import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { PrimaryButtonInline } from "../../../components/common";
import { authService } from "../../../api/auth/authService";

interface Props {
  token: string;
  onBack: () => void;
}

function PasswordField({ label, value, show, onChange, onToggle, onKeyDown }: {
  label: string; value: string; show: boolean;
  onChange: (v: string) => void; onToggle: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: T.textSoft }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{
            width: "100%", padding: "10px 40px 10px 14px", fontSize: 14,
            border: `1px solid ${T.border}`, borderRadius: 8,
            background: T.panel, color: T.text, outline: "none", boxSizing: "border-box",
          }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
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

export default function ResetPasswordPanel({ token, onBack }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword) { setError("New password is required."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-panel-content">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, padding: "8px 0 24px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: T.greenFill, border: `1.5px solid ${T.green}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle2 size={28} color={T.green} />
          </div>
          <div>
            <h2 className="stc-display" style={{ marginBottom: 8 }}>Password reset!</h2>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.65 }}>
              Your password has been reset successfully.
            </p>
          </div>
          <button
            onClick={onBack}
            style={{
              marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600, color: T.amber, background: "none",
              border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-panel-content">
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 500, color: T.textSoft, background: "none",
          border: "none", cursor: "pointer", padding: 0, marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Back to sign in
      </button>

      <h2 className="stc-display">Reset password</h2>
      <p className="login-panel-copy">Enter your new password below.</p>

      <div className="login-form" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <PasswordField label="New Password" value={newPassword} show={showNew} onChange={(v) => { setNewPassword(v); setError(""); }} onToggle={() => setShowNew((v) => !v)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        <PasswordField label="Confirm Password" value={confirmPassword} show={showConfirm} onChange={(v) => { setConfirmPassword(v); setError(""); }} onToggle={() => setShowConfirm((v) => !v)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        {error && <div className="login-error" role="alert">{error}</div>}
        <PrimaryButtonInline onClick={handleSubmit} disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </PrimaryButtonInline>
      </div>
    </div>
  );
}
