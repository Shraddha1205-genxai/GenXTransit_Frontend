import React from "react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, SectionHeader } from "../../../components/common";

export interface RouteRecord {
  code: string;
  name: string;
  service: string;
  type: string;
  distance: string;
  fareModel: string;
}

export interface TripRecord {
  id: string;
  route: string;
  driver: string;
  conductor: string;
  sched: string;
  actual: string;
  status: string;
}

interface RoutesAndScheduleProps {
  routes: RouteRecord[];
  trips: TripRecord[];
}

export function RoutesAndSchedule({ routes, trips }: RoutesAndScheduleProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ROUTE · TBL_MAST_TIMETABLE · TBL_TRANS_TRIP" title="Routes & schedule" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 12 }}>
        <Card title="Route master">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Route</Th>
                <Th>Service</Th>
                <Th>Type</Th>
                <Th>Distance</Th>
                <Th>Fare model</Th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r: RouteRecord) => (
                <tr key={r.code} className="stc-row">
                  <Td mono>
                    <RouteChip>{r.code}</RouteChip>
                    <div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>{r.name}</div>
                  </Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 3, background: r.service === "ST" ? T.blueFill : T.greenFill, color: r.service === "ST" ? T.blue : T.green }}>
                      {r.service}
                    </span>
                  </Td>
                  <Td>{r.type}</Td>
                  <Td>{r.distance}</Td>
                  <Td>{r.fareModel}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Today's trips">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Trip</Th>
                <Th>Route</Th>
                <Th>Crew</Th>
                <Th>Sched.</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t: TripRecord) => (
                <tr key={t.id} className="stc-row">
                  <Td mono><RouteChip>{t.id}</RouteChip></Td>
                  <Td mono>{t.route}</Td>
                  <Td>{t.driver}<div style={{ fontSize: 11, color: T.textSoft }}>{t.conductor}</div></Td>
                  <Td>{t.sched}<div style={{ fontSize: 11, color: T.textSoft }}>Actual {t.actual}</div></Td>
                  <Td><StatusBadge status={t.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default RoutesAndSchedule;
