export interface SpokenSentence {
  /** Global 0-based index across the chapter. */
  index: number;
  /** 0-based index into `paragraphs`. */
  paragraphIndex: number;
  /** Character start offset inside `paragraphs[paragraphIndex]`. */
  from: number;
  /** Character end offset inside `paragraphs[paragraphIndex]`. */
  to: number;
  /** Trimmed text to synthesize. */
  text: string;
}

const MAX_SENTENCE_CHARS = 360;
const HAS_SPOKEN = /[\p{L}\p{N}]/u;

/**
 * Splits a paragraph into [from, to] spans at sentence boundaries,
 * further breaking overly long sentences at clause/space boundaries so
 * Paradee stays well under its 510-phoneme limit.
 */
function splitParagraphSpans(paragraph: string): Array<{ from: number; to: number }> {
  const spans: Array<{ from: number; to: number }> = [];
  const boundaryRe = /[.!?…]["”’')\]]*\s+/gu;

  let start = 0;
  let match: RegExpExecArray | null;
  while ((match = boundaryRe.exec(paragraph)) !== null) {
    const end = match.index + match[0].trimEnd().length;
    if (end > start) {
      pushBoundedSpan(paragraph, start, end, spans);
    }
    start = match.index + match[0].length;
  }

  if (start < paragraph.length) {
    pushBoundedSpan(paragraph, start, paragraph.length, spans);
  }

  return spans;
}

function pushBoundedSpan(
  paragraph: string,
  rawFrom: number,
  rawTo: number,
  out: Array<{ from: number; to: number }>
): void {
  let from = rawFrom;
  let to = rawTo;
  while (from < to && /\s/u.test(paragraph[from])) from++;
  while (to > from && /\s/u.test(paragraph[to - 1])) to--;
  if (from >= to) return;

  while (to - from > MAX_SENTENCE_CHARS) {
    const windowEnd = from + MAX_SENTENCE_CHARS;
    let cut = -1;
    for (let i = windowEnd; i > from + 80; i--) {
      if (/[,;:\u2014–—]/u.test(paragraph[i - 1]) && /\s/u.test(paragraph[i] ?? "")) {
        cut = i;
        break;
      }
    }
    if (cut < 0) {
      for (let i = windowEnd; i > from + 80; i--) {
        if (/\s/u.test(paragraph[i])) {
          cut = i;
          break;
        }
      }
    }
    if (cut < 0) cut = windowEnd;

    let pieceTo = cut;
    while (pieceTo > from && /\s/u.test(paragraph[pieceTo - 1])) pieceTo--;
    if (pieceTo > from) out.push({ from, to: pieceTo });

    from = cut;
    while (from < to && /\s/u.test(paragraph[from])) from++;
  }

  if (from < to) out.push({ from, to });
}

/**
 * Splits chapter paragraphs into an ordered list of speakable sentences,
 * preserving exact character offsets for highlighting.
 */
export function buildSpokenSentences(paragraphs: string[]): SpokenSentence[] {
  const result: SpokenSentence[] = [];
  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    const spans = splitParagraphSpans(para);
    for (const { from, to } of spans) {
      const text = para.slice(from, to);
      if (!HAS_SPOKEN.test(text)) continue;
      result.push({
        index: result.length,
        paragraphIndex: pIdx,
        from,
        to,
        text,
      });
    }
  }
  return result;
}
