import React from "react";
import { Trash2 } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, StatusBadge, Th, Td, SectionHeader } from "../../../components/common";

export interface UserRecord {
  id: string;
  name: string;
  role: string;
  depot: string;
  status: string;
}

interface UsersRolesProps {
  data: UserRecord[];
  onUpdate: (id: string, item: UserRecord) => void;
  onDelete: (id: string) => void;
}

export function UsersRoles({ data, onUpdate, onDelete }: UsersRolesProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_APP_USER · TBL_MAST_ROLE" title="User & role administration" />
      <Card title="System users">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Depot scope</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((u: UserRecord) => (
              <tr key={u.id} className="stc-row">
                <Td>{u.name}</Td>
                <Td>{u.role}</Td>
                <Td mono>{u.depot}</Td>
                <Td><StatusBadge status={u.status} /></Td>
                <Td align="right">
                  {u.status === "Pending verification" ? (
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => onUpdate(u.id, { ...u, status: "Active" })} style={{ fontSize: 11.5, fontWeight: 600, color: T.green, background: "none", border: `1px solid ${T.green}`, borderRadius: 4, padding: "4px 9px", cursor: "pointer" }}>Approve</button>
                      <button onClick={() => onDelete(u.id)} style={{ fontSize: 11.5, fontWeight: 600, color: T.red, background: "none", border: `1px solid ${T.red}`, borderRadius: 4, padding: "4px 9px", cursor: "pointer" }}>Reject</button>
                    </div>
                  ) : (
                    <button onClick={() => onDelete(u.id)} title="Revoke access" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "inline-flex" }}>
                      <Trash2 size={14} color={T.red} />
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default UsersRoles;
