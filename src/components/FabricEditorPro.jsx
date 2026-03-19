"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { HistoryStack } from "@/lib/fabric/history"; // path mapping below
import { exportPNG } from "@/lib/fabric/export"; // small helper if present
import debounce from "lodash.debounce";
import api from "@/lib/api";

export default function FabricEditorPro({ orderId, initialFrontJson = null, initialBackJson = null, width = 900, height = 540 }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const canvasFront = useRef(null);
  const canvasBack = useRef(null);
  const historyFront = useRef(null);
  const historyBack = useRef(null);
  const [side, setSide] = useState("front");

  useEffect(() => {
    canvasFront.current = new fabric.Canvas(frontRef.current, { width, height, preserveObjectStacking: true });
    canvasBack.current = new fabric.Canvas(backRef.current, { width, height, preserveObjectStacking: true });

    // load initial JSON if provided
    if (initialFrontJson) try { canvasFront.current.loadFromJSON(initialFrontJson, () => canvasFront.current.renderAll()); } catch(e){}
    if (initialBackJson) try { canvasBack.current.loadFromJSON(initialBackJson, () => canvasBack.current.renderAll()); } catch(e){}

    historyFront.current = new HistoryStack(canvasFront.current);
    historyBack.current = new HistoryStack(canvasBack.current);

    // events -> save snapshots
    const saveDebounced = debounce(() => {
      historyFront.current.save();
      historyBack.current.save();
      // autosave
      triggerAutosave();
    }, 700);

    const attachEvents = (c) => {
      c.on("object:added", saveDebounced);
      c.on("object:modified", saveDebounced);
      c.on("object:removed", saveDebounced);
    };
    attachEvents(canvasFront.current);
    attachEvents(canvasBack.current);

    // global window events (from UI panels)
    const insertListener = (e) => {
      const url = e.detail?.url;
      if (!url) return;
      fabric.Image.fromURL(url, (img) => {
        img.set({ left: 40, top: 40, scaleX: Math.min(400 / img.width, 1), scaleY: Math.min(400 / img.height, 1) });
        getActiveCanvas().add(img);
        getActiveCanvas().renderAll();
      }, { crossOrigin: "anonymous" });
    };
    window.addEventListener("insert-template", insertListener);

    window.addEventListener("align:center", () => alignCenter());
    window.addEventListener("align:middle", () => alignMiddle());
    window.addEventListener("align:left", () => alignLeft());
    window.addEventListener("align:right", () => alignRight());
    window.addEventListener("distribute:hor", () => distributeHorizontally());

    window.addEventListener("history:undo", () => doUndo());
    window.addEventListener("history:redo", () => doRedo());

    window.addEventListener("layer:rename", (e) => {
      const id = e.detail?.id;
      const newName = prompt("Nouveau nom de calque");
      if (!newName) return;
      const obj = canvasFront.current.getObjects().find(o => (o.id === id));
      if (obj) { obj.layerName = newName; canvasFront.current.renderAll(); }
    });

    window.addEventListener("request:export-images", async (e) => {
      const dpi = e.detail?.dpi || 300;
      const mult = dpi / 72;
      const frontImage = canvasFront.current.toDataURL({ format: "png", multiplier: mult });
      const backImage = canvasBack.current.toDataURL({ format: "png", multiplier: mult });
      window.dispatchEvent(new CustomEvent("editor:export-images", { detail: [ { side: "front", imageBase64: frontImage }, { side: "back", imageBase64: backImage } ] }));
    });

    return () => {
      window.removeEventListener("insert-template", insertListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getActiveCanvas = () => (side === "front" ? canvasFront.current : canvasBack.current);

  // Alignment helpers
  function alignCenter() {
    const c = getActiveCanvas();
    const obj = c.getActiveObject();
    if (!obj) return;
    obj.set({ left: (c.getWidth() - obj.getScaledWidth()) / 2 });
    obj.setCoords();
    c.renderAll();
  }
  function alignMiddle() {
    const c = getActiveCanvas();
    const obj = c.getActiveObject();
    if (!obj) return;
    obj.set({ top: (c.getHeight() - obj.getScaledHeight()) / 2 });
    obj.setCoords();
    c.renderAll();
  }
  function alignLeft() {
    const c = getActiveCanvas();
    const obj = c.getActiveObject();
    if (!obj) return;
    obj.set({ left: 0 });
    obj.setCoords();
    c.renderAll();
  }
  function alignRight() {
    const c = getActiveCanvas();
    const obj = c.getActiveObject();
    if (!obj) return;
    obj.set({ left: c.getWidth() - obj.getScaledWidth() });
    obj.setCoords();
    c.renderAll();
  }
  function distributeHorizontally() {
    const c = getActiveCanvas();
    const objs = c.getObjects();
    if (objs.length < 3) return;
    const sorted = objs.slice().sort((a,b) => a.left - b.left);
    const left = sorted[0].left;
    const right = sorted[sorted.length - 1].left;
    const step = (right - left) / (sorted.length - 1);
    sorted.forEach((o,i)=>o.set({ left: left + i*step }));
    getActiveCanvas().renderAll();
  }

  // Undo/Redo
  function doUndo() {
    if (side === "front") historyFront.current.undo(); else historyBack.current.undo();
  }
  function doRedo() {
    if (side === "front") historyFront.current.redo(); else historyBack.current.redo();
  }

  // Autosave : ask current snapshots then send to backend
  const triggerAutosave = debounce(async () => {
    if (!orderId) return;
    try {
      const frontJson = JSON.stringify(canvasFront.current.toJSON(["id","layerName"]));
      const backJson = JSON.stringify(canvasBack.current.toJSON(["id","layerName"]));
      const frontImage = canvasFront.current.toDataURL();
      const backImage = canvasBack.current.toDataURL();
      await api.post(`/customization/${orderId}`, { frontJson, backJson, frontImageBase64: frontImage, backImageBase64: backImage });
      // you can set toast or status
    } catch (err) { console.error("autosave", err); }
  }, 1500);

  // expose some methods for panels via window events (already wired above)

  return (
    <div>
      <div className="flex gap-3 mb-3">
        <button className="btn" onClick={() => setSide("front")} disabled={side === "front"}>Recto</button>
        <button className="btn" onClick={() => setSide("back")} disabled={side === "back"}>Verso</button>
      </div>

      <div className="flex gap-4">
        <div className="border p-2">
          <canvas ref={frontRef} style={{ display: side === "front" ? "block" : "none", width: 900, height: 540 }} />
          <canvas ref={backRef} style={{ display: side === "back" ? "block" : "none", width: 900, height: 540 }} />
        </div>

        <div className="w-80 space-y-3">
          <div className="card p-3">
            <h4 className="font-semibold">Actions rapides</h4>
            <div className="flex gap-2 mt-2">
              <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("history:undo"))}>Undo</button>
              <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("history:redo"))}>Redo</button>
              <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("align:center"))}>Center</button>
              <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("distribute:hor"))}>Distrib</button>
            </div>
          </div>

          <div className="card p-3">
            <h4 className="font-semibold">Calques</h4>
            <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("layers:refresh"))}>Refresh</button>
          </div>

          <div className="card p-3">
            <h4 className="font-semibold">Export</h4>
            <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("request:export-images", { detail: { dpi: 300 } }))}>Préparer images (300dpi)</button>
            <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("request:export-images", { detail: { dpi: 72 } }))}>Préparer images (72dpi)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
