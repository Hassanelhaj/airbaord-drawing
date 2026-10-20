const MP_VERSION = "0.10.14"; // keep in sync with package.json

// Swap these for local paths (e.g. "/wasm", "/models/hand_landmarker.task") to self-host.
export const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
export const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export const CFG = {
  pinchRatio: 0.28,   // thumb-index distance / palm size
  extendRatio: 1.08,  // tip-to-wrist vs pip-to-wrist distance
  commitFrames: 3,    // frames a gesture must persist before switching
  clearHoldMs: 900,
  lostGraceMs: 150,
  maxUndo: 8,
  eraseScale: 3,
};

export const COLORS = ["#ff5d73", "#ffc857", "#5eead4", "#7aa2ff", "#f4f4f5"];

export const GESTURE_LABELS = {
  draw: "Drawing", erase: "Erasing", pause: "Paused",
  clear: "Hold to clear", idle: "Hand ready", none: "No hand",
};
