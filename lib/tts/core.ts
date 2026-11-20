// Text -> phonemes -> Paradee -> 24 kHz audio, plus when each word is spoken.
//
// English goes through misaki's rules and dictionaries (vendor/misaki-en.js), which is what
// Kokoro and Paradee learned English from, and the words misaki doesn't know go through
// Paradee's own small G2P model (vendor/paradee-g2p.js). No eSpeak (GPL) is involved.
//
// This file has no browser-only code, so it runs in the Web Worker (paradee.worker.ts) and
// in Node for testing (scripts/test-tts.ts).
import type * as Ort from "onnxruntime-web";
import { DURATIONS, withOutput, wordTimes, textWords, phonemeWords } from "./vendor/wordtimes.js";
import { ParadeeG2P } from "./vendor/paradee-g2p.js";
import { MisakiEnglish, englishFallback } from "./vendor/misaki-en.js";
import {
  PARADEE_MODEL_PATH,
  PARADEE_VOICES,
  languageOf,
  tokenize,
  type WordTiming,
} from "./paradee.ts";

export type OrtModule = typeof Ort;

export interface AssetLoader {
  bytes(path: string): Promise<Uint8Array>;
  json<T = unknown>(path: string): Promise<T>;
}

export interface Synthesis {
  waveform: Float32Array;
  words: WordTiming[];
}

type EnglishLang = "en-us" | "en-gb";

export class ParadeeCore {
  private g2p: Promise<ParadeeG2P> | null = null;
  private english: Partial<Record<EnglishLang, Promise<MisakiEnglish>>> = {};
  // onnxruntime-web refuses a second run while one is in flight, so runs go one at a time.
  private queue: Promise<unknown> = Promise.resolve();

  private readonly ort: OrtModule;
  private readonly loader: AssetLoader;
  private readonly session: Ort.InferenceSession;

  private constructor(ort: OrtModule, loader: AssetLoader, session: Ort.InferenceSession) {
    this.ort = ort;
    this.loader = loader;
    this.session = session;
  }

  static async create(ort: OrtModule, loader: AssetLoader): Promise<ParadeeCore> {
    const bytes = await loader.bytes(PARADEE_MODEL_PATH);
    // The per-token durations are inside the graph but not one of its outputs; expose them
    // so the reader can light up the word being spoken.
    const session = await ort.InferenceSession.create(withOutput(bytes, DURATIONS), {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    return new ParadeeCore(ort, loader, session);
  }

  private loadG2P(): Promise<ParadeeG2P> {
    return (this.g2p ??= (async () => {
      const [model, data] = await Promise.all([
        this.loader.bytes("g2p/g2p.onnx"),
        this.loader.json("g2p/g2p.json"),
      ]);
      return ParadeeG2P.create(this.ort, model, data);
    })());
  }

  private loadEnglish(lang: EnglishLang): Promise<MisakiEnglish> {
    return (this.english[lang] ??= (async () => {
      const key = lang === "en-gb" ? "gb" : "us";
      const british = key === "gb";
      const [gold, silver, tags, own] = await Promise.all([
        this.loader.json(`misaki/${key}_gold.json`),
        this.loader.json(`misaki/${key}_silver.json`),
        this.loader.json("g2p/en-tags.json"),
        this.loadG2P(),
      ]);
      const data = { gold, silver };
      // `plain` reads the digits inside words misaki doesn't know.
      const plain = new MisakiEnglish(british, data, tags);
      return new MisakiEnglish(british, data, tags, englishFallback(own, british, plain));
    })());
  }

  /** Loads everything a voice needs, so the first sentence doesn't wait on it. */
  async prepare(voice: string): Promise<void> {
    const lang = languageOf(voice);
    if (lang === "en-us" || lang === "en-gb") await this.loadEnglish(lang);
    else await this.loadG2P();
  }

  async phonemize(text: string, voice: string): Promise<string> {
    const lang = languageOf(voice);
    if (lang === "en-us" || lang === "en-gb") return (await this.loadEnglish(lang)).phonemize(text);
    return (await this.loadG2P()).phonemize(text, lang);
  }

  /** One sentence -> audio, and where each of its words is spoken. */
  synthesize(text: string, voice: string, speed = 1): Promise<Synthesis> {
    const run = this.queue.then(() => this.run(text, voice, speed));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async run(text: string, voice: string, speed: number): Promise<Synthesis> {
    const index = Math.max(0, (PARADEE_VOICES as readonly string[]).indexOf(voice));
    const { ids, kept } = tokenize(await this.phonemize(text, voice));
    const out = await this.session.run({
      input_ids: new this.ort.Tensor("int64", ids, [1, ids.length]),
      speed: new this.ort.Tensor("float32", new Float32Array([speed]), [1]),
      voice: new this.ort.Tensor("int64", BigInt64Array.from([BigInt(index)]), [1]),
    });
    const waveform = Float32Array.from(out.waveform.data as Float32Array);
    const durations = Float32Array.from(out[DURATIONS].data as Float32Array);
    let words: WordTiming[] = [];
    try {
      words = await this.timeWords(text, voice, kept, durations);
    } catch {
      words = [];
    }
    return { waveform, words };
  }

  // Where each word of `text` is spoken, from the frames the model gave every phoneme id.
  private async timeWords(
    text: string,
    voice: string,
    ps: string,
    durations: Float32Array
  ): Promise<WordTiming[]> {
    const words = textWords(text);
    if (!words.length || !ps) return [];
    let counts: number[] = words.map(() => 1);
    let lens: number[] = counts;
    if (phonemeWords(ps).length !== words.length) {
      // A word can be read as several ("1,000", "U.S.A.") or merged with the next, so
      // phonemize each word on its own to see how much of the sentence it takes.
      counts = [];
      lens = [];
      for (const w of words) {
        const own = phonemeWords(tokenize(await this.phonemize(w.text, voice)).kept);
        counts.push(own.length);
        lens.push(own.reduce((a: number, p: { len: number }) => a + p.len, 0));
      }
    }
    const times: Array<[number, number]> = wordTimes(ps, durations, counts, lens);
    return words.map((w: { from: number; to: number }, k: number) => ({
      from: w.from,
      to: w.to,
      start: times[k]?.[0] ?? 0,
      end: times[k]?.[1] ?? 0,
    }));
  }
}
