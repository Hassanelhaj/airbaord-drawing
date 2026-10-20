import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { WASM_PATH, MODEL_URL } from "./config.js";

export const HAND_CONNECTIONS = HandLandmarker.HAND_CONNECTIONS;

export async function loadHandLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  const create = (delegate) =>
    HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });
  try {
    return await create("GPU");
  } catch {
    return create("CPU");
  }
}
