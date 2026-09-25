/** Split into user-perceived characters so emoji and accented letters count as one */
export function graphemes(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s), (x) => x.segment)
  }
  return Array.from(s)
}

export function words(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "word" }).segment(s))
      .filter((x) => x.isWordLike)
      .map((x) => x.segment)
  }
  return s.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) ?? []
}

export function sentences(s: string): number {
  if (!s.trim()) return 0
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(s)).filter((x) => /[\p{L}\p{N}]/u.test(x.segment)).length
  }
  return s.split(/[.!?]+(?:\s|$)/).filter((x) => x.trim()).length
}

export function splitLines(s: string) {
  return s.split(/\r\n|\r|\n/)
}

/** Natural comparison: "file2" sorts before "file10" */
export const naturalCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

/** Cryptographically random integer in [0, max) without modulo bias */
export function randomInt(max: number) {
  const limit = Math.floor(0x1_0000_0000 / max) * max
  const buf = new Uint32Array(1)
  let x: number
  do {
    crypto.getRandomValues(buf)
    x = buf[0]
  } while (x >= limit)
  return x % max
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
