import React from "react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, SectionHeader } from "../../../components/common";

export interface ComplaintRecord {
  id: string;
  category: string;
  trip: string;
  sla: string;
  status: string;
}

interface ComplaintsAlertsProps {
  complaints: ComplaintRecord[];
}

export function ComplaintsAlerts({ complaints }: ComplaintsAlertsProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_COMPLAINT · TBL_TRANS_SOS_ALERT" title="Complaints & support" />
      <Card title="Open complaints">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Category</Th>
              <Th>Trip</Th>
              <Th>SLA</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c: ComplaintRecord) => (
              <tr key={c.id} className="stc-row">
                <Td mono><RouteChip>{c.id}</RouteChip></Td>
                <Td>{c.category}</Td>
                <Td mono>{c.trip}</Td>
                <Td style={{ color: c.sla === "Overdue" ? T.red : T.textSoft }}>{c.sla}</Td>
                <Td><StatusBadge status={c.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default ComplaintsAlerts;
