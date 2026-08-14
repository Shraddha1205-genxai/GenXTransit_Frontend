import React from "react";
import { Ticket, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, KpiCard, SectionHeader, Table } from "../../../components/common";

export interface TicketRecord {
  ref: string;
  trip: string;
  channel: string;
  passenger: string;
  fare: number;
  status: string;
}

interface TicketingProps {
  tickets: TicketRecord[];
}

export function Ticketing({ tickets }: TicketingProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_TICKET · TBL_TRANS_TICKET_PAYMENT" title="Ticketing" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Tickets today" value="9,842" icon={Ticket} />
        <KpiCard label="Confirmed" value="9,201" icon={CheckCircle2} tone="green" />
        <KpiCard label="Cancelled / refunded" value="512" icon={XCircle} tone="red" />
        <KpiCard label="Voided (audit)" value="14" icon={AlertTriangle} tone="amber" />
      </div>
      <Card title="Recent tickets">
        <Table>
          <thead>
            <tr>
              <Th>Booking ref</Th>
              <Th>Trip</Th>
              <Th>Channel</Th>
              <Th>Passenger</Th>
              <Th align="right">Fare</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t: TicketRecord) => (
              <tr key={t.ref} className="stc-row">
                <Td mono><RouteChip>{t.ref}</RouteChip></Td>
                <Td mono>{t.trip}</Td>
                <Td>{t.channel}</Td>
                <Td>{t.passenger}</Td>
                <Td align="right" mono>₹{t.fare}</Td>
                <Td><StatusBadge status={t.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Ticketing;
