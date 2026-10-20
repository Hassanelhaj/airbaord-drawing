import { CFG } from "./config.js";
import { state } from "./state.js";
import { HAND_CONNECTIONS } from "./tracker.js";

/** Transient layer: cursor, clear-progress ring, optional hand skeleton. */
export class Overlay {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  draw(landmarks, now) {
    const { ctx, canvas } = this;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    if (!state.tip) return;

    if (state.skeleton && landmarks) this.#skeleton(landmarks, w, h);

    const { x, y } = state.tip;
    ctx.lineWidth = 3;
    ctx.beginPath();

    switch (state.gesture) {
      case "draw":
        ctx.arc(x, y, state.size / 2 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = state.color;
        ctx.stroke();
        break;
      case "erase":
        ctx.arc(x, y, (state.size * CFG.eraseScale) / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff";
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      case "clear": {
        const p = state.clearArmed ? Math.min((now - state.clearStart) / CFG.clearHoldMs, 1) : 1;
        ctx.arc(x, y, 26, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
        ctx.strokeStyle = "#ffc857";
        ctx.lineWidth = 5;
        ctx.stroke();
        break;
      }
      default:
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(232,236,244,.6)";
        ctx.stroke();
    }
  }

  #skeleton(lm, w, h) {
    const { ctx } = this;
    ctx.strokeStyle = "rgba(232,236,244,.35)";
    ctx.lineWidth = 2;
    for (const { start, end } of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(lm[start].x * w, lm[start].y * h);
      ctx.lineTo(lm[end].x * w, lm[end].y * h);
      ctx.stroke();
    }
  }
}
