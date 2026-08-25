import React from "react";
import { ShieldCheck } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, Table, Td, Th } from "../../../components/common";

const authorizations = [
  {
    id: "AUT-001",
    role: "Super Admin",
    module: "Organization",
    read: true,
    write: true,
    approve: true,
  },
  {
    id: "AUT-002",
    role: "Depot Manager",
    module: "Organization Management",
    read: true,
    write: true,
    approve: false,
  },
  {
    id: "AUT-003",
    role: "Finance Officer",
    module: "Finance & Wallet",
    read: true,
    write: true,
    approve: true,
  },
  {
    id: "AUT-004",
    role: "Route Planner",
    module: "Routes & Schedule",
    read: true,
    write: true,
    approve: false,
  },
];

function Permission({ value }: { value: boolean }) {
  return (
    <span style={{ color: value ? T.green : T.textFaint, fontWeight: 700 }}>
      {value ? "Yes" : "No"}
    </span>
  );
}

export default function Authorization() {
  return (
    <Card
      title="Role permissions"
      action={
        <button className="stc-btn stc-btn-primary">
          <ShieldCheck size={14} /> Save changes
        </button>
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Role</Th>
            <Th>Module</Th>
            <Th>Read</Th>
            <Th>Write</Th>
            <Th>Approve</Th>
          </tr>
        </thead>
        <tbody>
          {authorizations.map((authorization) => (
            <tr className="stc-row" key={authorization.id}>
              <Td>
                <strong>{authorization.role}</strong>
              </Td>
              <Td>{authorization.module}</Td>
              <Td>
                <Permission value={authorization.read} />
              </Td>
              <Td>
                <Permission value={authorization.write} />
              </Td>
              <Td>
                <Permission value={authorization.approve} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
