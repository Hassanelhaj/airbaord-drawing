import { COLORS } from "./config.js";

export const state = {
  color: COLORS[0],
  size: 7,
  glow: true,
  skeleton: false,
  gesture: "none",
  tip: null,          // smoothed fingertip in canvas pixels
  lastSeen: 0,
  clearStart: 0,
  clearArmed: true,
};
