import React, { useMemo, useState } from "react";
import { Plus, UserRound } from "lucide-react";
import { T } from "../../../constants/theme";
import {
  Card,
  StatusBadge,
  Table,
  TableToolbar,
  Td,
  Th,
} from "../../../components/common";

const users = [
  {
    id: "USR-001",
    name: "Amit Kulkarni",
    username: "amit.kulkarni",
    role: "Super Admin",
    scope: "All organizations",
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Neha Jadhav",
    username: "neha.jadhav",
    role: "Depot Manager",
    scope: "Pune ST Depot",
    status: "Active",
  },
  {
    id: "USR-003",
    name: "Rohan More",
    username: "rohan.more",
    role: "Finance Officer",
    scope: "BEST Mumbai",
    status: "Active",
  },
  {
    id: "USR-004",
    name: "Priya Sawant",
    username: "priya.sawant",
    role: "Route Planner",
    scope: "PMPML Pune",
    status: "Suspended",
  },
];

export default function UserMaster() {
  const [search, setSearch] = useState("");
  const rows = useMemo(
    () =>
      users.filter((user) =>
        `${user.name} ${user.username} ${user.role}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <Card
      title="Users"
      action={
        <button className="stc-btn stc-btn-primary">
          <Plus size={14} /> Add user
        </button>
      }
    >
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
      />
      <Table>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Username</Th>
            <Th>Role</Th>
            <Th>Scope</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr className="stc-row" key={user.id}>
              <Td>
                <strong>{user.name}</strong>
                <div style={{ color: T.textFaint, fontSize: 11 }}>
                  {user.id}
                </div>
              </Td>
              <Td mono>{user.username}</Td>
              <Td>{user.role}</Td>
              <Td>{user.scope}</Td>
              <Td>
                <StatusBadge status={user.status} />
              </Td>
              <Td align="right">
                <button
                  className="stc-btn stc-btn-ghost"
                  title={`Manage ${user.name}`}
                >
                  <UserRound size={14} />
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
