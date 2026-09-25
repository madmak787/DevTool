"use client"

import * as React from "react"
import { Download, ImageUp, LoaderCircle, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Field, Message, OptionSwitch, Panel, Segmented, formatBytes } from "@/components/tool-kit"
import { downloadBlob } from "@/lib/download"
import { cn } from "@/lib/utils"

type Format = "image/png" | "image/jpeg" | "image/webp" | "image/avif"
const EXT: Record<Format, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif" }

type Item = {
  id: number
  file: File
  src: string
  width: number
  height: number
  result?: { blob: Blob; url: string; width: number; height: number }
  error?: string
}

let nextId = 1

async function loadImage(src: string) {
  const img = new Image()
  img.decoding = "async"
  img.src = src
  await img.decode()
  return img
}

function canEncode(type: string) {
  const c = document.createElement("canvas")
  c.width = c.height = 1
  return c.toDataURL(type).startsWith(`data:${type}`)
}

export default function ImageConverter() {
  const [items, setItems] = React.useState<Item[]>([])
  const [format, setFormat] = React.useState<Format>("image/webp")
  const [quality, setQuality] = React.useState(85)
  const [resize, setResize] = React.useState(false)
  const [maxW, setMaxW] = React.useState("1920")
  const [maxH, setMaxH] = React.useState("1920")
  const [background, setBackground] = React.useState("#ffffff")
  const [busy, setBusy] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [formats, setFormats] = React.useState<Format[]>(["image/png", "image/jpeg", "image/webp"])
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (canEncode("image/avif")) setFormats((f) => [...f, "image/avif"])
    if (!canEncode("image/webp")) setFormat("image/png")
  }, [])

  const addFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"))
    const added: Item[] = []
    for (const file of images) {
      const src = URL.createObjectURL(file)
      try {
        const img = await loadImage(src)
        added.push({ id: nextId++, file, src, width: img.naturalWidth, height: img.naturalHeight })
      } catch {
        added.push({ id: nextId++, file, src, width: 0, height: 0, error: "This image couldn’t be read by your browser." })
      }
    }
    setItems((cur) => [...cur, ...added])
  }

  const remove = (id: number) =>
    setItems((cur) => {
      const it = cur.find((x) => x.id === id)
      if (it) {
        URL.revokeObjectURL(it.src)
        if (it.result) URL.revokeObjectURL(it.result.url)
      }
      return cur.filter((x) => x.id !== id)
    })

  // Re-encode whenever the settings or the list change
  const key = items.map((i) => i.id).join(",")
  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      setBusy(true)
      const next: Item[] = []
      for (const it of items) {
        if (it.error && !it.width) {
          next.push(it)
          continue
        }
        try {
          const img = await loadImage(it.src)
          let w = img.naturalWidth || 512
          let h = img.naturalHeight || 512
          if (resize) {
            const mw = Number(maxW) || Infinity
            const mh = Number(maxH) || Infinity
            const ratio = Math.min(1, mw / w, mh / h)
            w = Math.max(1, Math.round(w * ratio))
            h = Math.max(1, Math.round(h * ratio))
          }
          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")!
          if (format === "image/jpeg") {
            // JPEG has no transparency; paint a background instead of letting it turn black
            ctx.fillStyle = background
            ctx.fillRect(0, 0, w, h)
          }
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, w, h)
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, format, quality / 100))
          if (!blob) throw new Error("encode")
          if (it.result) URL.revokeObjectURL(it.result.url)
          next.push({ ...it, error: undefined, result: { blob, url: URL.createObjectURL(blob), width: w, height: h } })
        } catch {
          next.push({ ...it, result: undefined, error: "Conversion failed in this browser." })
        }
        if (cancelled) return
      }
      if (!cancelled) {
        setItems(next)
        setBusy(false)
      }
    }
    const t = setTimeout(run, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // items is tracked through `key`; re-running on its own updates would loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, format, quality, resize, maxW, maxH, background])

  const filename = (it: Item) => `${it.file.name.replace(/\.[^.]+$/, "")}.${EXT[format]}`
  const lossy = format !== "image/png"
  const done = items.filter((i) => i.result)
  const totalIn = done.reduce((n, i) => n + i.file.size, 0)
  const totalOut = done.reduce((n, i) => n + i.result!.blob.size, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card px-6 py-10 text-center transition-colors outline-none hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring/50",
            dragging && "border-primary bg-accent/60",
          )}
        >
          <ImageUp className="size-8 text-primary" />
          <span className="font-medium">Drop images here or click to choose</span>
          <span className="text-sm text-muted-foreground">PNG, JPEG, WebP, GIF, SVG, AVIF… Several at once is fine.</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />

        {items.length > 0 && (
          <Panel
            title={
              <span className="inline-flex items-center gap-2">
                {items.length} image{items.length === 1 ? "" : "s"}
                {busy && <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />}
              </span>
            }
            actions={
              <>
                <Button size="sm" variant="ghost" onClick={() => [...items].forEach((i) => remove(i.id))}>
                  <Trash2 /> Remove all
                </Button>
                {done.length > 1 && (
                  <Button size="sm" onClick={() => done.forEach((i, n) => setTimeout(() => downloadBlob(i.result!.blob, filename(i)), n * 250))}>
                    <Download /> Download all
                  </Button>
                )}
              </>
            }
            footer={
              done.length > 0 && (
                <span>
                  Total {formatBytes(totalIn)} → <span className="font-medium text-foreground">{formatBytes(totalOut)}</span>
                  {totalIn > 0 && ` (${totalOut <= totalIn ? "−" : "+"}${Math.abs(Math.round((1 - totalOut / totalIn) * 100))}%)`}
                </span>
              )
            }
            bodyClassName="p-0"
          >
            <ul>
              {items.map((it) => {
                const diff = it.result ? Math.round((1 - it.result.blob.size / it.file.size) * 100) : 0
                return (
                  <li key={it.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                    <img src={it.result?.url ?? it.src} alt="" className="checkerboard size-14 shrink-0 rounded-md border object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={it.file.name}>
                        {it.file.name}
                      </p>
                      {it.error ? (
                        <p className="text-xs text-destructive">{it.error}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {it.width}×{it.height} · {formatBytes(it.file.size)}
                          {it.result && (
                            <>
                              {" → "}
                              <span className="text-foreground">
                                {it.result.width}×{it.result.height} · {formatBytes(it.result.blob.size)}
                              </span>{" "}
                              <span className={diff > 0 ? "text-success" : "text-warning"}>
                                ({diff > 0 ? `−${diff}` : `+${-diff}`}%)
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" disabled={!it.result} onClick={() => it.result && downloadBlob(it.result.blob, filename(it))}>
                      <Download /> <span className="hidden sm:inline">{EXT[format].toUpperCase()}</span>
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => remove(it.id)} aria-label={`Remove ${it.file.name}`}>
                      <X />
                    </Button>
                  </li>
                )
              })}
            </ul>
          </Panel>
        )}
      </div>

      <Panel title="Output" className="h-fit">
        <div className="space-y-5">
          <Field label="Format">
            <Segmented
              ariaLabel="Format"
              value={format}
              onChange={setFormat}
              options={formats.map((f) => ({ value: f, label: EXT[f].toUpperCase() }))}
            />
          </Field>
          {lossy && (
            <Field label={`Quality: ${quality}%`}>
              <Slider value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} aria-label="Quality" />
            </Field>
          )}
          {format === "image/jpeg" && (
            <Field label="Background for transparent areas" htmlFor="bg">
              <div className="flex gap-2">
                <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-9 w-12 cursor-pointer rounded-md border bg-transparent" aria-label="Background color" />
                <Input id="bg" value={background} onChange={(e) => setBackground(e.target.value)} className="font-mono" />
              </div>
            </Field>
          )}
          <OptionSwitch id="resize" label="Resize (keeps proportions)" checked={resize} onChange={setResize} />
          {resize && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Max width" htmlFor="mw">
                <Input id="mw" type="number" min={1} value={maxW} onChange={(e) => setMaxW(e.target.value)} />
              </Field>
              <Field label="Max height" htmlFor="mh">
                <Input id="mh" type="number" min={1} value={maxH} onChange={(e) => setMaxH(e.target.value)} />
              </Field>
            </div>
          )}
          <Message tone="info">Images are converted on your device and never uploaded.</Message>
        </div>
      </Panel>
    </div>
  )
}
