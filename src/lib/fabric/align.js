// src/lib/fabric/align.js

export function alignCenter(canvas) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set({
    left: (canvas.width - obj.width * obj.scaleX) / 2
  });
  obj.setCoords();
  canvas.renderAll();
}

export function alignMiddle(canvas) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set({
    top: (canvas.height - obj.height * obj.scaleY) / 2
  });
  obj.setCoords();
  canvas.renderAll();
}

export function alignLeft(canvas) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set({ left: 0 });
  obj.setCoords();
  canvas.renderAll();
}

export function alignRight(canvas) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set({ left: canvas.width - obj.width * obj.scaleX });
  obj.setCoords();
  canvas.renderAll();
}
