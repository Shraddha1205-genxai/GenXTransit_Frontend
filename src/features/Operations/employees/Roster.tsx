import React from "react";
import { Card, Th, Td, StatusBadge, Table } from "../../../components/common";

export interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  depot: string;
  shift: string;
  status: string;
}

interface RosterProps {
  data: EmployeeRecord[];
}

export function Roster({ data }: RosterProps) {
  return (
    <Card title="Employee roster">
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Role</Th>
            <Th>Depot</Th>
            <Th>Shift</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((e: EmployeeRecord) => (
            <tr key={e.id} className="stc-row">
              <Td mono>{e.id}</Td>
              <Td>{e.name}</Td>
              <Td>{e.role}</Td>
              <Td mono>{e.depot}</Td>
              <Td>{e.shift}</Td>
              <Td>
                <StatusBadge status={e.status === "On duty" ? "Active" : e.status === "On leave" ? "Pending verification" : "Cancelled"} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

export default Roster;
