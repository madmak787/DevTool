export type RGBA = { r: number; g: number; b: number; a: number } // r,g,b 0–255, a 0–1

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const round = (v: number, d = 0) => {
  const f = 10 ** d
  return Math.round(v * f) / f
}

/* ---------- Parsing ---------- */

function parseNum(s: string, full: number) {
  s = s.trim()
  if (s.endsWith("%")) return (parseFloat(s) / 100) * full
  return parseFloat(s)
}

function parseHue(s: string) {
  s = s.trim()
  const n = parseFloat(s)
  if (s.endsWith("turn")) return n * 360
  if (s.endsWith("rad")) return (n * 180) / Math.PI
  if (s.endsWith("grad")) return n * 0.9
  return n
}

function args(inner: string) {
  // Accept "r g b / a", "r, g, b, a" and mixes
  const [main, alpha] = inner.split("/")
  const parts = main.split(/[\s,]+/).filter(Boolean)
  if (alpha !== undefined) parts.push(alpha.trim())
  return parts
}

export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase()
  if (!s) return null

  let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s)
  if (m) {
    let h = m[1]
    if (h.length <= 4) h = [...h].map((c) => c + c).join("")
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? round(parseInt(h.slice(6, 8), 16) / 255, 3) : 1,
    }
  }

  m = /^(rgba?|hsla?|hwb|oklch|oklab)\((.*)\)$/.exec(s)
  if (m) {
    const p = args(m[2])
    if (p.length < 3) return null
    const a = p[3] !== undefined ? clamp(parseNum(p[3], 1)) : 1
    let rgb: [number, number, number]
    switch (m[1]) {
      case "rgb":
      case "rgba":
        rgb = [parseNum(p[0], 255), parseNum(p[1], 255), parseNum(p[2], 255)]
        break
      case "hsl":
      case "hsla":
        rgb = hslToRgb(parseHue(p[0]), parseNum(p[1], 100), parseNum(p[2], 100))
        break
      case "hwb":
        rgb = hwbToRgb(parseHue(p[0]), parseNum(p[1], 100), parseNum(p[2], 100))
        break
      case "oklch":
        rgb = oklchToRgb(parseNum(p[0], 1), parseNum(p[1], 0.4), parseHue(p[2]))
        break
      default:
        rgb = oklabToRgb(parseNum(p[0], 1), parseNum(p[1], 0.4), parseNum(p[2], 0.4))
    }
    if (rgb.some((v) => !Number.isFinite(v))) return null
    return { r: clamp(Math.round(rgb[0]), 0, 255), g: clamp(Math.round(rgb[1]), 0, 255), b: clamp(Math.round(rgb[2]), 0, 255), a }
  }

  // Named colors ("rebeccapurple", "transparent"…) through the browser's own CSS parser
  if (/^[a-z]+$/.test(s) && typeof document !== "undefined") {
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx) return null
    ctx.fillStyle = "#010203"
    ctx.fillStyle = s
    const v = ctx.fillStyle
    if (v === "#010203" && s !== "#010203") return null
    return parseColor(v)
  }
  return null
}

/* ---------- Conversions ---------- */

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

function hwbToRgb(h: number, w: number, b: number): [number, number, number] {
  w /= 100
  b /= 100
  if (w + b >= 1) {
    const g = (w / (w + b)) * 255
    return [g, g, g]
  }
  const [r, gg, bb] = hslToRgb(h, 100, 50)
  const f = (c: number) => (c / 255) * (1 - w - b) * 255 + w * 255
  return [f(r), f(gg), f(bb)]
}

export function rgbToHsl({ r, g, b }: RGBA) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    h *= 60
  }
  return { h: round(h, 1), s: round(s * 100, 1), l: round(l * 100, 1) }
}

export function rgbToHsv({ r, g, b }: RGBA) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  const { h } = rgbToHsl({ r: r * 255, g: g * 255, b: b * 255, a: 1 })
  return { h, s: round(max === 0 ? 0 : (d / max) * 100, 1), v: round(max * 100, 1) }
}

export function rgbToCmyk({ r, g, b }: RGBA) {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255]
  const k = 1 - Math.max(rr, gg, bb)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const f = (x: number) => round(((1 - x - k) / (1 - k)) * 100)
  return { c: f(rr), m: f(gg), y: f(bb), k: round(k * 100) }
}

const toLinear = (c: number) => {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function rgbToOklab({ r, g, b }: RGBA) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  return oklabToLinear(L, a, b).map((c) => fromLinear(clamp(c))) as [number, number, number]
}

export function rgbToOklch(c: RGBA) {
  const { L, a, b } = rgbToOklab(c)
  const C = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c: C, h: C < 0.0002 ? 0 : h }
}

/** OKLCH to sRGB, reducing chroma until the color fits in the sRGB gamut */
export function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180
  let chroma = c
  for (let i = 0; i < 30; i++) {
    const lin = oklabToLinear(l, chroma * Math.cos(rad), chroma * Math.sin(rad))
    if (lin.every((v) => v >= -0.0005 && v <= 1.0005) || chroma < 0.001) return lin.map((v) => fromLinear(clamp(v))) as [number, number, number]
    chroma *= 0.92
  }
  return oklabToRgb(l, 0, 0)
}

/* ---------- Formatting ---------- */

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0")

export function toHex(c: RGBA, withAlpha = c.a < 1) {
  return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${withAlpha ? hex2(c.a * 255) : ""}`
}

export function formats(c: RGBA) {
  const alpha = c.a < 1 ? ` / ${round(c.a * 100)}%` : ""
  const hsl = rgbToHsl(c)
  const hsv = rgbToHsv(c)
  const lch = rgbToOklch(c)
  const cmyk = rgbToCmyk(c)
  return {
    hex: toHex(c),
    rgb: c.a < 1 ? `rgb(${c.r} ${c.g} ${c.b}${alpha})` : `rgb(${c.r}, ${c.g}, ${c.b})`,
    hsl: c.a < 1 ? `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%${alpha})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    oklch: `oklch(${round(lch.l * 100, 1)}% ${round(lch.c, 3)} ${round(lch.h, 1)}${alpha})`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
  }
}

/* ---------- Contrast ---------- */

export function luminance({ r, g, b }: RGBA) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function contrast(a: RGBA, b: RGBA) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Tints and shades at even OKLCH lightness steps, keeping the hue */
export function scale(c: RGBA) {
  const { c: chroma, h } = rgbToOklch(c)
  const stops = [0.97, 0.93, 0.86, 0.77, 0.68, 0.59, 0.5, 0.42, 0.34, 0.26, 0.19]
  const names = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]
  return stops.map((l, i) => {
    // Very light and very dark stops can't hold much chroma
    const cc = chroma * Math.min(1, (1 - Math.abs(l - 0.6) / 0.6) * 1.6)
    const [r, g, b] = oklchToRgb(l, cc, h)
    return { name: names[i], color: { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 1 } }
  })
}
