"use client";

/**
 * FabricEditorAdvanced.jsx
 * - recto/verso
 * - undo/redo (stack JSON snapshots)
 * - guidelines + snapping (grid)
 * - google fonts dynamic
 * - autosave (debounced)
 *
 * Props:
 *  - orderId (string)  -> required to autosave
 *  - initialFrontJson (object|null)
 *  - initialBackJson (object|null)
 *  - onSaved(jsonFront, jsonBack, filenames) optional callback
 *  - width, height optional
 */

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import debounce from "lodash.debounce";
import WebFont from "webfontloader";
import api from "../lib/api"; // axios wrapper

export default function FabricEditorAdvanced({
  orderId,
  initialFrontJson = null,
  initialBackJson = null,
  width = 800,
  height = 500,
  onSaved = () => {}
}) {
  const canvasRef = useRef(null);
  const canvasBackRef = useRef(null);
  const fabricRef = useRef(null);      // front canvas fabric instance
  const fabricBackRef = useRef(null);  // back canvas fabric instance
  const [side, setSide] = useState("front"); // 'front' | 'back'
  const [historyStack, setHistoryStack] = useState({ front: [], back: [] });
  const historyIndexRef = useRef({ front: -1, back: -1 });
  const [gridSize, setGridSize] = useState(10);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState([]);
  const saveTokenRef = useRef(0);

  // init canvases
  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      preserveObjectStacking: true,
      selection: true
    });
    const b = new fabric.Canvas(canvasBackRef.current, {
      width,
      height,
      preserveObjectStacking: true,
      selection: true
    });

    fabricRef.current = c;
    fabricBackRef.current = b;

    // enable retina scaling
    const ratio = window.devicePixelRatio || 1;
    c.setDimensions({ width: width * ratio, height: height * ratio });
    b.setDimensions({ width: width * ratio, height: height * ratio });
    c.setZoom(ratio);
    b.setZoom(ratio);

    // load initial JSON if present
    if (initialFrontJson) {
      try {
        c.loadFromJSON(initialFrontJson, () => c.renderAll());
      } catch (e) { console.warn(e); }
    }
    if (initialBackJson) {
      try {
        b.loadFromJSON(initialBackJson, () => b.renderAll());
      } catch (e) { console.warn(e); }
    }

    // attach events
    const attachEvents = (canvas, sideKey) => {
      const pushSnapshot = () => {
        try {
          const json = canvas.toJSON(["id", "selectable"]);
          // truncate forward if redo existed
          setHistoryStack(prev => {
            const arr = prev[sideKey].slice(0, historyIndexRef.current[sideKey] + 1);
            arr.push(json);
            historyIndexRef.current[sideKey] = arr.length - 1;
            return { ...prev, [sideKey]: arr };
          });
        } catch (e) { console.error("pushSnapshot", e); }
      };

      // initial push
      pushSnapshot();

      const markDirty = () => {
        // push snapshot on modifications with debounce to avoid spam
        debouncedPush();
      };

      const debouncedPush = debounce(pushSnapshot, 300);
      canvas.on("object:added", markDirty);
      canvas.on("object:modified", markDirty);
      canvas.on("object:removed", markDirty);
      canvas.on("object:moving", (e) => {
        if (snapToGrid) {
          const obj = e.target;
          if (!obj) return;
          obj.set({
            left: Math.round(obj.left / gridSize) * gridSize,
            top: Math.round(obj.top / gridSize) * gridSize
          });
          canvas.renderAll();
        }
      });

      // guidelines drawing on mouse: show center/horizontal/vertical lines
      canvas.on("mouse:move", (opt) => {
        // optionally draw guidelines (we draw simple center lines)
        // You can improve by drawing overlay canvas for guidelines
      });
    };

    attachEvents(c, "front");
    attachEvents(b, "back");

    return () => {
      if (c) c.dispose();
      if (b) b.dispose();
      fabricRef.current = null;
      fabricBackRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to get active canvas object
  const getCanvas = (which = side) => (which === "front" ? fabricRef.current : fabricBackRef.current);

  // UNDO / REDO
  const canUndo = (which = side) => historyIndexRef.current[which] > 0;
  const canRedo = (which = side) => {
    const stack = historyStack[which] || [];
    return historyIndexRef.current[which] < stack.length - 1;
  };

  const undo = (which = side) => {
    const stack = historyStack[which] || [];
    const idx = historyIndexRef.current[which];
    if (idx <= 0) return;
    const newIndex = idx - 1;
    const snap = stack[newIndex];
    historyIndexRef.current[which] = newIndex;
    const canvas = getCanvas(which);
    if (canvas && snap) {
      canvas.loadFromJSON(snap, () => canvas.renderAll());
    }
  };

  const redo = (which = side) => {
    const stack = historyStack[which] || [];
    const idx = historyIndexRef.current[which];
    if (idx >= stack.length - 1) return;
    const newIndex = idx + 1;
    const snap = stack[newIndex];
    historyIndexRef.current[which] = newIndex;
    const canvas = getCanvas(which);
    if (canvas && snap) {
      canvas.loadFromJSON(snap, () => canvas.renderAll());
    }
  };

  // add text
  const addText = (txt = "Texte") => {
    const canvas = getCanvas();
    const t = new fabric.IText(txt, {
      left: 40, top: 40, fill: "#000", fontSize: 24
    });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
  };

  // add rect
  const addRect = () => {
    const canvas = getCanvas();
    const r = new fabric.Rect({ left: 60, top: 60, width: 160, height: 100, fill: "#0ea5a4", rx: 8, ry: 8 });
    canvas.add(r);
    canvas.setActiveObject(r);
    canvas.renderAll();
  };

  // add image from file input
  const addImageFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (img) => {
      img.set({ left: 80, top: 80, scaleX: Math.min(300 / img.width, 1), scaleY: Math.min(300 / img.height, 1) });
      const canvas = getCanvas();
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: "anonymous" });
  };

  // dynamic google fonts loader
  const loadGoogleFont = (family) => {
    if (fontsLoaded.includes(family)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      WebFont.load({
        google: { families: [family] },
        active: () => {
          setFontsLoaded(prev => [...prev, family]);
          resolve();
        },
        inactive: () => reject(new Error("Failed loading font " + family))
      });
    });
  };

  const applyFontToActive = async (family) => {
    try {
      await loadGoogleFont(family);
      const obj = getCanvas().getActiveObject();
      if (obj && obj.set) {
        obj.set("fontFamily", family);
        getCanvas().renderAll();
      }
    } catch (e) { console.error(e); }
  };

  // serialize functions
  const serialize = (which = "front") => {
    const c = getCanvas(which);
    if (!c) return null;
    return c.toJSON(["id", "selectable"]);
  };

  const exportImage = (which = "front") => {
    const c = getCanvas(which);
    if (!c) return null;
    return c.toDataURL({ format: "png", multiplier: 2 });
  };

  // autosave (debounced)
  const autosave = async () => {
    if (!orderId) return;
    setIsSaving(true);
    try {
      const frontJson = serialize("front");
      const backJson = serialize("back");
      const frontImage = exportImage("front");
      const backImage = exportImage("back");
      // send to backend
      const payload = {
        frontJson: JSON.stringify(frontJson),
        backJson: JSON.stringify(backJson),
        frontImageBase64: frontImage,
        backImageBase64: backImage
      };
      const res = await api.post(`/customization/${orderId}`, payload);
      const filenames = res.data?.uploads || [];
      onSaved(frontJson, backJson, filenames);
    } catch (err) {
      console.error("autosave error", err);
    } finally {
      setIsSaving(false);
    }
  };

  // debounce autosave to avoid too frequent requests
  const debouncedAutosave = useRef(debounce(autosave, 2000)).current;

  // trigger autosave when user stops interacting
  useEffect(() => {
    // attach events to both canvases: object:modified / added -> schedule autosave
    const c = fabricRef.current;
    const b = fabricBackRef.current;
    if (!c || !b) return;
    const handler = () => {
      debouncedAutosave();
    };
    c.on("object:modified", handler);
    c.on("object:added", handler);
    c.on("object:removed", handler);
    b.on("object:modified", handler);
    b.on("object:added", handler);
    b.on("object:removed", handler);
    return () => {
      c.off("object:modified", handler);
      c.off("object:added", handler);
      c.off("object:removed", handler);
      b.off("object:modified", handler);
      b.off("object:added", handler);
      b.off("object:removed", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // manual save (returns filenames)
  const handleSave = async ({ downloadAfter = false } = {}) => {
    if (!orderId) throw new Error("orderId required for save");
    setIsSaving(true);
    try {
      const frontJson = serialize("front");
      const backJson = serialize("back");
      const frontImage = exportImage("front");
      const backImage = exportImage("back");
      const body = {
        frontJson: JSON.stringify(frontJson),
        backJson: JSON.stringify(backJson),
        frontImageBase64: frontImage,
        backImageBase64: backImage
      };
      const res = await api.post(`/customization/${orderId}`, body);
      const filenames = res.data?.uploads || [];
      onSaved(frontJson, backJson, filenames);
      if (downloadAfter && filenames && filenames.length > 0) {
        // pick first uploaded file for download
        const filename = filenames[0];
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/,'')}/download/${filename}`;
      }
      return filenames;
    } catch (err) {
      console.error("handleSave", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // helper: set background color or image
  const setBackgroundColor = (which, color) => {
    const c = getCanvas(which);
    c.setBackgroundColor(color, c.renderAll.bind(c));
  };

  // small UI
  return (
    <div className="fabric-editor-advanced">
      <div className="flex gap-3 mb-4">
        <div>
          <button className="btn" onClick={() => setSide("front")} disabled={side === "front"}>Recto</button>
          <button className="btn" onClick={() => setSide("back")} disabled={side === "back"}>Verso</button>
        </div>

        <div className="flex gap-2">
          <button className="btn" onClick={() => addText()}>Texte</button>
          <button className="btn" onClick={() => addRect()}>Rectangle</button>
          <label className="btn cursor-pointer">
            Image
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => addImageFile(e.target.files[0])} />
          </label>
          <input placeholder="Ex: Roboto" className="border p-1 rounded" onKeyDown={async (e) => { if (e.key === 'Enter') { await applyFontToActive(e.target.value); e.target.value = ''; } }} />
        </div>

        <div className="ml-auto flex gap-2">
          <button className="btn" onClick={() => undo(side)} disabled={!canUndo(side)}>Undo</button>
          <button className="btn" onClick={() => redo(side)} disabled={!canRedo(side)}>Redo</button>
          <button className="btn" onClick={() => { debouncedAutosave.cancel(); handleSave({ downloadAfter: false }); }}>Save</button>
          <button className="btn" onClick={() => { debouncedAutosave.cancel(); handleSave({ downloadAfter: true }); }}>Save & Download</button>
        </div>
      </div>

      <div className="flex gap-6">
        <div style={{ border: "1px solid #e6e6e6" }}>
          <canvas ref={canvasRef} style={{ display: side === "front" ? "block" : "none", width, height }} />
          <canvas ref={canvasBackRef} style={{ display: side === "back" ? "block" : "none", width, height }} />
        </div>

        <div style={{ width: 260 }}>
          <div className="card p-3">
            <div className="mb-2">
              <label>Grid Size</label>
              <input type="range" min="2" max="50" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} />
              <div className="text-sm">Snap: <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} /></div>
            </div>

            <div className="mb-2">
              <button className="btn" onClick={() => setBackgroundColor(side, "#ffffff")}>Fond blanc</button>
              <button className="btn" onClick={() => setBackgroundColor(side, "#000000")}>Fond noir</button>
            </div>

            <div>
              <h4 className="font-semibold">Autosave: {isSaving ? "saving…" : "idle"}</h4>
              <small className="text-muted">Les modifications sont sauvegardées automatiquement après quelques secondes d'inactivité.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
