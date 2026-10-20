import { CFG } from "./config.js";

const dist = (a, b, w, h) => Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);

/**
 * Classify one hand's landmarks. Works in pixel space and is rotation-invariant.
 * Returns { gesture: draw | erase | clear | pause | idle, anchor: {x, y} normalized }.
 */
export function classify(lm, w, h) {
  const palm = dist(lm[0], lm[9], w, h);
  const extended = (tip, pip) =>
    dist(lm[tip], lm[0], w, h) > dist(lm[pip], lm[0], w, h) * CFG.extendRatio;

  const index = extended(8, 6);
  const middle = extended(12, 10);
  const ring = extended(16, 14);
  const pinky = extended(20, 18);
  const pinching = dist(lm[4], lm[8], w, h) < palm * CFG.pinchRatio;

  let gesture = "idle";
  if (pinching) gesture = "erase";
  else if (index && middle && !ring && !pinky) gesture = "clear";
  else if (index && !middle && !ring && !pinky) gesture = "draw";
  else if (!index && !middle && !ring && !pinky) gesture = "pause";

  const anchor = gesture === "erase"
    ? { x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 }
    : lm[8];

  return { gesture, anchor };
}

/** Switch state only after a gesture persists for N consecutive frames. */
export function createDebouncer(frames = CFG.commitFrames) {
  let current = "none", candidate = "none", count = 0;
  return {
    get current() { return current; },
    /** Returns true when the committed gesture changed. */
    push(next) {
      if (next === current) { candidate = next; count = 0; return false; }
      if (next !== candidate) { candidate = next; count = 1; return false; }
      if (++count >= frames) { current = next; count = 0; return true; }
      return false;
    },
    force(next) { current = candidate = next; count = 0; },
  };
}
