# Vendored read-aloud modules

These files come from [Chickadee](https://github.com/sahilmahendrakar/chickadee)
(`extension/src/`), the browser reader by the author of Paradee. They are licensed under the
Apache License 2.0 (see `LICENSE`) and are unchanged apart from the added `.d.ts` type files.

| File | What it does |
|---|---|
| `misaki-en.js` | misaki 0.9.4 (Kokoro's English G2P) ported to JavaScript, without spaCy or eSpeak |
| `paradee-g2p.js` | Paradee's own G2P model (Hindi, French, Spanish, and English words misaki lacks) |
| `wordtimes.js` | Exposes Paradee's per-phoneme durations and turns them into word timings |

The data they read lives in `public/tts/`:

- `model/paradee-v1.3-int8.onnx` — Paradee-8M v1.3 int8 from
  [huggingface.co/sahilmahendrakar/Paradee-8M-v1.3](https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3)
  (revision `v1.3`, SHA-256 `f68ed87562d040693dd0dd34e99c11b35ca24294e2149b840503bd1f25a2199f`), Apache-2.0.
- `misaki/*.json` — misaki's US and UK dictionaries (Apache-2.0, © hexgrad).
- `g2p/*` — Paradee's G2P model, word lists and English tag classifier (Apache-2.0).
- `ort/` — onnxruntime-web's wasm runtime, copied from `node_modules` by
  `scripts/copy-onnx-runtime.mjs` before `dev` and `build` (not committed).
