// Types for the vendored Chickadee modules (Apache-2.0, see LICENSE in this folder).

export declare const DURATIONS: string;

export declare function withOutput(model: Uint8Array, name: string): Uint8Array;

export declare function wordTimes(
  ps: string,
  durations: ArrayLike<number>,
  counts: number[],
  lens: number[]
): Array<[number, number]>;

export declare function textWords(text: string): Array<{ text: string; from: number; to: number }>;

export declare function phonemeWords(ps: string): Array<{ from: number; to: number; len: number }>;
