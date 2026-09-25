"use client"

import * as React from "react"
import { zipSync } from "fflate"
import { Download, ImageUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { CodeArea, CopyButton, Field, Panel, Segmented } from "@/components/tool-kit"
import { downloadBlob } from "@/lib/download"

const PNGS = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
]
const ICO_SIZES = [16, 32, 48]

type Source = "image" | "text"

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"))
}

/** An .ico file holding PNG images (supported by every current browser) */
function buildIco(pngs: { size: number; data: Uint8Array }[]) {
  const header = 6 + 16 * pngs.length
  const total = header + pngs.reduce((n, p) => n + p.data.length, 0)
  const out = new Uint8Array(total)
  const dv = new DataView(out.buffer)
  dv.setUint16(2, 1, true)
  dv.setUint16(4, pngs.length, true)
  let offset = header
  pngs.forEach((p, i) => {
    const e = 6 + i * 16
    out[e] = p.size >= 256 ? 0 : p.size
    out[e + 1] = p.size >= 256 ? 0 : p.size
    dv.setUint16(e + 4, 1, true)
    dv.setUint16(e + 6, 32, true)
    dv.setUint32(e + 8, p.data.length, true)
    dv.setUint32(e + 12, offset, true)
    out.set(p.data, offset)
    offset += p.data.length
  })
  return out
}

