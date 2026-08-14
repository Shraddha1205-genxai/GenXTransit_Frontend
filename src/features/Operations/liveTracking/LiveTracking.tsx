import React from "react";
import { MapPin } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, SectionHeader } from "../../../components/common";

export interface LiveBusRecord {
  vehicle: string;
  route: string;
  speed: number;
  nextStop: string;
  eta: string;
  delay: string;
}

interface LiveTrackingProps {
  liveBuses: LiveBusRecord[];
}

export function LiveTracking({ liveBuses }: LiveTrackingProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_TRANS_GPS_LOCATION_PING" title="Live tracking" />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
        <Card title="Network map (simplified)">
          <div style={{ position: "relative", height: 340, background: T.grayFill, borderRadius: 4, overflow: "hidden" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 340">
              <path d="M20,300 C100,260 140,120 220,90 S360,40 380,20" fill="none" stroke={T.border} strokeWidth="4" />
              <path d="M40,40 C90,90 120,180 200,200 S320,260 370,300" fill="none" stroke={T.border} strokeWidth="4" />
              {liveBuses.map((b: LiveBusRecord, i: number) => {
                const pts = [[90, 250], [230, 90], [130, 150], [300, 250]];
                const [x, y] = pts[i % pts.length];
                return (
                  <g key={b.vehicle}>
                    <circle cx={x} cy={y} r="7" fill={b.delay.startsWith("+") ? T.red : T.green} opacity="0.85" />
                    <circle cx={x} cy={y} r="12" fill="none" stroke={b.delay.startsWith("+") ? T.red : T.green} strokeWidth="1.5" opacity="0.4" />
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>
        <Card title="Buses in motion">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {liveBuses.map((b: LiveBusRecord) => (
              <div key={b.vehicle} style={{ padding: 10, border: `1px solid ${T.border}`, borderRadius: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <RouteChip>{b.vehicle}</RouteChip>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.delay.startsWith("+") ? T.red : b.delay.startsWith("-") ? T.blue : T.green }}>{b.delay}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.textSoft }}>
                  <span><MapPin size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{b.nextStop}</span>
                  <span>ETA {b.eta}</span>
                  <span>{b.speed} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LiveTracking;
