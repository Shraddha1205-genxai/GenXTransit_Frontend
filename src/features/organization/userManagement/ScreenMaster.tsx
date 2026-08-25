import React from "react";
import { Plus } from "lucide-react";
import { Card, StatusBadge, Table, Td, Th } from "../../../components/common";

const screens = [
  {
    id: "SCR-001",
    name: "Organization Management",
    module: "Organization",
    route: "/Organization/organizationManagement",
    status: "Active",
  },
  {
    id: "SCR-002",
    name: "Master Data",
    module: "Organization",
    route: "/Organization/masters",
    status: "Active",
  },
  {
    id: "SCR-003",
    name: "Fleet Register",
    module: "Operations",
    route: "/Operations/fleet/VehicleRegister",
    status: "Active",
  },
  {
    id: "SCR-004",
    name: "Finance & Wallet",
    module: "Systems",
    route: "/Systems/financeWallet/FinanceWallet",
    status: "Active",
  },
];

export default function ScreenMaster() {
  return (
    <Card
      title="Application screens"
      action={
        <button className="stc-btn stc-btn-primary">
          <Plus size={14} /> Add screen
        </button>
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Screen ID</Th>
            <Th>Screen name</Th>
            <Th>Module</Th>
            <Th>Route</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {screens.map((screen) => (
            <tr className="stc-row" key={screen.id}>
              <Td mono>{screen.id}</Td>
              <Td>
                <strong>{screen.name}</strong>
              </Td>
              <Td>{screen.module}</Td>
              <Td mono>{screen.route}</Td>
              <Td>
                <StatusBadge status={screen.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
