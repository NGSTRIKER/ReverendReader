"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_VOICE,
  encodeWav,
  isEnglishVoice,
  type ParadeeVoice,
  type WordTiming,
} from "./paradee";
import { buildSpokenSentences, type SpokenSentence } from "./sentences";
import type { WorkerRequest, WorkerResponse } from "./paradee.worker";

export type TtsStatus = "idle" | "loading-model" | "synthesizing" | "playing" | "paused" | "error";

export interface ActiveWordHighlight {
  paragraphIndex: number;
  /** Character start offset inside the paragraph. */
  from: number;
  /** Character end offset inside the paragraph. */
  to: number;
}

export interface ActiveSentenceHighlight {
  index: number;
  paragraphIndex: number;
  from: number;
  to: number;
}

interface CachedAudio {
  url: string;
  words: WordTiming[];
}

interface UseParadeeTtsOptions {
  chapterId: number;
  paragraphs: string[];
  enabled?: boolean;
  onChapterEnded?: () => void;
}

const STORAGE_VOICE_KEY = "reverend_tts_voice";
const STORAGE_SPEED_KEY = "reverend_tts_speed";
const STORAGE_USED_KEY = "reverend_tts_used";

function loadStoredVoice(): ParadeeVoice {
  if (typeof window === "undefined") return DEFAULT_VOICE;
  try {
    const raw = localStorage.getItem(STORAGE_VOICE_KEY);
    return isEnglishVoice(raw) ? raw : DEFAULT_VOICE;
  } catch {
    return DEFAULT_VOICE;
  }
}

function loadStoredSpeed(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = Number(localStorage.getItem(STORAGE_SPEED_KEY));
    return Number.isFinite(raw) && raw >= 0.5 && raw <= 2.5 ? raw : 1;
  } catch {
    return 1;
  }
}

