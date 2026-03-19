// src/lib/fabric/layers.js

export function getLayers(canvas) {
  return canvas.getObjects().map((obj, index) => ({
    id: obj.id || index,
    name: obj.layerName || `Layer ${index + 1}`,
    visible: obj.visible !== false,
    locked: obj.lockMovementX === true,
    index
  }));
}

export function renameLayer(canvas, objectId, newName) {
  const obj = canvas.getObjects().find(o => o.id === objectId);
  if (!obj) return;
  obj.layerName = newName;
  canvas.renderAll();
}

export function toggleVisibility(canvas, objectId) {
  const obj = canvas.getObjects().find(o => o.id === objectId);
  if (!obj) return;
  obj.visible = !obj.visible;
  canvas.renderAll();
}

export function toggleLock(canvas, objectId) {
  const obj = canvas.getObjects().find(o => o.id === objectId);
  if (!obj) return;
  const locked = !obj.lockMovementX;
  obj.lockMovementX = locked;
  obj.lockMovementY = locked;
  obj.lockScalingX = locked;
  obj.lockScalingY = locked;
  obj.lockRotation = locked;
  canvas.renderAll();
}

export function bringForward(canvas, objectId) {
  const obj = canvas.getObjects().find(o => o.id === objectId);
  if (!obj) return;
  canvas.bringForward(obj);
  canvas.renderAll();
}

export function sendBackward(canvas, objectId) {
  const obj = canvas.getObjects().find(o => o.id === objectId);
  if (!obj) return;
  canvas.sendBackwards(obj);
  canvas.renderAll();
}
