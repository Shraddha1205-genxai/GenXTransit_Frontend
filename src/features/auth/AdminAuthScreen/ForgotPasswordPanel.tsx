import React, { useState } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { AuthInput, PrimaryButtonInline } from "../../../components/common";
import { authService } from "../../../api/auth/authService";

interface ForgotPasswordPanelProps {
  onBack: () => void;
}

export default function ForgotPasswordPanel({ onBack }: ForgotPasswordPanelProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your work email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(trimmed);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
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
            <h2 className="stc-display" style={{ marginBottom: 8 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.65, maxWidth: 320 }}>
              A password reset link has been sent to <strong style={{ color: T.text }}>{email}</strong>. Check your spam folder if you don't see it.
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
            <ArrowLeft size={15} />
            Back to sign in
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
        onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
        onMouseLeave={(e) => (e.currentTarget.style.color = T.textSoft)}
      >
        <ArrowLeft size={14} />
        Back to sign in
      </button>

      <h2 className="stc-display">Forgot password?</h2>
      <p className="login-panel-copy">
        Enter your work email and we'll send you a reset link.
      </p>

      <div className="login-form">
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          autoComplete="email"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && (
          <div className="login-error" role="alert">{error}</div>
        )}
        <PrimaryButtonInline
          onClick={handleSubmit}
          icon={Mail}
          disabled={loading}
        >
          {loading ? "Sending reset link..." : "Send reset link"}
        </PrimaryButtonInline>
      </div>
    </div>
  );
}
