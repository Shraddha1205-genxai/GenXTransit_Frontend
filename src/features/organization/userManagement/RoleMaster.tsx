import React, { useMemo, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import {
  Card,
  StatusBadge,
  Table,
  TableToolbar,
  Td,
  Th,
} from "../../../components/common";

const roles = [
  {
    id: "ROL-001",
    name: "Super Admin",
    description: "Full access across the platform",
    users: 1,
    status: "Active",
  },
  {
    id: "ROL-002",
    name: "Depot Manager",
    description: "Manages an assigned depot and staff",
    users: 12,
    status: "Active",
  },
  {
    id: "ROL-003",
    name: "Finance Officer",
    description: "Reviews collections and wallet activity",
    users: 4,
    status: "Active",
  },
  {
    id: "ROL-004",
    name: "Route Planner",
    description: "Maintains routes and operating schedules",
    users: 6,
    status: "Inactive",
  },
];

export default function RoleMaster() {
  const [search, setSearch] = useState("");
  const rows = useMemo(
    () =>
      roles.filter((role) =>
        `${role.name} ${role.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <Card
      title="Roles"
      action={
        <button className="stc-btn stc-btn-primary">
          <Plus size={14} /> Add role
        </button>
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles..."
      />
      <Table>
        <thead>
          <tr>
            <Th>Role ID</Th>
            <Th>Role name</Th>
            <Th>Description</Th>
            <Th>Users</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((role) => (
            <tr className="stc-row" key={role.id}>
              <Td mono>{role.id}</Td>
              <Td>
                <strong>{role.name}</strong>
              </Td>
              <Td>{role.description}</Td>
              <Td>{role.users}</Td>
              <Td>
                <StatusBadge status={role.status} />
              </Td>
              <Td align="right">
                <button
                  className="stc-btn stc-btn-ghost"
                  title={`Edit ${role.name}`}
                >
                  <KeyRound size={14} />
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
