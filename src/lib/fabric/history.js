// src/lib/fabric/history.js

export class HistoryStack {
  constructor(canvas) {
    this.canvas = canvas;
    this.stack = [];
    this.index = -1;
    this.locked = false;

    this.save();
  }

  save() {
    if (this.locked) return;

    const json = this.canvas.toJSON(["id", "layerName"]);
    this.stack = this.stack.slice(0, this.index + 1);

    this.stack.push(JSON.stringify(json));
    this.index = this.stack.length - 1;
  }

  undo() {
    if (this.index <= 0) return;
    this.locked = true;

    this.index--;
    this.canvas.loadFromJSON(this.stack[this.index], () => {
      this.locked = false;
      this.canvas.renderAll();
    });
  }

  redo() {
    if (this.index >= this.stack.length - 1) return;
    this.locked = true;

    this.index++;
    this.canvas.loadFromJSON(this.stack[this.index], () => {
      this.locked = false;
      this.canvas.renderAll();
    });
  }
}
