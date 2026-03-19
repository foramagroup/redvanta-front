"use client";

import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import api from "@/lib/api";

export default function CustomizePage() {
  const canvasRef = useRef(null);
  const canvasBackRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [canvasBack, setCanvasBack] = useState(null);
  const [isFront, setIsFront] = useState(true);

  useEffect(() => {
    const c = new fabric.Canvas("front-canvas", { width: 600, height: 600 });
    const b = new fabric.Canvas("back-canvas", { width: 600, height: 600 });

    setCanvas(c);
    setCanvasBack(b);
  }, []);

  const addText = () => {
    const text = new fabric.IText("Texte", {
      left: 100,
      top: 100,
      fill: "#000",
    });
    (isFront ? canvas : canvasBack).add(text);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);

    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(300);
      (isFront ? canvas : canvasBack).add(img);
    });
  };

  const saveDesign = async () => {
    const front = canvas.toDataURL();
    const back = canvasBack.toDataURL();

    const res = await api.post("/customization/save", { front, back });

    alert("Design saved !");
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Personnaliser</h1>

      <div className="flex gap-6 mb-6">
        <button
          onClick={() => setIsFront(true)}
          className={`px-4 py-2 rounded-lg ${
            isFront ? "bg-blue-700 text-white" : "bg-gray-200"
          }`}
        >
          Recto
        </button>

        <button
          onClick={() => setIsFront(false)}
          className={`px-4 py-2 rounded-lg ${
            !isFront ? "bg-blue-700 text-white" : "bg-gray-200"
          }`}
        >
          Verso
        </button>
      </div>

      <div className="flex gap-10">
        <div>
          <canvas
            id="front-canvas"
            className={isFront ? "block" : "hidden"}
          ></canvas>
          <canvas
            id="back-canvas"
            className={!isFront ? "block" : "hidden"}
          ></canvas>
        </div>

        <div className="space-y-4">
          <button
            onClick={addText}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Ajouter texte
          </button>

          <input
            type="file"
            onChange={addImage}
            className="w-full border p-2 rounded-lg"
          />

          <button
            onClick={saveDesign}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
