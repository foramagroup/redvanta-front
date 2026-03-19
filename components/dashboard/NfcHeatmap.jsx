"use client";

import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function NfcHeatmap({ points = [] }) {
  // points: [{ lat, lng, count }]
  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={4} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p, i) => (
        <CircleMarker key={i} center={[p.lat, p.lng]} radius={Math.min(30, 3 + p.count)} />
      ))}
    </MapContainer>
  );
}
