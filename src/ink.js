import { CFG } from "./config.js";
import { state } from "./state.js";

/** Persistent drawing layer: smooth strokes, erase, undo, clear, export. */
export class Ink {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.undoStack = [];
    this.last = this.mid = null;
  }

  resize(width, height) {
    this.canvas.width = width;   // resizing resets context state
    this.canvas.height = height;
    this.ctx.lineCap = this.ctx.lineJoin = "round";
  }

  get active() { return this.last !== null; }

  get #erasing() { return state.gesture === "erase"; }
  get #width() { return this.#erasing ? state.size * CFG.eraseScale : state.size; }

  #applyStyle() {
    const { ctx } = this;
    ctx.save();
    ctx.lineWidth = this.#width;
    ctx.strokeStyle = ctx.fillStyle = state.color;
    ctx.globalCompositeOperation = this.#erasing ? "destination-out" : "source-over";
    ctx.shadowColor = state.color;
    ctx.shadowBlur = !this.#erasing && state.glow ? state.size * 2.2 : 0;
  }

  add(p) {
    if (!this.active) return this.#begin(p);

    // Quadratic curve through midpoints keeps joins smooth without redrawing history.
    const m = { x: (this.last.x + p.x) / 2, y: (this.last.y + p.y) / 2 };
    this.#applyStyle();
    this.ctx.beginPath();
    this.ctx.moveTo(this.mid.x, this.mid.y);
    this.ctx.quadraticCurveTo(this.last.x, this.last.y, m.x, m.y);
    this.ctx.stroke();
    this.ctx.restore();
    this.mid = m;
    this.last = p;
  }

  #begin(p) {
    this.#snapshot();
    this.last = this.mid = p;
    this.#applyStyle();
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, this.#width / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  endStroke() { this.last = this.mid = null; }

  #snapshot() {
    const { width, height } = this.canvas;
    this.undoStack.push(this.ctx.getImageData(0, 0, width, height));
    if (this.undoStack.length > CFG.maxUndo) this.undoStack.shift();
  }

  undo() {
    const snap = this.undoStack.pop();
    if (snap) this.ctx.putImageData(snap, 0, 0);
  }

  clear() {
    this.#snapshot();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Download as PNG, flipped to match the mirrored on-screen view. */
  save() {
    const { width, height } = this.canvas;
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const g = out.getContext("2d");
    g.fillStyle = "#0b0e14";
    g.fillRect(0, 0, width, height);
    g.translate(width, 0);
    g.scale(-1, 1);
    g.drawImage(this.canvas, 0, 0);

    const a = document.createElement("a");
    a.download = `airboard-${Date.now()}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  }
}
