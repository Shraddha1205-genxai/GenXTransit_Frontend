import React, { useState } from "react";
import { UserCog, KeyRound, EyeOff, Eye, Mail, Building2, ArrowRight, CheckCircle2, Bus } from "lucide-react";
import { T, fontStack } from "../../../constants/theme";
import { Card, FormField } from "../../../components/common";

export const ADMIN_ROLES = ["Depot Manager", "Control Room Operator", "Finance Officer", "Support Agent", "System Administrator"];

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  right?: React.ReactNode;
}

function AuthInput({ icon: Icon, right, ...props }: AuthInputProps) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      {Icon && <Icon size={15} color={T.textFaint} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />}
      <input
        {...props}
        style={{
          width: "100%", padding: `11px ${right ? 36 : 12}px 11px ${Icon ? 34 : 12}px`, border: `1px solid ${T.border}`,
          borderRadius: 5, fontSize: 13.5, fontFamily: "inherit", color: T.text, background: T.panel, boxSizing: "border-box",
        }}
      />
      {right}
    </div>
  );
}

interface PrimaryButtonInlineProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ComponentType<{ size?: number }>;
}

function PrimaryButtonInline({ children, onClick, icon: Icon }: PrimaryButtonInlineProps) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 18px", borderRadius: 5, border: "none", cursor: "pointer", background: T.ink, color: "#F4F0E4", fontSize: 13, fontWeight: 600 }}>
      {Icon && <Icon size={15} />} {children}
    </button>
  );
}

interface AdminAuthScreenProps {
  onLogin: (session: { name: string; role: string; depot: string }) => void;
  onAddUser: (user: any) => void;
}

export function AdminAuthScreen({ onLogin, onAddUser }: AdminAuthScreenProps) {
  const [mode, setMode] = useState("login"); // login | request | submitted
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ id: "", email: "", password: "", name: "", depot: "", role: ADMIN_ROLES[0] });
  const [error, setError] = useState("");

  const doLogin = () => {
    if (!form.id.trim() || !form.password.trim()) { setError("Enter your employee ID / email and password."); return; }
    setError("");
    onLogin({ name: form.id.includes("@") ? form.id.split("@")[0] : form.id, role: "Control Room Operator", depot: "All depots" });
  };

  const submitRequest = () => {
    if (!form.name.trim() || !form.email.trim() || !form.depot.trim()) { setError("Fill in name, email and depot scope to request access."); return; }
    setError("");
    const newId = `USR-${Math.floor(Math.random() * 9000) + 1000}`;
    onAddUser({ id: newId, name: form.name, role: form.role, depot: form.depot, status: "Pending verification" });
    setMode("submitted");
  };

  return (
    <div className="stc-body" style={{ minHeight: "100vh", display: "flex", background: T.canvas }}>
      <style>{fontStack}</style>

      <div style={{ flex: "0 0 42%", background: T.ink, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 40, color: "#F4F0E4" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: T.amber, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bus size={15} color={T.ink} />
          </div>
          <span className="stc-display" style={{ fontSize: 15, fontWeight: 600 }}>TransitX</span>
        </div>
        <div>
          <div className="stc-display" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.28, marginBottom: 14 }}>
            One console for depots, fleet, fares & the field.
          </div>
          <div style={{ fontSize: 13.5, color: "#B8C0C8", lineHeight: 1.6, maxWidth: 380 }}>
            Operations, ticketing, tracking and finance across MSRTC, BEST and PMPML — role-scoped access for depot, control-room and back-office staff.
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#7E8A94" }}>© State Road Transport Corporation — internal use only</div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: 380, maxWidth: "100%" }}>
          <Card style={{ padding: 24 }}>
            {mode === "login" && (
              <>
                <h2 className="stc-display" style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 600, color: T.text }}>Staff sign in</h2>
                <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 20 }}>Use your employee ID or work email.</div>

                <AuthInput icon={UserCog} placeholder="Employee ID or email" value={form.id} onChange={(e) => setForm({ ...form, id: (e.target as HTMLInputElement).value })} />
                <AuthInput
                  icon={KeyRound} type={showPw ? "text" : "password"} placeholder="Password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })}
                  right={
                    <button onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                      {showPw ? <EyeOff size={15} color={T.textFaint} /> : <Eye size={15} color={T.textFaint} />}
                    </button>
                  }
                />
                {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <a style={{ fontSize: 12, color: T.textSoft, cursor: "pointer" }}>Forgot password?</a>
                </div>

                <PrimaryButtonInline icon={ArrowRight} onClick={doLogin}>Sign in</PrimaryButtonInline>

                <div style={{ textAlign: "center", marginTop: 18, fontSize: 12.5, color: T.textSoft }}>
                  New staff member? <a onClick={() => { setMode("request"); setError(""); }} style={{ color: T.amberDeep, fontWeight: 600, cursor: "pointer" }}>Request access</a>
                </div>
              </>
            )}

            {mode === "request" && (
              <>
                <h2 className="stc-display" style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 600, color: T.text }}>Request access</h2>
                <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 20 }}>Submitted requests need approval from a System Administrator before sign-in works.</div>

                <AuthInput icon={UserCog} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
                <AuthInput icon={Mail} placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })} />
                <FormField field={{ label: "Role requested", type: "select", options: ADMIN_ROLES, key: "role" }} value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
                <AuthInput icon={Building2} placeholder="Depot / scope (e.g. MSRTC-PUN-01, or All depots)" value={form.depot} onChange={(e) => setForm({ ...form, depot: (e.target as HTMLInputElement).value })} />
                {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}

                <PrimaryButtonInline icon={ArrowRight} onClick={submitRequest}>Submit request</PrimaryButtonInline>

                <div style={{ textAlign: "center", marginTop: 18, fontSize: 12.5, color: T.textSoft }}>
                  Already have access? <a onClick={() => { setMode("login"); setError(""); }} style={{ color: T.amberDeep, fontWeight: 600, cursor: "pointer" }}>Sign in</a>
                </div>
              </>
            )}

            {mode === "submitted" && (
              <div style={{ textAlign: "center", padding: "20px 4px" }}>
                <CheckCircle2 size={36} color={T.green} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Request submitted</div>
                <div style={{ fontSize: 12.5, color: T.textSoft, marginBottom: 20, lineHeight: 1.6 }}>
                  {form.name}'s access request for <strong>{form.role}</strong> at <strong>{form.depot}</strong> is now pending approval in Users &amp; Roles.
                </div>
                <button onClick={() => { setMode("login"); setForm({ id: "", email: "", password: "", name: "", depot: "", role: ADMIN_ROLES[0] }); }}
                  style={{ padding: "9px 16px", borderRadius: 5, border: `1px solid ${T.border}`, background: T.panel, color: T.textSoft, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                  Back to sign in
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminAuthScreen;
