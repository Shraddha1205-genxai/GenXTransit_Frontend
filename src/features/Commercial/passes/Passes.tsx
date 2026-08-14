import React from "react";
import { Armchair, Clock, AlertTriangle, XCircle } from "lucide-react";
import { Card, RouteChip, StatusBadge, Th, Td, KpiCard, SectionHeader, Table } from "../../../components/common";

export interface PassRecord {
  number: string;
  type: string;
  holder: string;
  validTo: string;
  status: string;
}

interface PassesProps {
  passes: PassRecord[];
}

export function Passes({ passes }: PassesProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_PASSENGER_PASS" title="Pass management" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Active passes" value="24,610" icon={Armchair} tone="green" />
        <KpiCard label="Pending verification" value="188" icon={Clock} tone="amber" />
        <KpiCard label="Expiring ≤7 days" value="742" icon={AlertTriangle} tone="amber" />
        <KpiCard label="Expired (unrenewed)" value="1,205" icon={XCircle} tone="red" />
      </div>
      <Card title="Passenger passes">
        <Table>
          <thead>
            <tr>
              <Th>Pass no.</Th>
              <Th>Type</Th>
              <Th>Holder</Th>
              <Th>Valid to</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {passes.map((p: PassRecord) => (
              <tr key={p.number} className="stc-row">
                <Td mono><RouteChip>{p.number}</RouteChip></Td>
                <Td>{p.type}</Td>
                <Td>{p.holder}</Td>
                <Td>{p.validTo}</Td>
                <Td><StatusBadge status={p.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Passes;
