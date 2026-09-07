import React, { useState } from "react";
import { fontStack } from "../../../constants/theme";
import { TransportCanvas } from "../../../components/common";
import { authService, type AuthSession } from "../../../api/auth/authService";
import LoginPanel from "./LoginPanel";
import ForgotPasswordPanel from "./ForgotPasswordPanel";

interface AdminAuthScreenProps {
  onLogin: (session: AuthSession) => void;
}

export function AdminAuthScreen({ onLogin }: AdminAuthScreenProps) {
  const [view, setView] = useState<"login" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const doLogin = async () => {
    if (!userName.trim() || !password.trim()) {
      setError("Enter your work email or employee ID and password.");
      return;
    }
    setError("");
    setIsLoggingIn(true);
    try {
      const session = await authService.login({ userName: userName.trim(), password });
      onLogin(session);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to connect to the network."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="transport-login">
      <style>{fontStack}</style>
      <TransportCanvas />
      <main className="login-panel-shell">
        {view === "login" ? (
          <LoginPanel
            userName={userName}
            password={password}
            showPassword={showPassword}
            error={error}
            loading={isLoggingIn}
            onUserNameChange={setUserName}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            onSubmit={doLogin}
            onForgotPassword={() => { setError(""); setView("forgot"); }}
          />
        ) : (
          <ForgotPasswordPanel onBack={() => setView("login")} />
        )}
      </main>
    </div>
  );
}

export default AdminAuthScreen;
