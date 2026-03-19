// src/lib/fabric/export.js

import { jsPDF } from "jspdf";

export function exportPNG(canvas, dpi = 72) {
  const scale = dpi / 72;

  const dataUrl = canvas.toDataURL({
    format: "png",
    multiplier: scale,
  });

  return dataUrl;
}

export function exportJPG(canvas, dpi = 72) {
  const scale = dpi / 72;

  const dataUrl = canvas.toDataURL({
    format: "jpeg",
    quality: 1,
    multiplier: scale,
  });

  return dataUrl;
}

// PDF haute résolution avec bleed 3mm
export function exportPDF(canvas, dpi = 300) {
  const scale = dpi / 72;
  const bleed = 9; // 3mm ~ 9px @ 72 DPI

  const width = canvas.width * scale + bleed * 2;
  const height = canvas.height * scale + bleed * 2;

  const pdf = new jsPDF({
    orientation: width > height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
  });

  const dataUrl = canvas.toDataURL({
    format: "png",
    multiplier: scale,
  });

  pdf.addImage(dataUrl, "PNG", bleed, bleed, canvas.width * scale, canvas.height * scale);
  return pdf;
}
