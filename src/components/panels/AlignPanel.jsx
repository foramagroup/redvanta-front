"use client";

import React from "react";

export default function AlignPanel() {
  return (
    <div className="card p-3">
      <h4 className="font-semibold mb-2">Align</h4>
      <div className="flex gap-2">
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("align:center"))}>Center</button>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("align:middle"))}>Middle</button>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("align:left"))}>Left</button>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("align:right"))}>Right</button>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("distribute:hor"))}>Distribute</button>
      </div>
    </div>
  );
}
