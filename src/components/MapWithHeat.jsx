"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";
import 'leaflet/dist/leaflet.css';

export default function MapWithHeat({ points = [] }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map-heat", { center: [48.8566, 2.3522], zoom: 5 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);
    }
    const m = mapRef.current;
    // remove existing heat
    if (m.heatLayer) m.removeLayer(m.heatLayer);

    const heatPoints = (points || []).map(p => [p.lat, p.lon, 0.5]);
    const heat = L.heatLayer(heatPoints, { radius: 25 }).addTo(m);
    m.heatLayer = heat;
  }, [points]);

  return <div id="map-heat" style={{ height: "100%", width: "100%" }} />;
}
