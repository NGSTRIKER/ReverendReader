import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "node_modules", "onnxruntime-web", "dist");
const destDir = path.join(root, "public", "tts", "ort");

const FILES = [
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.jsep.mjs",
  "ort-wasm-simd-threaded.jsep.wasm",
];

if (!fs.existsSync(srcDir)) {
  console.warn("onnxruntime-web not installed yet; skipping ORT wasm copy.");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
for (const file of FILES) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
