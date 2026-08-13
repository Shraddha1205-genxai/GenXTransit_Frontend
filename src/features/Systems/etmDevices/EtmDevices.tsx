import React from "react";
import { Wifi, WifiOff, Battery, Printer } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, SectionHeader } from "../../../components/common";

export interface EtmDeviceRecord {
  id: string;
  conductor: string;
  depot: string;
  battery: number;
  connectivity: string;
  printer: string;
  lastSync: string;
}

interface EtmDevicesProps {
  etmDevices: EtmDeviceRecord[];
}

export function EtmDevices({ etmDevices }: EtmDevicesProps) {
  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_ETM_DEVICE · TBL_TRANS_ETM_SHIFT_CLOSURE" title="ETM device fleet" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
        {etmDevices.map((d: EtmDeviceRecord) => (
          <Card key={d.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <RouteChip>{d.id}</RouteChip>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 6 }}>{d.conductor}</div>
                <div style={{ fontSize: 12, color: T.textSoft }}>{d.depot}</div>
              </div>
              {d.connectivity === "online" ? <Wifi size={18} color={T.green} /> : <WifiOff size={18} color={T.red} />}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textSoft, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Battery size={14} color={d.battery < 40 ? T.red : T.green} /> {d.battery}%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Printer size={14} color={d.printer === "ok" ? T.green : T.amberDeep} /> {d.printer === "ok" ? "Ready" : "Low paper"}
              </span>
              <span>Synced {d.lastSync}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default EtmDevices;
