"use client";

import React, { useState } from "react";
import customizationService from "@/services/customizationService";

export default function ExportPanel({ orderId }) {
  const [dpi, setDpi] = useState(300);
  const [bleed, setBleed] = useState(3);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      setBusy(true);
      // trigger event to request images from editor
      // the editor listens and will send base64 images through window event
      const promise = new Promise((resolve) => {
        window.addEventListener("editor:export-images", function cb(e) {
          window.removeEventListener("editor:export-images", cb);
          resolve(e.detail);
        });
      });

      window.dispatchEvent(new CustomEvent("request:export-images", { detail: { dpi } }));
      const images = await promise; // [{ side: 'front', imageBase64 }, ...]
      const res = await customizationService.exportPdf(orderId, { dpi, bleedMm: bleed, pages: images });
      if (res && res.filename) {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/download/${res.filename}`;
      }
    } catch (err) {
      console.error(err);
      alert("Export failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="card p-3">
      <h4 className="font-semibold mb-2">Export</h4>
      <div className="space-y-2">
        <div>
          <label className="block text-sm">DPI</label>
          <select value={dpi} onChange={e=>setDpi(Number(e.target.value))} className="border p-1">
            <option value={72}>72 (web)</option>
            <option value={150}>150 (HD)</option>
            <option value={300}>300 (print)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Bleed (mm)</label>
          <input type="number" value={bleed} onChange={e=>setBleed(Number(e.target.value))} className="border p-1 w-20"/>
        </div>
        <button className="btn w-full" onClick={handleExport} disabled={busy}>{busy ? "Export..." : "Exporter PDF"}</button>
      </div>
    </div>
  );
}
