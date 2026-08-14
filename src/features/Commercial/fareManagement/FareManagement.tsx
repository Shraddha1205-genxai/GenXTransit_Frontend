import React, { useState } from "react";
import { T } from "../../../constants/theme";
import { Card, RouteChip, StatusBadge, Th, Td, SectionHeader, Table } from "../../../components/common";

export interface FarePolicyRecord {
  code: string;
  model: string;
  base: number;
  rate: string;
  route: string;
  status: string;
}

export interface ConcessionRecord {
  name: string;
  discount: string;
  proof: string;
}

interface FareManagementProps {
  farePolicies: FarePolicyRecord[];
  concessions: ConcessionRecord[];
}

export function FareManagement({ farePolicies, concessions }: FareManagementProps) {
  const [dist, setDist] = useState(21);
  const fare = Math.round(10 + dist * 2.5);

  return (
    <div>
      <SectionHeader eyebrow="TBL_MAST_FARE_POLICY · TBL_MAST_CONCESSION_CATEGORY" title="Fare management" />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card title="Fare policies">
          <Table>
            <thead>
              <tr>
                <Th>Policy</Th>
                <Th>Model</Th>
                <Th>Base / rate</Th>
                <Th>Route</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {farePolicies.map((f: FarePolicyRecord) => (
                <tr key={f.code} className="stc-row">
                  <Td mono><RouteChip>{f.code}</RouteChip></Td>
                  <Td>{f.model}</Td>
                  <Td>₹{f.base} base · {f.rate}</Td>
                  <Td mono>{f.route}</Td>
                  <Td><StatusBadge status={f.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Public fare calculator">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: T.textSoft }}>Distance travelled: <b style={{ color: T.text }}>{dist} km</b></label>
              <input type="range" min="1" max="120" step="1" value={dist} onChange={(e) => setDist(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div style={{ background: T.amberFill, borderRadius: 4, padding: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.amberDeep, fontWeight: 500 }}>Estimated fare (PMPML-56, Local)</span>
              <span className="stc-display" style={{ fontSize: 26, fontWeight: 600, color: T.amberDeep }}>₹{fare}</span>
            </div>
          </div>
        </Card>
      </div>
      <Card title="Concession categories">
        <Table>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>Discount</Th>
              <Th>Eligibility proof</Th>
            </tr>
          </thead>
          <tbody>
            {concessions.map((c: ConcessionRecord) => (
              <tr key={c.name} className="stc-row">
                <Td>{c.name}</Td>
                <Td>{c.discount}</Td>
                <Td>{c.proof}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export default FareManagement;
