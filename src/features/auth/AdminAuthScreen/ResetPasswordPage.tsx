import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fontStack } from "../../../constants/theme";
import { TransportCanvas } from "../../../components/common";
import ResetPasswordPanel from "./ResetPasswordPanel";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = (searchParams.get("token") || "").replace(/ /g, "+");

  return (
    <div className="transport-login">
      <style>{fontStack}</style>
      <TransportCanvas />
      <main className="login-panel-shell">
        <ResetPasswordPanel token={token} onBack={() => navigate("/login")} />
      </main>
    </div>
  );
}
