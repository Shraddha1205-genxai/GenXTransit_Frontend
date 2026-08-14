import React, { useState } from "react";
import { FileText, LifeBuoy, ChevronsUpDown } from "lucide-react";
import { T } from "../../../constants/theme";
import { Card, SectionHeader } from "../../../components/common";

export interface FaqItem {
  q: string;
  a: string;
}

interface HelpProps {
  faqs: FaqItem[];
}

export function Help({ faqs }: HelpProps) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <SectionHeader eyebrow="User guidance" title="Help & support" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: T.amberFill, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={17} color={T.amberDeep} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>User manual</div>
              <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Module-by-module guide covering every screen in this console.</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: T.blueFill, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LifeBuoy size={17} color={T.blue} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Raise a support ticket</div>
              <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Reach the helpdesk for account, access, or data issues.</div>
            </div>
          </div>
        </Card>
      </div>
      <Card title="Frequently asked questions">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((f: FaqItem, i: number) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "12px 2px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{f.q}</span>
                <ChevronsUpDown size={14} color={T.textFaint} style={{ flexShrink: 0 }} />
              </button>
              {open === i && <div style={{ fontSize: 13, color: T.textSoft, padding: "0 2px 14px", lineHeight: 1.55 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Help;
