"use client";

import React, { useEffect, useState } from "react";

export default function LayersPanel({ canvasGetter }) {
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    const refresh = () => {
      const c = canvasGetter();
      if (!c) return;
      setLayers(c.getObjects().map((o, i) => ({ id: o.id || i, name: o.layerName || `Layer ${i+1}` })));
    };
    window.addEventListener("layers:refresh", refresh);
    return () => window.removeEventListener("layers:refresh", refresh);
  }, [canvasGetter]);

  return (
    <div className="card p-3">
      <h4 className="font-semibold mb-2">Calques</h4>
      <ul className="space-y-2">
        {layers.map(l => (
          <li key={l.id} className="flex justify-between items-center">
            <span>{l.name}</span>
            <div className="flex gap-2">
              <button className="btn-xs" onClick={() => window.dispatchEvent(new CustomEvent("layer:rename", { detail: { id: l.id } }))}>Rename</button>
              <button className="btn-xs" onClick={() => window.dispatchEvent(new CustomEvent("layer:toggle", { detail: { id: l.id } }))}>Show/Hide</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
