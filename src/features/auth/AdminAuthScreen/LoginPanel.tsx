import React from "react";
import { ArrowUpRight, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { T } from "../../../constants/theme";
import { AuthInput, PrimaryButtonInline } from "../../../components/common";

interface LoginPanelProps {
  userName: string;
  password: string;
  showPassword: boolean;
  error: string;
  loading: boolean;
  onUserNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export default function LoginPanel({
  userName,
  password,
  showPassword,
  error,
  loading,
  onUserNameChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
}: LoginPanelProps) {
  return (
    <div className="login-panel-content">
      <h2 className="stc-display">Welcome back.</h2>
      <p className="login-panel-copy">
        Sign in to your operations desk and pick up where you left off.
      </p>

      <div className="login-form">
        <AuthInput
          icon={UserRound}
          placeholder="Work email"
          value={userName}
          onChange={(event) => onUserNameChange(event.target.value)}
          autoComplete="username"
        />
        <AuthInput
          icon={KeyRound}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete="current-password"
          right={
            <button
              type="button"
              className="login-icon-button"
              onClick={onTogglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={17} color={T.textFaint} />
              ) : (
                <Eye size={17} color={T.textFaint} />
              )}
            </button>
          }
        />
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}
        <div className="login-form-meta">
          <button
            type="button"
            onClick={onForgotPassword}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit", color: "inherit" }}
          >
            Forgot password?
          </button>
        </div>
        <PrimaryButtonInline
          onClick={onSubmit}
          icon={ArrowUpRight}
          disabled={loading}
        >
          {loading ? "Connecting to network..." : "Sign in"}
        </PrimaryButtonInline>
      </div>
    </div>
  );
}
