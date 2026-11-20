// Types for the vendored Chickadee modules (Apache-2.0, see LICENSE in this folder).
import type * as Ort from "onnxruntime-web";

export declare const LANG_OF: Record<string, "hi" | "fr" | "es">;

export interface G2PData {
  vocab: { in: string[]; out: string[] };
  lexicon: Record<string, { w: Record<string, string>; c: Record<string, string> }>;
  numbers: Record<string, Record<string, string>>;
}

export declare class ParadeeG2P {
  static create(ort: typeof Ort, model: Uint8Array, data: unknown): Promise<ParadeeG2P>;
  data: G2PData;
  model(items: Array<[string, string, string, string]>): Promise<string[]>;
  phonemize(text: string, lang: string): Promise<string>;
}
