# Airboard

Draw in the air with your webcam. Hand tracking runs fully in the browser (MediaPipe HandLandmarker), nothing is uploaded.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
```

The camera needs `localhost` or HTTPS.

## Gestures

| Gesture | Action |
| --- | --- |
| Index finger up | Draw |
| Thumb and index pinch | Erase |
| Fist | Pause |
| Index and middle up, held ~1 s | Clear board |

## Structure

```
src/
  main.js       frame loop and wiring
  config.js     thresholds, colors, model URLs
  state.js      shared app state
  camera.js     getUserMedia
  tracker.js    HandLandmarker setup (GPU, CPU fallback)
  gestures.js   classify() and frame debouncer
  filter.js     One Euro smoothing filter
  ink.js        stroke engine, undo, clear, PNG export
  overlay.js    cursor, clear ring, hand skeleton
  ui.js         toolbar and start screen
```

## Tuning

All thresholds live in `src/config.js`.

- Pinch triggers too easily or not enough: change `pinchRatio`.
- Fingers misread as folded or extended: change `extendRatio`.
- Stray marks when switching gestures: raise `commitFrames`.
- Line feels laggy or jittery: adjust `minCutoff` and `beta` in `src/filter.js`. Higher `beta` means less lag, lower `minCutoff` means less jitter.
- Slow device: lower the capture size in `src/camera.js` to 640x480 and turn off Glow.

## Self-hosting the model

By default the WASM runtime loads from jsDelivr and the model from Google Storage. To go offline, copy `node_modules/@mediapipe/tasks-vision/wasm` to `public/wasm`, download the `.task` file to `public/models/`, and point `WASM_PATH` and `MODEL_URL` in `src/config.js` at those paths.
