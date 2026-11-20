// Types for the vendored Chickadee modules (Apache-2.0, see LICENSE in this folder).
import type { ParadeeG2P } from "./paradee-g2p.js";

export declare class MisakiEnglish {
  constructor(
    british: boolean,
    data: { gold: unknown; silver: unknown },
    tags: unknown,
    fallback?: ((text: string) => Promise<string>) | null
  );
  phonemize(text: string): Promise<string>;
}

export declare function englishFallback(
  g2p: ParadeeG2P,
  british: boolean,
  plain: MisakiEnglish
): (text: string) => Promise<string>;
