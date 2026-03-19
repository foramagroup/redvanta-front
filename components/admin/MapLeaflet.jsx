"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapLeaflet({ points = [] }) {
  useEffect(() => {
    const id = "mapid";
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML = "";
    const map = L.map(id).setView([48.8566, 2.3522], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // add markers
    points.forEach(p => {
      L.circleMarker([p.lat, p.lon], { radius: 6 }).addTo(map);
    });

    // fit bounds if points exist
    if (points.length) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { maxZoom: 12 });
    }

    return () => map.remove();
  }, [points]);

  return <div id="mapid" style={{ width: "100%", height: "100%" }} />;
}
