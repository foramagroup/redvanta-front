"use client";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function CustomizerCanvas() {
  const containerRef = useRef();

  useEffect(() => {
    const canvasEl = document.createElement("canvas");
    canvasEl.id = "fabric-canvas";
    canvasEl.width = 600;
    canvasEl.height = 350;
    containerRef.current.appendChild(canvasEl);

    const canvas = new fabric.Canvas("fabric-canvas", { backgroundColor: "#fff" });

    const text = new fabric.Textbox("Ton nom ici", { left: 50, top: 50, width: 300, fontSize: 24 });
    canvas.add(text);

    const rect = new fabric.Rect({ left: 20, top: 20, width: 560, height: 310, fill: "transparent", stroke: "#eee" });
    canvas.sendToBack(rect);

    return () => {
      canvas.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="border rounded p-2 bg-white" />;
}
