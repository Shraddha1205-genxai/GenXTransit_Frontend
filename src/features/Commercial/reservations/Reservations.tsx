import React from "react";
import { Circle } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, SectionHeader, Table } from "../../../components/common";

export interface ReservationRecord {
  pnr: string;
  trip: string;
  passenger: string;
  seat: string;
  boarding: string;
  status: string;
}

export interface SeatMapItem {
  seat: string;
  status: string;
}

export interface BoardingPointRecord {
  name: string;
  time: string;
}

interface ReservationsProps {
  reservations: ReservationRecord[];
  seatMap: SeatMapItem[];
  boardingPoints: BoardingPointRecord[];
}

export function Reservations({ reservations, seatMap, boardingPoints }: ReservationsProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_TRIP_SEAT_INVENTORY · TBL_TRANS_RESERVATION" title="Reservation management" />
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="Reservations">
          <Table>
            <thead>
              <tr>
                <Th>PNR</Th>
                <Th>Trip</Th>
                <Th>Passenger</Th>
                <Th>Seat</Th>
                <Th>Boarding point</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r: ReservationRecord) => (
                <tr key={r.pnr} className="stc-row">
                  <Td mono><RouteChip>{r.pnr}</RouteChip></Td>
                  <Td mono>{r.trip}</Td>
                  <Td>{r.passenger}</Td>
                  <Td mono>{r.seat}</Td>
                  <Td>{r.boarding}</Td>
                  <Td><StatusBadge status={r.status === "Waitlisted" ? "Pending verification" : "Confirmed"} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card title="Seat map · TRP-90215">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
              {seatMap.map((s: SeatMapItem) => {
                const c = s.status === "booked" ? [T.redFill, T.red] : s.status === "held" ? [T.amberFill, T.amberDeep] : [T.greenFill, T.green];
                return (
                  <div key={s.seat} className="stc-mono" style={{ background: c[0], color: c[1], fontSize: 11, fontWeight: 600, textAlign: "center", padding: "6px 0", borderRadius: 3 }}>
                    {s.seat}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: T.textSoft }}>
              <span><Circle size={8} fill={T.green} color={T.green} /> Available</span>
              <span><Circle size={8} fill={T.amberDeep} color={T.amberDeep} /> Held</span>
              <span><Circle size={8} fill={T.red} color={T.red} /> Booked</span>
            </div>
          </Card>
          <Card title="Boarding points · MSRTC-9502">
            <Table>
              <thead>
                <tr>
                  <Th>Point</Th>
                  <Th align="right">Departure</Th>
                </tr>
              </thead>
              <tbody>
                {boardingPoints.map((b: BoardingPointRecord) => (
                  <tr key={b.name} className="stc-row">
                    <Td>{b.name}</Td>
                    <Td align="right" mono>{b.time}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Reservations;
