// Smoke test for the Paradee read-aloud pipeline, run in Node with the same code the browser
// worker uses: node scripts/test-tts.ts ["Some sentence."] [voice]
// Writes .tts-test.wav to the repo root and prints the phonemes and word timings.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as ort from "onnxruntime-web";
import { ParadeeCore } from "../lib/tts/core.ts";
import { encodeWav, SAMPLE_RATE } from "../lib/tts/paradee.ts";

const root = path.resolve(import.meta.dirname, "..");
const base = path.join(root, "public", "tts");
const text =
  process.argv[2] ??
  "Fang Yuan looked at the 3 Gu worms in his hand, and a faint smile appeared on his face.";
const voice = process.argv[3] ?? "af_heart";

ort.env.wasm.numThreads = 1;

const loader = {
  bytes: async (p: string) => new Uint8Array(await readFile(path.join(base, p))),
  json: async <T,>(p: string) => JSON.parse(await readFile(path.join(base, p), "utf8")) as T,
};

const t0 = performance.now();
const core = await ParadeeCore.create(ort, loader);
await core.prepare(voice);
const t1 = performance.now();
console.log(`loaded in ${((t1 - t0) / 1000).toFixed(2)} s`);
console.log("phonemes:", await core.phonemize(text, voice));

const { waveform, words } = await core.synthesize(text, voice);
const t2 = performance.now();
const seconds = waveform.length / SAMPLE_RATE;
console.log(
  `audio ${seconds.toFixed(2)} s made in ${((t2 - t1) / 1000).toFixed(2)} s ` +
    `(${(seconds / ((t2 - t1) / 1000)).toFixed(1)}x real time)`
);
for (const w of words) {
  console.log(`  ${w.start.toFixed(2)}-${w.end.toFixed(2)}  ${text.slice(w.from, w.to)}`);
}
if (!waveform.length || !words.length) throw new Error("no audio or no word timings");

const wav = Buffer.from(await encodeWav(waveform).arrayBuffer());
await writeFile(path.join(root, ".tts-test.wav"), wav);
console.log("wrote .tts-test.wav");
