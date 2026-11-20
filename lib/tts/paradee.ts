// Paradee 1.3 (sahilmahendrakar/Paradee-8M-v1.3, Apache-2.0): an 8M-parameter text-to-speech
// model distilled from Kokoro-82M. One 8.5 MB int8 ONNX graph goes from phoneme ids to 24 kHz
// audio, and it runs on the CPU (onnxruntime-web, wasm) fast enough to read aloud in real time.

export const PARADEE_VERSION = "1.3";
export const SAMPLE_RATE = 24000;

/** Static assets under /public, all served from this origin. */
export const TTS_ASSET_BASE = "/tts/";
export const PARADEE_MODEL_PATH = "model/paradee-v1.3-int8.onnx";

/**
 * The voices of 1.3, in the order the model numbers them (its `voice` input is the index).
 * The novel is English, so only the English voices are offered in the reader.
 */
export const PARADEE_VOICES = [
  "af_heart",
  "bf_isabella",
  "am_puck",
  "bm_fable",
  "hf_alpha",
  "hm_omega",
  "ff_siwis",
  "em_alex",
] as const;

export type ParadeeVoice = (typeof PARADEE_VOICES)[number];

export interface VoiceOption {
  id: ParadeeVoice;
  label: string;
  accent: string;
}

export const ENGLISH_VOICES: VoiceOption[] = [
  { id: "af_heart", label: "Heart", accent: "US · female" },
  { id: "am_puck", label: "Puck", accent: "US · male" },
  { id: "bf_isabella", label: "Isabella", accent: "UK · female" },
  { id: "bm_fable", label: "Fable", accent: "UK · male" },
];

export const DEFAULT_VOICE: ParadeeVoice = "af_heart";

export function isEnglishVoice(v: unknown): v is ParadeeVoice {
  return ENGLISH_VOICES.some((o) => o.id === v);
}

/** Kokoro's phoneme vocabulary (config.json of Paradee-8M-v1.3). Id 0 is the pad token. */
export const PARADEE_VOCAB: Readonly<Record<string, number>> = {
  ";": 1, ":": 2, ",": 3, ".": 4, "!": 5, "?": 6, "\u2014": 9, "\u2026": 10, "\"": 11, "(": 12,
  ")": 13, "\u201c": 14, "\u201d": 15, " ": 16, "\u0303": 17, "\u02a3": 18, "\u02a5": 19,
  "\u02a6": 20, "\u02a8": 21, "\u1d5d": 22, "\uab67": 23, A: 24, I: 25, O: 31, Q: 33, S: 35,
  T: 36, W: 39, Y: 41, "\u1d4a": 42, a: 43, b: 44, c: 45, d: 46, e: 47, f: 48, h: 50, i: 51,
  j: 52, k: 53, l: 54, m: 55, n: 56, o: 57, p: 58, q: 59, r: 60, s: 61, t: 62, u: 63, v: 64,
  w: 65, x: 66, y: 67, z: 68, "\u0251": 69, "\u0250": 70, "\u0252": 71, "\u00e6": 72,
  "\u03b2": 75, "\u0254": 76, "\u0255": 77, "\u00e7": 78, "\u0256": 80, "\u00f0": 81,
  "\u02a4": 82, "\u0259": 83, "\u025a": 85, "\u025b": 86, "\u025c": 87, "\u025f": 90,
  "\u0261": 92, "\u0265": 99, "\u0268": 101, "\u026a": 102, "\u029d": 103, "\u026f": 110,
  "\u0270": 111, "\u014b": 112, "\u0273": 113, "\u0272": 114, "\u0274": 115, "\u00f8": 116,
  "\u0278": 118, "\u03b8": 119, "\u0153": 120, "\u0279": 123, "\u027e": 125, "\u027b": 126,
  "\u0281": 128, "\u027d": 129, "\u0282": 130, "\u0283": 131, "\u0288": 132, "\u02a7": 133,
  "\u028a": 135, "\u028b": 136, "\u028c": 138, "\u0263": 139, "\u0264": 140, "\u03c7": 142,
  "\u028e": 143, "\u0292": 147, "\u0294": 148, "\u02c8": 156, "\u02cc": 157, "\u02d0": 158,
  "\u02b0": 162, "\u02b2": 164, "\u2193": 169, "\u2192": 171, "\u2197": 172, "\u2198": 173,
  "\u1d7b": 177,
};

/** The text side has 512 positions, two of which are the pad tokens at each end. */
export const MAX_PHONEMES = 510;

/**
 * Phonemes -> the model's input ids, as Kokoro's tokenizer makes them: characters outside the
 * vocabulary are dropped, at most 510 are kept, and a pad (0) goes at each end. Also returns the
 * phonemes the model actually read (one per id between the pads), for the word timings.
 */
export function tokenize(phonemes: string): { ids: BigInt64Array; kept: string } {
  const kept: string[] = [];
  for (const c of phonemes) {
    if (c in PARADEE_VOCAB) kept.push(c);
    if (kept.length >= MAX_PHONEMES) break;
  }
  const ids = new BigInt64Array(kept.length + 2);
  kept.forEach((c, i) => {
    ids[i + 1] = BigInt(PARADEE_VOCAB[c]);
  });
  return { ids, kept: kept.join("") };
}

/** A voice's language from the first letter of its name, as in Kokoro. */
export function languageOf(voice: string): "en-us" | "en-gb" | "hi" | "fr" | "es" {
  switch (voice[0]) {
    case "b":
      return "en-gb";
    case "h":
      return "hi";
    case "f":
      return "fr";
    case "e":
      return "es";
    default:
      return "en-us";
  }
}

/** One word's place in a sentence (character offsets) and in its audio (seconds). */
export interface WordTiming {
  from: number;
  to: number;
  start: number;
  end: number;
}

/** Mono float samples -> a 16-bit PCM WAV file. */
export function encodeWav(samples: Float32Array, sampleRate = SAMPLE_RATE): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
