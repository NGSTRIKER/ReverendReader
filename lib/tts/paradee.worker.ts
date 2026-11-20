import * as ort from "onnxruntime-web";
import { ParadeeCore, type AssetLoader } from "./core";
import { TTS_ASSET_BASE, type WordTiming } from "./paradee";

export type WorkerRequest =
  | { id: number; type: "init"; voice: string }
  | { id: number; type: "prepare"; voice: string }
  | { id: number; type: "synthesize"; text: string; voice: string; speed: number };

export type WorkerResponse =
  | { id: number; ok: true; type: "init" | "prepare" }
  | { id: number; ok: true; type: "synthesize"; waveform: Float32Array; words: WordTiming[] }
  | { id: number; ok: false; error: string };

// Single-threaded WASM avoids needing Cross-Origin-Opener-Policy / SharedArrayBuffer,
// while Paradee-8M still runs many times faster than real time.
ort.env.wasm.wasmPaths = `${TTS_ASSET_BASE}ort/`;
ort.env.wasm.numThreads = 1;

const loader: AssetLoader = {
  async bytes(path: string): Promise<Uint8Array> {
    const res = await fetch(`${TTS_ASSET_BASE}${path}`);
    if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  },
  async json<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${TTS_ASSET_BASE}${path}`);
    if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);
    return (await res.json()) as T;
  },
};

let corePromise: Promise<ParadeeCore> | null = null;

function getCore(): Promise<ParadeeCore> {
  return (corePromise ??= ParadeeCore.create(ort, loader));
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  try {
    if (msg.type === "init") {
      const core = await getCore();
      await core.prepare(msg.voice);
      const res: WorkerResponse = { id: msg.id, ok: true, type: "init" };
      self.postMessage(res);
    } else if (msg.type === "prepare") {
      const core = await getCore();
      await core.prepare(msg.voice);
      const res: WorkerResponse = { id: msg.id, ok: true, type: "prepare" };
      self.postMessage(res);
    } else if (msg.type === "synthesize") {
      const core = await getCore();
      const { waveform, words } = await core.synthesize(msg.text, msg.voice, msg.speed);
      const res: WorkerResponse = {
        id: msg.id,
        ok: true,
        type: "synthesize",
        waveform,
        words,
      };
      self.postMessage(res, { transfer: [waveform.buffer] });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const res: WorkerResponse = { id: msg.id, ok: false, error: message };
    self.postMessage(res);
  }
};