export function useParadeeTts({
  chapterId,
  paragraphs,
  enabled = true,
  onChapterEnded,
}: UseParadeeTtsOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<TtsStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoiceState] = useState<ParadeeVoice>(DEFAULT_VOICE);
  const [speed, setSpeedState] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeWord, setActiveWord] = useState<ActiveWordHighlight | null>(null);

  const sentences = useMemo(() => buildSpokenSentences(paragraphs), [paragraphs]);

  const workerRef = useRef<Worker | null>(null);
  const pendingRpcRef = useRef(
    new Map<number, { resolve: (res: WorkerResponse) => void; reject: (err: Error) => void }>()
  );
  const rpcSeqRef = useRef(0);
  const modelReadyRef = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef(new Map<number, Promise<CachedAudio>>());
  const urlsRef = useRef(new Map<number, string>());
  const generationRef = useRef(0);
  const currentIndexRef = useRef(0);
  const voiceRef = useRef<ParadeeVoice>(DEFAULT_VOICE);
  const speedRef = useRef<number>(1);
  const sentencesRef = useRef<SpokenSentence[]>(sentences);
  const autoPlayNextChapterRef = useRef(false);
  const onChapterEndedRef = useRef(onChapterEnded);
  onChapterEndedRef.current = onChapterEnded;
  sentencesRef.current = sentences;

  // Hydrate persisted voice/speed on mount
  useEffect(() => {
    const v = loadStoredVoice();
    const s = loadStoredSpeed();
    setVoiceState(v);
    voiceRef.current = v;
    setSpeedState(s);
    speedRef.current = s;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    for (const url of urlsRef.current.values()) {
      URL.revokeObjectURL(url);
    }
    urlsRef.current.clear();
  }, []);

  const callWorker = useCallback(
    (
      payload:
        | { type: "init"; voice: string }
        | { type: "prepare"; voice: string }
        | { type: "synthesize"; text: string; voice: string; speed: number }
    ): Promise<WorkerResponse> => {
      if (!workerRef.current) {
        const w = new Worker(new URL("./paradee.worker.ts", import.meta.url));
        w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
          const msg = ev.data;
          const entry = pendingRpcRef.current.get(msg.id);
          if (!entry) return;
          pendingRpcRef.current.delete(msg.id);
          if (msg.ok) entry.resolve(msg);
          else entry.reject(new Error(msg.error));
        };
        w.onerror = (ev) => {
          const err = new Error(ev.message || "TTS worker error");
          for (const entry of pendingRpcRef.current.values()) {
            entry.reject(err);
          }
          pendingRpcRef.current.clear();
        };
        workerRef.current = w;
      }

      const id = ++rpcSeqRef.current;
      const req: WorkerRequest = { ...payload, id } as WorkerRequest;
      return new Promise((resolve, reject) => {
        pendingRpcRef.current.set(id, { resolve, reject });
        workerRef.current!.postMessage(req);
      });
    },
    []
  );

  const ensureModel = useCallback(async () => {
    if (modelReadyRef.current) return;
    setStatus("loading-model");
    await callWorker({ type: "init", voice: voiceRef.current });
    modelReadyRef.current = true;
    try {
      localStorage.setItem(STORAGE_USED_KEY, "1");
    } catch {}
  }, [callWorker]);

  // Background pre-warm for returning TTS users so Play starts immediately
  useEffect(() => {
    if (!enabled || modelReadyRef.current) return;
    let used = false;
    try {
      used = localStorage.getItem(STORAGE_USED_KEY) === "1";
    } catch {}
    if (!used) return;

    const timer = window.setTimeout(() => {
      if (modelReadyRef.current) return;
      void callWorker({ type: "init", voice: voiceRef.current })
        .then(() => {
          modelReadyRef.current = true;
        })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [enabled, callWorker]);

  const getOrSynth = useCallback(
    (index: number, gen: number): Promise<CachedAudio> | null => {
      const list = sentencesRef.current;
      if (index < 0 || index >= list.length) return null;
      const existing = cacheRef.current.get(index);
      if (existing) return existing;

      const sentence = list[index];
      const promise = (async () => {
        const res = await callWorker({
          type: "synthesize",
          text: sentence.text,
          voice: voiceRef.current,
          speed: 1.0,
        });
        if (!res.ok || res.type !== "synthesize") {
          throw new Error("Unexpected worker response");
        }
        const blob = encodeWav(res.waveform);
        const url = URL.createObjectURL(blob);
        if (generationRef.current !== gen) {
          URL.revokeObjectURL(url);
          throw new Error("stale");
        }
        urlsRef.current.set(index, url);
        return { url, words: res.words };
      })().catch((err) => {
        if (cacheRef.current.get(index) === promise) {
          cacheRef.current.delete(index);
        }
        throw err;
      });

      cacheRef.current.set(index, promise);
      return promise;
    },
    [callWorker]
  );

  const prefetchAround = useCallback(
    (index: number, gen: number) => {
      const list = sentencesRef.current;
      for (const next of [index + 1, index + 2]) {
        if (next < list.length && !cacheRef.current.has(next)) {
          void getOrSynth(next, gen)?.catch(() => undefined);
        }
      }
      for (const key of [...cacheRef.current.keys()]) {
        if (key < index - 2) {
          cacheRef.current.delete(key);
          const oldUrl = urlsRef.current.get(key);
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
            urlsRef.current.delete(key);
          }
        }
      }
    },
    [getOrSynth]
  );

  const activeWordsRef = useRef<WordTiming[]>([]);
  const activeSentenceRef = useRef<SpokenSentence | null>(null);

  const playSentence = useCallback(
    async (index: number) => {
      const list = sentencesRef.current;
      if (!enabled || list.length === 0) return;

      if (index >= list.length) {
        if (onChapterEndedRef.current) {
          autoPlayNextChapterRef.current = true;
          onChapterEndedRef.current();
        } else {
          setStatus("idle");
          setActiveWord(null);
        }
        return;
      }

      const clamped = Math.max(0, Math.min(list.length - 1, index));
      const gen = generationRef.current;
      currentIndexRef.current = clamped;
      setCurrentIndex(clamped);
      setActiveWord(null);
      setError(null);
      setIsOpen(true);

      try {
        await ensureModel();
        if (generationRef.current !== gen) return;

        if (!cacheRef.current.has(clamped)) {
          setStatus("synthesizing");
        }
        const entry = await getOrSynth(clamped, gen);
        if (!entry || generationRef.current !== gen) return;

        const sentence = sentencesRef.current[clamped];
        if (!sentence) return;

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const audio = audioRef.current;
        audio.pause();
        audio.src = entry.url;
        audio.playbackRate = speedRef.current;

        activeWordsRef.current = entry.words;
        activeSentenceRef.current = sentence;

        await audio.play();
        if (generationRef.current !== gen) {
          audio.pause();
          return;
        }
        setStatus("playing");
        prefetchAround(clamped, gen);
      } catch (err) {
        if (generationRef.current !== gen) return;
        const message = err instanceof Error ? err.message : String(err);
        if (message === "stale") return;
        setError(message || "Failed to generate speech.");
        setStatus("error");
      }
    },
    [enabled, ensureModel, getOrSynth, prefetchAround]
  );

  // Wire up <audio> ended + word highlight ticker
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleEnded = () => {
      setActiveWord(null);
      void playSentence(currentIndexRef.current + 1);
    };

    const handlePause = () => {
      if (!audio.ended) {
        setStatus((prev) => (prev === "playing" ? "paused" : prev));
      }
    };

    const handlePlay = () => {
      setStatus("playing");
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    const tickInterval = window.setInterval(() => {
      if (audio.paused) return;
      const sentence = activeSentenceRef.current;
      const words = activeWordsRef.current;
      if (!sentence || !words.length) return;
      const t = audio.currentTime;
      let match: WordTiming | null = null;
      for (let i = 0; i < words.length; i++) {
        if (t >= words[i].start && t < words[i].end) {
          match = words[i];
          break;
        }
      }
      if (!match) {
        setActiveWord((prev) => (prev === null ? prev : null));
        return;
      }
      const nextFrom = sentence.from + match.from;
      const nextTo = sentence.from + match.to;
      setActiveWord((prev) =>
        prev &&
        prev.paragraphIndex === sentence.paragraphIndex &&
        prev.from === nextFrom &&
        prev.to === nextTo
          ? prev
          : { paragraphIndex: sentence.paragraphIndex, from: nextFrom, to: nextTo }
      );
    }, 25);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      window.clearInterval(tickInterval);
    };
  }, [playSentence]);

  // Reset when chapter or sentences change
  useEffect(() => {
    generationRef.current += 1;
    audioRef.current?.pause();
    clearCache();
    activeWordsRef.current = [];
    activeSentenceRef.current = null;
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setActiveWord(null);
    setError(null);

    if (autoPlayNextChapterRef.current && sentences.length > 0 && enabled) {
      autoPlayNextChapterRef.current = false;
      void playSentence(0);
    } else {
      setStatus("idle");
    }
  }, [chapterId, sentences, enabled, clearCache, playSentence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      generationRef.current += 1;
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.src = "";
      clearCache();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [clearCache]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus((prev) => (prev === "playing" ? "paused" : prev));
  }, []);

  const resume = useCallback(async () => {
    const audio = audioRef.current;
    if (audio && audio.src && status === "paused") {
      try {
        audio.playbackRate = speedRef.current;
        await audio.play();
        setStatus("playing");
        return;
      } catch {
        // Fall through to re-synthesize
      }
    }
    await playSentence(currentIndexRef.current);
  }, [playSentence, status]);

  const togglePlay = useCallback(() => {
    if (status === "playing") {
      pause();
    } else if (status === "paused") {
      void resume();
    } else if (status === "idle" || status === "error") {
      void playSentence(currentIndexRef.current);
    }
  }, [status, pause, resume, playSentence]);

  const stop = useCallback(() => {
    generationRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    activeWordsRef.current = [];
    activeSentenceRef.current = null;
    setActiveWord(null);
    setStatus("idle");
  }, []);

  const openPlayer = useCallback(() => {
    setIsOpen(true);
    if (status === "idle" && sentencesRef.current.length > 0) {
      void playSentence(currentIndexRef.current);
    }
  }, [playSentence, status]);

  const closePlayer = useCallback(() => {
    stop();
    setIsOpen(false);
  }, [stop]);

  const nextSentence = useCallback(() => {
    void playSentence(currentIndexRef.current + 1);
  }, [playSentence]);

  const prevSentence = useCallback(() => {
    void playSentence(Math.max(0, currentIndexRef.current - 1));
  }, [playSentence]);

  const setVoice = useCallback(
    (nextVoice: ParadeeVoice) => {
      if (nextVoice === voiceRef.current) return;
      voiceRef.current = nextVoice;
      setVoiceState(nextVoice);
      try {
        localStorage.setItem(STORAGE_VOICE_KEY, nextVoice);
      } catch {}

      const wasPlaying = status === "playing" || status === "synthesizing" || status === "loading-model";
      generationRef.current += 1;
      audioRef.current?.pause();
      clearCache();
      setActiveWord(null);

      if (modelReadyRef.current) {
        void callWorker({ type: "prepare", voice: nextVoice }).catch(() => undefined);
      }
      if (wasPlaying) {
        void playSentence(currentIndexRef.current);
      } else if (status === "paused") {
        setStatus("idle");
      }
    },
    [callWorker, clearCache, playSentence, status]
  );

  const setSpeed = useCallback((nextSpeed: number) => {
    const clamped = Math.min(2.5, Math.max(0.5, Number(nextSpeed) || 1));
    speedRef.current = clamped;
    setSpeedState(clamped);
    if (audioRef.current) {
      audioRef.current.playbackRate = clamped;
    }
    try {
      localStorage.setItem(STORAGE_SPEED_KEY, String(clamped));
    } catch {}
  }, []);

  const activeSentence: ActiveSentenceHighlight | null = useMemo(() => {
    if (!isOpen || status === "idle") return null;
    const s = sentences[currentIndex];
    if (!s) return null;
    return {
      index: s.index,
      paragraphIndex: s.paragraphIndex,
      from: s.from,
      to: s.to,
    };
  }, [isOpen, status, sentences, currentIndex]);

  return {
    isOpen,
    status,
    error,
    voice,
    speed,
    currentIndex,
    totalSentences: sentences.length,
    activeSentence,
    activeWord,
    openPlayer,
    closePlayer,
    togglePlay,
    pause,
    stop,
    nextSentence,
    prevSentence,
    playSentence,
    setVoice,
    setSpeed,
  };
}
