"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Field, Message, OptionSwitch, Panel } from "@/components/tool-kit"
import { downloadDataUrl, downloadText } from "@/lib/download"

const FORMATS = [
  { id: "code128", name: "Code 128", sample: "DEVTOOLS-2026", hint: "Any ASCII text. The most common general-purpose barcode.", linear: true },
  { id: "code39", name: "Code 39", sample: "ABC-1234", hint: "Uppercase letters, digits and - . $ / + % space.", linear: true },
  { id: "ean13", name: "EAN-13", sample: "590123412345", hint: "12 digits (the check digit is added) or 13 with the check digit. Retail products.", linear: true },
  { id: "ean8", name: "EAN-8", sample: "9638507", hint: "7 digits, or 8 with the check digit.", linear: true },
  { id: "upca", name: "UPC-A", sample: "03600029145", hint: "11 digits, or 12 with the check digit. North American retail.", linear: true },
  { id: "upce", name: "UPC-E", sample: "0123456", hint: "7 digits starting with 0 or 1, or 8 with the check digit.", linear: true },
  { id: "itf14", name: "ITF-14", sample: "1540014128876", hint: "13 digits, or 14 with the check digit. Shipping cartons.", linear: true },
  { id: "datamatrix", name: "Data Matrix", sample: "https://tool.khanamir.me", hint: "2D code for text or URLs; common on small parts and labels.", linear: false },
  { id: "pdf417", name: "PDF417", sample: "DevTools barcode sample", hint: "Stacked 2D code used on IDs and boarding passes.", linear: false },
] as const

type FormatId = (typeof FORMATS)[number]["id"]
type Bwip = typeof import("bwip-js/browser")

export default function BarcodeTool() {
  const [format, setFormat] = React.useState<FormatId>("code128")
  const [text, setText] = React.useState<string>(FORMATS[0].sample)
  const [scale, setScale] = React.useState(3)
  const [height, setHeight] = React.useState(12)
  const [showText, setShowText] = React.useState(true)
  const [fg, setFg] = React.useState("#000000")
  const [bg, setBg] = React.useState("#ffffff")
  const [svg, setSvg] = React.useState("")
  const [error, setError] = React.useState("")
  const bwip = React.useRef<Bwip | null>(null)
  const meta = FORMATS.find((f) => f.id === format)!

  const options = React.useMemo(
    () => ({
      bcid: format,
      text,
      scale,
      ...(meta.linear ? { height, includetext: showText, textxalign: "center" as const } : {}),
      barcolor: fg.replace("#", ""),
      backgroundcolor: bg.replace("#", ""),
      paddingwidth: 10,
      paddingheight: 10,
    }),
    [format, text, scale, height, showText, fg, bg, meta.linear],
  )

  React.useEffect(() => {
    if (!text) {
      setSvg("")
      setError("")
      return
    }
    let cancelled = false
    ;(async () => {
      bwip.current ??= await import("bwip-js/browser")
      if (cancelled) return
      try {
        setSvg(bwip.current.toSVG(options))
        setError("")
      } catch (e) {
        setSvg("")
        setError(String((e as Error).message ?? e).replace(/^bwipp?\.\w+:\s*/, ""))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [options, text])

  const downloadPng = () => {
    if (!bwip.current) return
    const canvas = document.createElement("canvas")
    bwip.current.toCanvas(canvas, { ...options, scale: Math.max(scale, 4) })
    downloadDataUrl(canvas.toDataURL("image/png"), `barcode-${format}.png`)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Panel title="Barcode">
          <div className="grid gap-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
            <Field label="Format">
              <Select
                value={format}
                onValueChange={(v) => {
                  const f = FORMATS.find((x) => x.id === v)!
                  setFormat(f.id)
                  setText(f.sample)
                }}
              >
                <SelectTrigger className="w-full" aria-label="Format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Data" htmlFor="data" hint={meta.hint}>
              <Input id="data" value={text} onChange={(e) => setText(e.target.value)} className="font-mono" aria-invalid={!!error || undefined} />
            </Field>
          </div>
        </Panel>
        <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border bg-card p-6 shadow-xs">
          {svg ? (
            <div className="w-full max-w-xl [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-h-80 [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`${meta.name} barcode`} />
          ) : error ? (
            <Message className="max-w-md">{error}</Message>
          ) : (
            <p className="text-sm text-muted-foreground">Enter data to generate a barcode</p>
          )}
        </div>
      </div>

      <Panel title="Options" className="h-fit">
        <div className="space-y-5">
          <Field label={`Module size: ${scale}`}>
            <Slider value={[scale]} min={1} max={8} step={1} onValueChange={(v) => setScale(v[0])} aria-label="Scale" />
          </Field>
          {meta.linear && (
            <>
              <Field label={`Bar height: ${height} mm`}>
                <Slider value={[height]} min={5} max={40} step={1} onValueChange={(v) => setHeight(v[0])} aria-label="Bar height" />
              </Field>
              <OptionSwitch id="show-text" label="Show text below" checked={showText} onChange={setShowText} />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bars" htmlFor="fg">
              <input id="fg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border bg-transparent" />
            </Field>
            <Field label="Background" htmlFor="bgc">
              <input id="bgc" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border bg-transparent" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={downloadPng} disabled={!svg}>
              <Download /> PNG
            </Button>
            <Button variant="outline" onClick={() => downloadText(svg, `barcode-${format}.svg`, "image/svg+xml")} disabled={!svg}>
              <Download /> SVG
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
