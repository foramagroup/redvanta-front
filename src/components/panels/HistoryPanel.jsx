"use client";

import React from "react";

export default function HistoryPanel() {
  return (
    <div className="card p-3">
      <h4 className="font-semibold mb-2">Historique</h4>
      <div className="flex gap-2">
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("history:undo"))}>Undo</button>
        <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("history:redo"))}>Redo</button>
      </div>
    </div>
  );
}
