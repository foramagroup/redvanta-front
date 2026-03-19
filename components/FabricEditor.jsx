"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

/**
 * FabricEditor
 * - props:
 *   - initialJson (object) : initial canvas JSON (fabric.toJSON())
 *   - onSave(json, imageBase64) : callback called on save (imageBase64 optional)
 *   - width, height : canvas size
 *   - background (string) : default background color or image url
 *
 * Usage:
 * <FabricEditor initialJson={...} onSave={(json, img)=>...} width={800} height={500} />
 */

export default function FabricEditor({
  initialJson = null,
  width = 800,
  height = 500,
  background = "#ffffff",
  onSave = async () => {},
  allowExportImage = true,
}) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [activeTool, setActiveTool] = useState("select"); // select / text / rect / img
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // init canvas
    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: background,
      preserveObjectStacking: true,
    });

    // enable retina scaling
    const ratio = window.devicePixelRatio || 1;
    fabricRef.current.setZoom(ratio);

    // load initial JSON if present
    if (initialJson) {
      try {
        fabricRef.current.loadFromJSON(initialJson, () => {
          fabricRef.current.renderAll();
        }, function(o, object) {
          // custom reviver if necessary
        });
      } catch (e) {
        console.error("Error loading JSON:", e);
      }
    }

    // mark dirty on change
    const onModified = () => setIsDirty(true);
    fabricRef.current.on("object:added", onModified);
    fabricRef.current.on("object:modified", onModified);
    fabricRef.current.on("object:removed", onModified);

    return () => {
      fabricRef.current.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TOOL ACTIONS
  const setSelectTool = () => {
    setActiveTool("select");
    fabricRef.current.isDrawingMode = false;
  };

  const addText = () => {
    setActiveTool("text");
    const t = new fabric.IText("Nouveau texte", {
      left: 40,
      top: 40,
      fill: selectedColor,
      fontSize,
      editable: true,
    });
    fabricRef.current.add(t).setActiveObject(t);
    fabricRef.current.renderAll();
    setIsDirty(true);
  };

  const addRect = () => {
    setActiveTool("rect");
    const r = new fabric.Rect({
      left: 60,
      top: 60,
      fill: selectedColor,
      width: 120,
      height: 80,
      rx: 8,
      ry: 8,
    });
    fabricRef.current.add(r).setActiveObject(r);
    fabricRef.current.renderAll();
    setIsDirty(true);
  };

  const addImageFromUrl = (url) => {
    setActiveTool("img");
    fabric.Image.fromURL(url, (img) => {
      img.set({
        left: 80,
        top: 80,
        scaleX: Math.min(300 / img.width, 1),
        scaleY: Math.min(300 / img.height, 1),
      });
      fabricRef.current.add(img).setActiveObject(img);
      fabricRef.current.renderAll();
      setIsDirty(true);
    }, { crossOrigin: "anonymous" });
  };

  const uploadImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      addImageFromUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    const obj = fabricRef.current.getActiveObject();
    if (obj) {
      fabricRef.current.remove(obj);
      setIsDirty(true);
    }
  };

  const bringToFront = () => {
    const obj = fabricRef.current.getActiveObject();
    if (obj) {
      obj.bringToFront();
      fabricRef.current.renderAll();
      setIsDirty(true);
    }
  };

  const sendToBack = () => {
    const obj = fabricRef.current.getActiveObject();
    if (obj) {
      obj.sendToBack();
      fabricRef.current.renderAll();
      setIsDirty(true);
    }
  };

  const setObjectColor = (color) => {
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    if (obj.set) {
      if (obj.type === "rect" || obj.type === "circle" || obj.type === "triangle") {
        obj.set("fill", color);
      } else {
        obj.set("fill", color);
      }
      fabricRef.current.renderAll();
      setIsDirty(true);
    }
  };

  const serialize = () => {
    const json = fabricRef.current.toJSON(["selectable", "lockMovementX"]);
    return json;
  };

  const exportImage = (format = "png") => {
    // returns base64 string
    const dataUrl = fabricRef.current.toDataURL({ format, multiplier: 2 });
    return dataUrl;
  };

  const handleSave = async ({ exportImg = true } = {}) => {
    const json = serialize();
    let imageBase64 = null;
    if (exportImg && allowExportImage) {
      imageBase64 = exportImage("png");
    }
    await onSave(json, imageBase64);
    setIsDirty(false);
  };

  // zoom helpers (optional)
  const zoomIn = () => {
    const z = fabricRef.current.getZoom();
    fabricRef.current.setZoom(z + 0.2);
  };
  const zoomOut = () => {
    const z = fabricRef.current.getZoom();
    fabricRef.current.setZoom(Math.max(0.5, z - 0.2));
  };

  // selection style
  useEffect(() => {
    if (!fabricRef.current) return;
    const sel = fabricRef.current.getActiveObject();
    if (sel && sel.set) sel.set({ borderColor: "#4ade80", cornerColor: "#4ade80" });
  }, [fabricRef.current]);

  return (
    <div>
      <div className="mb-4 flex gap-2 items-center">
        <button className="btn" onClick={setSelectTool}>Select</button>
        <button className="btn" onClick={addText}>Add text</button>
        <button className="btn" onClick={addRect}>Add rect</button>
        <label className="btn cursor-pointer">
          Upload image
          <input type="file" accept="image/*" onChange={(e) => uploadImageFile(e.target.files[0])} style={{display:'none'}} />
        </label>
        <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="ml-2" />
        <button className="btn" onClick={() => setObjectColor(selectedColor)}>Apply color</button>

        <button className="btn" onClick={deleteSelected}>Delete</button>
        <button className="btn" onClick={bringToFront}>Bring front</button>
        <button className="btn" onClick={sendToBack}>Send back</button>

        <div className="ml-auto flex gap-2">
          <button className="btn" onClick={zoomOut}>-</button>
          <button className="btn" onClick={zoomIn}>+</button>
          <button className="btn" onClick={() => handleSave({ exportImg: true })}>Save</button>
        </div>
      </div>

      <div style={{ border: "1px solid #e6e6e6", display: "inline-block" }}>
        <canvas ref={canvasRef} width={width} height={height} />
      </div>
    </div>
  );
}
