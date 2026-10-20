import { COLORS, GESTURE_LABELS } from "./config.js";
import { state } from "./state.js";

const $ = (id) => document.getElementById(id);

export function setGestureChip(gesture) {
  const chip = $("gesture");
  chip.textContent = GESTURE_LABELS[gesture];
  chip.dataset.mode = gesture;
}

export function setFps(fps) {
  $("fps").textContent = `${fps} fps`;
}

export function hideGate() {
  $("gate").classList.add("off");
}

export function bindToolbar({ ink, video }) {
  const swatches = $("swatches");
  const chip = $("gesture");
  chip.style.setProperty("--brush", state.color);

  COLORS.forEach((color, i) => {
    const btn = document.createElement("button");
    btn.className = "swatch";
    btn.style.setProperty("--c", color);
    btn.setAttribute("aria-label", `Color ${color}`);
    btn.setAttribute("aria-pressed", String(i === 0));
    btn.onclick = () => {
      state.color = color;
      chip.style.setProperty("--brush", color);
      swatches.querySelectorAll(".swatch").forEach((s) =>
        s.setAttribute("aria-pressed", String(s === btn)));
    };
    swatches.append(btn);
  });

  const bindToggle = (id, key) => {
    const el = $(id);
    el.onclick = () => {
      state[key] = !state[key];
      el.setAttribute("aria-pressed", String(state[key]));
    };
  };
  bindToggle("glow", "glow");
  bindToggle("skeleton", "skeleton");

  $("cam").onclick = (e) => {
    const hidden = video.classList.toggle("hidden");
    e.currentTarget.setAttribute("aria-pressed", String(!hidden));
  };
  $("size").oninput = (e) => { state.size = Number(e.target.value); };
  $("undo").onclick = () => ink.undo();
  $("clear").onclick = () => ink.clear();
  $("save").onclick = () => ink.save();

  addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      ink.undo();
    }
  });
}

export function bindStart(onStart) {
  const btn = $("start");
  const err = $("err");
  btn.onclick = async () => {
    btn.disabled = true;
    err.textContent = "";
    btn.textContent = "Loading model...";
    try {
      await onStart();
    } catch (ex) {
      btn.disabled = false;
      btn.textContent = "Try again";
      err.textContent =
        ex.name === "NotAllowedError" ? "Camera access was blocked. Allow it in your browser settings and try again."
        : ex.name === "NotFoundError" ? "No camera found. Connect one and try again."
        : `Could not start: ${ex.message}`;
    }
  };
}
