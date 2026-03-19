"use client";

/**
 * FabricEditorPro.jsx
 * - recto/verso
 * - undo/redo snapshot stack (diff-based by snapshot)
 * - layer naming + selection
 * - alignment helpers
 * - export multi-res (72/300) -> sends to backend to produce PDF with bleed
 * - autosave with indicator + conflict handling (version timestamps)
 * - template gallery insertion by URL
 *
 * Props:
 *  - orderId (string) required
 *  - initialFrontJson, initialBackJson (object|null)
 *  - width, height
 */

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import debounce from "lodash.debounce";
import api from "../lib/api";
import WebFont from "webfontloader";

export default function FabricEditorPro({
  orderId,
  initialFrontJson = null,
  initialBackJson = null,
  width = 800,
  height = 500
}) {
  const canvasRef = useRef(null);
  const canvasBackRef = useRef(null);
  const fabricFront = useRef(null);
  const fabricBack = useRef(null);
  const [side, setSide] = useState("front");
  const [savingState, setSavingState] = useState({ busy: false, lastSaved: null, progress: 0 });
  const [history, setHistory] = useState({ front: [], back: [] });
  const historyIndex = useRef({ front: -1, back: -1 });
  const [templates, setTemplates] = useState([]);
  const [conflict, setConflict] = useState(null); // { server, local }
  const [fontsLoaded, setFontsLoaded] = useState([]);

  // init
  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, { width, height, preserveObjectStacking: true });
    const b = new fabric.Canvas(canvasBackRef.current, { width, height, preserveObjectStacking: true });
    fabricFront.current = c;
    fabricBack.current = b;

    // load initial
    if (initialFrontJson) try { c.loadFromJSON(initialFrontJson, c.renderAll.bind(c)); } catch(e){}
    if (initialBackJson) try { b.loadFromJSON(initialBackJson, b.renderAll.bind(b)); } catch(e){}

    // push initial snapshots
    pushSnapshot("front");
    pushSnapshot("back");

    // events => autosave + push snapshot
    const onChange = debounce((ev, which) => {
      pushSnapshot(which);
      scheduleAutosave();
    }, 300);

    c.on("object:added", () => onChange(null, "front"));
    c.on("object:modified", () => onChange(null, "front"));
    c.on("object:removed", () => onChange(null, "front"));
    b.on("object:added", () => onChange(null, "back"));
    b.on("object:modified", () => onChange(null, "back"));
    b.on("object:removed", () => onChange(null, "back"));

    // snapping to grid if desired - basic implementation
    c.on("object:moving", (e) => snapObject(e.target));
    b.on("object:moving", (e) => snapObject(e.target));

    // load templates list
    loadTemplates();

    return () => {
      c.dispose();
      b.dispose();
      fabricFront.current = null;
      fabricBack.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCanvas = (which = side) => which === "front" ? fabricFront.current : fabricBack.current;

  // ========== History / undo-redo (snapshot stack) ==========
  function snapshot(which = side) {
    const c = getCanvas(which);
    if (!c) return null;
    // include also metadata for conflict detection
    const json = c.toJSON(["id","selectable"]);
    return json;
  }

  function pushSnapshot(which = side) {
    try {
      const j = snapshot(which);
      setHistory(prev => {
        const arr = prev[which].slice(0, historyIndex.current?.[which] + 1 || 0);
        arr.push(j);
        historyIndex.current = historyIndex.current || {};
        historyIndex.current[which] = arr.length - 1;
        return { ...prev, [which]: arr };
      });
    } catch (err) { console.error("pushSnapshot err", err); }
  }

  function undo(which = side) {
    const idx = historyIndex.current[which];
    if (idx > 0) {
      const newIdx = idx - 1;
      const snap = history[which][newIdx];
      if (snap) {
        const c = getCanvas(which);
        c.loadFromJSON(snap, () => c.renderAll());
        historyIndex.current[which] = newIdx;
      }
    }
  }

  function redo(which = side) {
    const idx = historyIndex.current[which];
    const arr = history[which] || [];
    if (idx < arr.length - 1) {
      const newIdx = idx + 1;
      const snap = arr[newIdx];
      if (snap) {
        const c = getCanvas(which);
        c.loadFromJSON(snap, () => c.renderAll());
        historyIndex.current[which] = newIdx;
      }
    }
  }

  // ========== Layer helpers ==========
  function renameActiveLayer(name) {
    const obj = getCanvas().getActiveObject();
    if (!obj) return;
    obj.set("customName", name);
    getCanvas().renderAll();
  }

  function alignCenter() {
    const canvas = getCanvas();
    canvas.getObjects().forEach(obj => {
      obj.set({ left: (canvas.getWidth() - obj.getScaledWidth())/2 });
    });
    canvas.renderAll();
    pushSnapshot(side);
    scheduleAutosave();
  }

  function alignMiddle() {
    const canvas = getCanvas();
    canvas.getObjects().forEach(obj => {
      obj.set({ top: (canvas.getHeight() - obj.getScaledHeight())/2 });
    });
    canvas.renderAll();
    pushSnapshot(side);
    scheduleAutosave();
  }

  function distributeHorizontally() {
    const canvas = getCanvas();
    const objs = canvas.getObjects().filter(o => !o.excludeFromLayout);
    if (objs.length < 3) return;
    const sorted = objs.slice().sort((a,b) => a.left - b.left);
    const left = sorted[0].left;
    const right = sorted[sorted.length-1].left;
    const space = (right - left) / (sorted.length - 1);
    sorted.forEach((o, i) => o.set({ left: left + i * space }));
    canvas.renderAll();
    pushSnapshot(side);
    scheduleAutosave();
  }

  function makeSameSize() {
    const canvas = getCanvas();
    const objs = canvas.getActiveObjects();
    if (!objs || objs.length < 2) return;
    const base = objs[0];
    objs.slice(1).forEach(o => {
      o.set({ scaleX: base.scaleX, scaleY: base.scaleY, width: base.width, height: base.height });
    });
    canvas.renderAll();
    pushSnapshot(side);
    scheduleAutosave();
  }

  // ========== snapping helper ==========
  function snapObject(obj) {
    if (!obj) return;
    const grid = 8; // configurable
    obj.set({ left: Math.round(obj.left / grid) * grid, top: Math.round(obj.top / grid) * grid });
  }

  // ========== Fonts dynamic ==========
  async function loadFont(family) {
    if (fontsLoaded.includes(family)) return;
    return new Promise((resolve, reject) => {
      WebFont.load({
        google: { families: [family] },
        active: () => {
          setFontsLoaded(prev => [...prev, family]);
          resolve();
        },
        inactive: () => reject(new Error("font failed"))
      });
    });
  }

  async function applyFontToActive(family) {
    await loadFont(family);
    const obj = getCanvas().getActiveObject();
    if (obj && obj.set) {
      obj.set("fontFamily", family);
      getCanvas().renderAll();
      pushSnapshot(side);
      scheduleAutosave();
    }
  }

  // ========== Templates gallery ==========
  async function loadTemplates() {
    try {
      const res = await api.get("/customization/templates");
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.warn("loadTemplates err", err);
    }
  }

  async function insertTemplate(url) {
    try {
      fabric.Image.fromURL(url, (img) => {
        img.set({ left: 40, top: 40, scaleX: Math.min(400 / img.width, 1), scaleY: Math.min(400 / img.height, 1) });
        getCanvas().add(img);
        getCanvas().renderAll();
        pushSnapshot(side);
        scheduleAutosave();
      }, { crossOrigin: "anonymous" });
    } catch (err) { console.error(err); }
  }

  // ========== Export multi-res / pdf ==========
  // generate base64 image with multiplier
  function exportImageBase64(which = "front", multiplier = 1) {
    const c = (which === "front" ? fabricFront.current : fabricBack.current);
    if (!c) return null;
    const data = c.toDataURL({ format: "png", multiplier });
    return data;
  }

  // request backend to generate PDF print-ready
  async function exportPdfPrintReady({ dpi = 300, bleedMm = 3, pages = ["front"] } = {}) {
    // convert bleed mm to pixels at given dpi: px = (dpi / 25.4) * mm
    const bleedPx = Math.round((dpi / 25.4) * bleedMm);
    // create images at desired resolution (multiplier)
    // multiplier relative to 72dpi baseline -> multiplier = dpi/72
    const multiplier = dpi / 72;
    const payload = {
      orderId,
      dpi,
      bleedMm,
      pages: []
    };
    for (const p of pages) {
      payload.pages.push({
        side: p,
        imageBase64: exportImageBase64(p, multiplier)
      });
    }
    setSavingState(s => ({ ...s, busy: true, progress: 10 }));
    try {
      const res = await api.post(`/customization/${orderId}/export-pdf`, payload, { timeout: 120000 });
      setSavingState(s => ({ ...s, busy: false, progress: 100, lastSaved: new Date().toISOString() }));
      // res.data.filename -> trigger download
      const filename = res.data.filename;
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/download/${filename}`;
    } catch (err) {
      console.error("exportPdf err", err);
      setSavingState(s => ({ ...s, busy: false }));
      throw err;
    }
  }

  // ========== Autosave with version/conflict ==========
  const scheduleAutosave = debounce(async () => {
    await autosave();
  }, 1500);

  async function autosave() {
    if (!orderId) return;
    setSavingState(s => ({ ...s, busy: true, progress: 20 }));
    try {
      // include local updatedAt token to detect conflict
      const localToken = localStorage.getItem(`custom_v_${orderId}`) || null;
      const body = {
        frontJson: JSON.stringify(snapshot("front")),
        backJson: JSON.stringify(snapshot("back")),
        clientToken: localToken
      };
      const res = await api.post(`/customization/${orderId}`, body);
      // backend returns { ok, customization, token }
      if (res.data && res.data.token) {
        localStorage.setItem(`custom_v_${orderId}`, res.data.token);
      }
      setSavingState(s => ({ ...s, busy: false, lastSaved: new Date().toISOString(), progress: 100 }));
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // conflict: backend returns server copy
        setConflict({ server: err.response.data.server, local: { front: snapshot("front"), back: snapshot("back") } });
      } else {
        console.error("autosave error", err);
      }
      setSavingState(s => ({ ...s, busy: false }));
    }
  }

  // conflict resolution UI (simple: override server OR keep server)
  async function resolveConflict(action = "overwrite") {
    // action: "overwrite" (client wins) | "take-server" (server wins)
    if (!conflict) return;
    if (action === "take-server") {
      // load server into canvases
      if (conflict.server.frontData) fabricFront.current.loadFromJSON(JSON.parse(conflict.server.frontData), () => fabricFront.current.renderAll());
      if (conflict.server.backData) fabricBack.current.loadFromJSON(JSON.parse(conflict.server.backData), () => fabricBack.current.renderAll());
      setConflict(null);
    } else {
      // trigger save that includes override flag
      await api.post(`/customization/${orderId}`, {
        frontJson: JSON.stringify(snapshot("front")),
        backJson: JSON.stringify(snapshot("back")),
        force: true
      });
      setConflict(null);
    }
  }

  // ========== UI ==========
  return (
    <div className="fabric-pro">
      <div className="flex items-center gap-3 mb-3">
        <button className="btn" onClick={() => setSide("front")} disabled={side === "front"}>Recto</button>
        <button className="btn" onClick={() => setSide("back")} disabled={side === "back"}>Verso</button>

        <div className="ml-4 flex gap-2">
          <button className="btn" onClick={() => undo(side)}>Undo</button>
          <button className="btn" onClick={() => redo(side)}>Redo</button>
          <button className="btn" onClick={() => alignCenter()}>Align center</button>
          <button className="btn" onClick={() => alignMiddle()}>Align middle</button>
          <button className="btn" onClick={() => distributeHorizontally()}>Distribute</button>
          <button className="btn" onClick={() => makeSameSize()}>Same size</button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div>
            {savingState.busy ? <span className="text-sm text-yellow-600">Saving… {savingState.progress}%</span> :
            <span className="text-sm text-green-600">Saved {savingState.lastSaved ? new Date(savingState.lastSaved).toLocaleTimeString() : ""}</span>}
          </div>
          <button className="btn" onClick={() => exportPdfPrintReady({ dpi: 300, bleedMm: 3, pages: ["front","back"] })}>Export PDF (print)</button>
        </div>
      </div>

      {conflict && (
        <div className="bg-red-100 p-3 mb-2 rounded">
          <strong>Conflit détecté :</strong> la version serveur est plus récente.
          <div className="mt-2">
            <button className="btn" onClick={() => resolveConflict("take-server")}>Prendre version serveur</button>
            <button className="btn" onClick={() => resolveConflict("overwrite")}>Écraser serveur (forcer)</button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div style={{ border: "1px solid #e6e6e6" }}>
          <canvas ref={canvasRef} style={{ display: side === "front" ? "block" : "none", width, height }} />
          <canvas ref={canvasBackRef} style={{ display: side === "back" ? "block" : "none", width, height }} />
        </div>

        <div style={{ width: 280 }}>
          <div className="card p-3">
            <h4 className="font-semibold mb-2">Templates</h4>
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <img src={`${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/uploads/templates/${t.filename}`} className="w-16 h-16 object-cover" />
                  <div>
                    <div>{t.name}</div>
                    <div className="text-xs text-muted">{t.description}</div>
                    <div className="mt-1">
                      <button className="btn" onClick={() => insertTemplate(`${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/uploads/templates/${t.filename}`)}>Insert</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <input placeholder="Google Font (e.g. Roboto)" className="w-full border p-2 rounded" onKeyDown={e => { if (e.key === 'Enter') applyFontToActive(e.target.value); }} />
              <div className="mt-2">
                <label className="block text-sm">Upload image template</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files[0];
                  const fd = new FormData();
                  fd.append("image", f);
                  const r = await api.post(`/customization/templates/upload`, fd, { headers: { "Content-Type": "multipart/form-data" }});
                  loadTemplates();
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
