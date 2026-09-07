import React from "react";
import { Bus, MapPin, Radio } from "lucide-react";

export default function TransportCanvas() {
  return (
    <section
      className="transport-canvas transport-image-panel"
      aria-label="Live transit operations"
    >
      <img
        className="transport-hero-image"
        src="/transport-depot.jpg"
        alt="City bus at a transport depot"
      />
      <div className="transport-image-shade" />
      <div className="transport-topbar">
        <div className="transport-brand">
          <span className="transport-brand-mark">
            <Bus size={18} />
          </span>
          <span className="stc-display">GenXTransit</span>
        </div>
      </div>

      <div className="transport-heading">
        <p className="transport-eyebrow">URBAN MOBILITY OPERATIONS</p>
        <h1 className="stc-display">
          The city
          <br />
          <em>moves here.</em>
        </h1>
        <p className="transport-lede">
          One intelligent control room for every route, depot and passenger
          moment.
        </p>
      </div>
    </section>
  );
}
