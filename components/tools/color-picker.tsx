"use client"

import * as React from "react"
import { Pipette, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CopyButton, Field, Panel, ValueRow } from "@/components/tool-kit"
import { contrast, formats, parseColor, scale, toHex, type RGBA } from "@/lib/color"
import { cn } from "@/lib/utils"

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }

function ContrastBadge({ ratio, min, label }: { ratio: number; min: number; label: string }) {
  const pass = ratio >= min
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", pass ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}>
      {label} {pass ? "✓" : "✗"}
    </span>
  )
}

function ColorInput({ id, value, onChange, color }: { id: string; value: string; onChange: (v: string) => void; color: RGBA | null }) {
  return (
    <div className="flex gap-2">
      <label className="checkerboard relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-xs" title="Open color picker">
        <span className="absolute inset-0" style={{ background: color ? formats(color).rgb : "transparent" }} />
        <input
          type="color"
          value={color ? toHex(color, false) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Color picker"
        />
      </label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 font-mono" spellCheck={false} autoComplete="off" aria-invalid={!color || undefined} />
    </div>
  )
}

export default function ColorPicker() {
  const [text, setText] = React.useState("#6366f1")
  const [bgText, setBgText] = React.useState("#ffffff")
  const [last, setLast] = React.useState<RGBA>({ r: 99, g: 102, b: 241, a: 1 })
  const parsed = React.useMemo(() => parseColor(text), [text])
  const bg = React.useMemo(() => parseColor(bgText), [bgText])

  React.useEffect(() => {
    if (parsed) setLast(parsed)
  }, [parsed])

  const color = parsed ?? last
  const f = formats(color)
  const ratio = bg ? contrast({ ...color, a: 1 }, bg) : null
  const onWhite = contrast(color, { r: 255, g: 255, b: 255, a: 1 })
  const onBlack = contrast(color, { r: 0, g: 0, b: 0, a: 1 })
  const textOn = onWhite > onBlack ? "#fff" : "#000"
  const [hasEyeDropper, setHasEyeDropper] = React.useState(false)
  React.useEffect(() => setHasEyeDropper("EyeDropper" in window), [])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="space-y-4">
        <Panel bodyClassName="p-0">
          <div className="checkerboard overflow-hidden rounded-t-xl">
            <div className="flex h-44 items-end justify-between p-4" style={{ background: f.rgb, color: textOn }}>
              <span className="font-mono text-2xl font-semibold tracking-tight">{f.hex.toUpperCase()}</span>
              <span className="text-xs font-medium opacity-80">{Math.round(Math.max(onWhite, onBlack) * 10) / 10}:1 text contrast</span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <Field label="Color" htmlFor="color" hint="HEX, rgb(), hsl(), hwb(), oklch() or a CSS color name">
              <ColorInput id="color" value={text} onChange={setText} color={parsed} />
            </Field>
            <div className="flex gap-2">
              {hasEyeDropper && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const r = await new (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper().open()
                      setText(r.sRGBHex)
                    } catch {
                      // user cancelled
                    }
                  }}
                >
                  <Pipette /> Pick from screen
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setText(`#${Array.from(crypto.getRandomValues(new Uint8Array(3)), (b) => b.toString(16).padStart(2, "0")).join("")}`)}
              >
                <Shuffle /> Random
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Contrast checker">
          <div className="space-y-3">
            <Field label="Background" htmlFor="bg">
              <ColorInput id="bg" value={bgText} onChange={setBgText} color={bg} />
            </Field>
            {bg && ratio && (
              <>
                <div className="rounded-lg border p-4" style={{ background: formats(bg).rgb, color: f.rgb }}>
                  <p className="text-lg font-semibold">Large heading text</p>
                  <p className="text-sm">Body text looks like this at normal size.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-2 text-2xl font-semibold tabular-nums">{ratio.toFixed(2)}:1</span>
                  <ContrastBadge ratio={ratio} min={4.5} label="AA" />
                  <ContrastBadge ratio={ratio} min={3} label="AA large" />
                  <ContrastBadge ratio={ratio} min={7} label="AAA" />
                  <ContrastBadge ratio={ratio} min={4.5} label="AAA large" />
                </div>
              </>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Formats" bodyClassName="py-1">
          <ValueRow label="HEX" value={f.hex} />
          <ValueRow label="RGB" value={f.rgb} />
          <ValueRow label="HSL" value={f.hsl} />
          <ValueRow label="OKLCH" value={f.oklch} />
          <ValueRow label="HSV" value={f.hsv} />
          <ValueRow label="CMYK" value={f.cmyk} />
          <ValueRow label="CSS variable" value={`--color-primary: ${f.hex};`} />
        </Panel>
        <Panel title="Tints and shades" description="Click a swatch to use it">
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
            {scale(color).map((s) => {
              const hex = toHex(s.color, false)
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setText(hex)}
                  title={`${s.name}: ${hex}`}
                  className="group flex flex-col items-center gap-1 outline-none"
                >
                  <span className="h-12 w-full rounded-md border shadow-xs transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring" style={{ background: hex }} />
                  <span className="text-[10px] text-muted-foreground">{s.name}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <CopyButton
              value={scale(color)
                .map((s) => `--color-${s.name}: ${toHex(s.color, false)};`)
                .join("\n")}
              label="Copy as CSS variables"
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}
