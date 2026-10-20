import "./style.css";
import { CFG } from "./config.js";
import { state } from "./state.js";
import { OneEuro } from "./filter.js";
import { startCamera } from "./camera.js";
import { loadHandLandmarker } from "./tracker.js";
import { classify, createDebouncer } from "./gestures.js";
import { Ink } from "./ink.js";
import { Overlay } from "./overlay.js";
import { bindStart, bindToolbar, hideGate, setFps, setGestureChip } from "./ui.js";

const video = document.getElementById("video");
const ink = new Ink(document.getElementById("ink"));
const overlay = new Overlay(document.getElementById("overlay"));
const filterX = new OneEuro();
const filterY = new OneEuro();
const debouncer = createDebouncer();

let landmarker;
let lastVideoTime = -1;
let frames = 0;
let fpsTimer = performance.now();

function setGesture(gesture) {
  state.gesture = gesture;
  ink.endStroke();
  filterX.reset();
  filterY.reset();
  state.clearStart = performance.now();
  if (gesture !== "clear") state.clearArmed = true;
  setGestureChip(gesture);
}

function tick() {
  schedule();
  if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;

  const now = performance.now();
  const landmarks = landmarker.detectForVideo(video, now).landmarks[0];
  const { videoWidth: w, videoHeight: h } = video;

  if (landmarks) {
    state.lastSeen = now;
    const { gesture, anchor } = classify(landmarks, w, h);
    if (debouncer.push(gesture)) setGesture(debouncer.current);

    state.tip = {
      x: filterX.filter(anchor.x * w, now),
      y: filterY.filter(anchor.y * h, now),
    };

    if (state.gesture === "draw" || state.gesture === "erase") {
      ink.add(state.tip);
    } else if (
      state.gesture === "clear" && state.clearArmed &&
      now - state.clearStart > CFG.clearHoldMs
    ) {
      ink.clear();
      state.clearArmed = false;
    }
  } else if (state.gesture !== "none" && now - state.lastSeen > CFG.lostGraceMs) {
    state.tip = null;
    debouncer.force("none");
    setGesture("none");
  }

  overlay.draw(landmarks, now);

  frames++;
  if (now - fpsTimer >= 1000) {
    setFps(frames);
    frames = 0;
    fpsTimer = now;
  }
}

// Fires once per decoded camera frame, so we never process the same frame twice.
const schedule = () =>
  "requestVideoFrameCallback" in video
    ? video.requestVideoFrameCallback(tick)
    : requestAnimationFrame(tick);

bindToolbar({ ink, video });
bindStart(async () => {
  const [{ width, height }, model] = await Promise.all([startCamera(video), loadHandLandmarker()]);
  landmarker = model;
  ink.resize(width, height);
  overlay.resize(width, height);
  hideGate();
  schedule();
});