export default function FaviconGenerator() {
  const [source, setSource] = React.useState<Source>("text")
  const [img, setImg] = React.useState<HTMLImageElement | null>(null)
  const [text, setText] = React.useState("D")
  const [fg, setFg] = React.useState("#ffffff")
  const [bg, setBg] = React.useState("#5b54e8")
  const [shape, setShape] = React.useState<"square" | "rounded" | "circle">("rounded")
  const [padding, setPadding] = React.useState(12)
  const [name, setName] = React.useState("My App")
  const [previews, setPreviews] = React.useState<Record<number, string>>({})
  const fileRef = React.useRef<HTMLInputElement>(null)

  const draw = React.useCallback(
    (size: number) => {
      const c = document.createElement("canvas")
      c.width = c.height = size
      const ctx = c.getContext("2d")!
      const r = shape === "circle" ? size / 2 : shape === "rounded" ? size * 0.22 : 0
      if (!(source === "image" && bg === "transparent")) {
        ctx.fillStyle = bg
        ctx.beginPath()
        ctx.roundRect(0, 0, size, size, r)
        ctx.fill()
      }
      const pad = (size * padding) / 100
      const inner = size - pad * 2
      if (source === "image" && img) {
        const scale = Math.min(inner / img.naturalWidth, inner / img.naturalHeight)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(0, 0, size, size, r)
        ctx.clip()
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        ctx.restore()
      } else if (source === "text" && text) {
        ctx.fillStyle = fg
        ctx.textAlign = "center"
        ctx.textBaseline = "alphabetic"
        let fontSize = inner
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
        const m = ctx.measureText(text)
        if (m.width > inner) fontSize *= inner / m.width
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
        const mm = ctx.measureText(text)
        // Center the glyphs' actual ink box, not the font's line box
        ctx.fillText(text, size / 2, size / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2)
      }
      return c
    },
    [source, img, text, fg, bg, shape, padding],
  )

  React.useEffect(() => {
    setPreviews(Object.fromEntries([16, 32, 180].map((s) => [s, draw(s).toDataURL("image/png")])))
  }, [draw])

  const downloadAll = async () => {
    const files: Record<string, Uint8Array> = {}
    for (const p of PNGS) files[p.name] = new Uint8Array(await (await toBlob(draw(p.size))).arrayBuffer())
    const icoParts = await Promise.all(ICO_SIZES.map(async (s) => ({ size: s, data: new Uint8Array(await (await toBlob(draw(s))).arrayBuffer()) })))
    files["favicon.ico"] = buildIco(icoParts)
    files["site.webmanifest"] = new TextEncoder().encode(manifest)
    downloadBlob(new Blob([zipSync(files) as BlobPart], { type: "application/zip" }), "favicons.zip")
  }

  const manifest = JSON.stringify(
    {
      name,
      short_name: name,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: bg === "transparent" ? "#ffffff" : bg,
      background_color: "#ffffff",
      display: "standalone",
    },
    null,
    2,
  )
  const tags = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Panel title="Source">
          <div className="space-y-4">
            <Segmented ariaLabel="Source" value={source} onChange={setSource} options={[{ value: "text", label: "Text or emoji" }, { value: "image", label: "Image" }]} />
            {source === "text" ? (
              <Field label="Up to 2 characters or an emoji" htmlFor="ftext">
                <Input id="ftext" value={text} maxLength={4} onChange={(e) => setText(e.target.value)} className="h-12 w-40 text-center text-2xl" />
              </Field>
            ) : (
              <>
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <ImageUp /> {img ? "Choose another image" : "Choose an image"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const i = new Image()
                    i.src = URL.createObjectURL(f)
                    await i.decode()
                    setImg(i)
                  }}
                />
                <p className="text-xs text-muted-foreground">A square PNG or SVG of at least 512×512 gives the sharpest result.</p>
              </>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {source === "text" && (
                <Field label="Text color" htmlFor="ffg">
                  <input id="ffg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border bg-transparent" />
                </Field>
              )}
              <Field label="Background" htmlFor="fbg">
                <div className="flex gap-2">
                  <input id="fbg" type="color" value={bg === "transparent" ? "#ffffff" : bg} onChange={(e) => setBg(e.target.value)} className="h-9 min-w-0 flex-1 cursor-pointer rounded-md border bg-transparent" />
                  {source === "image" && (
                    <Button size="sm" variant={bg === "transparent" ? "default" : "outline"} onClick={() => setBg(bg === "transparent" ? "#ffffff" : "transparent")} className="h-9">
                      None
                    </Button>
                  )}
                </div>
              </Field>
              <Field label="Shape">
                <Segmented ariaLabel="Shape" size="sm" value={shape} onChange={setShape} options={[{ value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }, { value: "circle", label: "Circle" }]} />
              </Field>
              <Field label={`Padding: ${padding}%`}>
                <Slider value={[padding]} min={0} max={30} step={1} onValueChange={(v) => setPadding(v[0])} aria-label="Padding" />
              </Field>
            </div>
          </div>
        </Panel>
        <Panel title="HTML to add inside <head>" actions={<CopyButton value={tags} />}>
          <CodeArea readOnly value={tags} className="h-32 min-h-0 resize-none" aria-label="HTML tags" />
          <div className="mt-3 max-w-xs">
            <Field label="App name (for site.webmanifest)" htmlFor="appname">
              <Input id="appname" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          </div>
        </Panel>
      </div>

      <Panel title="Preview" className="h-fit">
        <div className="space-y-5">
          <div className="flex items-end justify-center gap-6 rounded-lg border bg-muted/30 p-6">
            {[180, 32, 16].map((s) =>
              previews[s] ? (
                <div key={s} className="flex flex-col items-center gap-2">
                  <img src={previews[s]} alt={`${s}px favicon`} width={s === 180 ? 96 : s * 2} height={s === 180 ? 96 : s * 2} className="checkerboard" style={{ imageRendering: s < 64 ? "pixelated" : "auto" }} />
                  <span className="text-[11px] text-muted-foreground">{s}px</span>
                </div>
              ) : null,
            )}
          </div>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 bg-muted/50 px-3 pt-2">
            <div className="flex max-w-56 items-center gap-2 rounded-t-md bg-background px-3 py-1.5 text-xs shadow-sm">
              {previews[32] && <img src={previews[32]} alt="" className="size-4" />}
              <span className="truncate">{name}</span>
            </div>
          </div>
          <Button onClick={downloadAll} className="w-full" disabled={source === "image" && !img}>
            <Download /> Download favicons (.zip)
          </Button>
          <p className="text-xs text-muted-foreground">Contains favicon.ico (16, 32, 48), PNG icons from 16 to 512 px, an Apple touch icon and site.webmanifest.</p>
        </div>
      </Panel>
    </div>
  )
}
