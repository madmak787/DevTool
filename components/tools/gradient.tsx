"use client"

import * as React from "react"
import { Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { CopyButton, Field, Panel, Segmented } from "@/components/tool-kit"
import { parseColor, toHex } from "@/lib/color"
import { randomInt } from "@/lib/text"

type Kind = "linear" | "radial" | "conic"
type Stop = { id: number; color: string; pos: number }

const PRESETS: { name: string; kind: Kind; angle: number; stops: [string, number][] }[] = [
  { name: "Indigo", kind: "linear", angle: 135, stops: [["#6366f1", 0], ["#a855f7", 100]] },
  { name: "Sunset", kind: "linear", angle: 90, stops: [["#f97316", 0], ["#ec4899", 55], ["#8b5cf6", 100]] },
  { name: "Ocean", kind: "linear", angle: 160, stops: [["#0ea5e9", 0], ["#2563eb", 100]] },
  { name: "Mint", kind: "linear", angle: 120, stops: [["#34d399", 0], ["#06b6d4", 100]] },
  { name: "Peach", kind: "linear", angle: 45, stops: [["#fde68a", 0], ["#fca5a5", 100]] },
  { name: "Night", kind: "linear", angle: 180, stops: [["#0f172a", 0], ["#334155", 100]] },
  { name: "Glow", kind: "radial", angle: 0, stops: [["#fef3c7", 0], ["#f59e0b", 45], ["#7c2d12", 100]] },
  { name: "Wheel", kind: "conic", angle: 0, stops: [["#ef4444", 0], ["#eab308", 25], ["#22c55e", 50], ["#3b82f6", 75], ["#ef4444", 100]] },
]

let nextId = 10

export default function GradientTool() {
  const [kind, setKind] = React.useState<Kind>("linear")
  const [angle, setAngle] = React.useState(135)
  const [shape, setShape] = React.useState<"circle" | "ellipse">("circle")
  const [stops, setStops] = React.useState<Stop[]>([
    { id: 1, color: "#6366f1", pos: 0 },
    { id: 2, color: "#a855f7", pos: 100 },
  ])

  const valid = (c: string) => parseColor(c) !== null
  const sorted = [...stops].filter((s) => valid(s.color)).sort((a, b) => a.pos - b.pos)
  const list = sorted.map((s) => `${s.color} ${s.pos}%`).join(", ")
  const value =
    kind === "linear"
      ? `linear-gradient(${angle}deg, ${list})`
      : kind === "radial"
        ? `radial-gradient(${shape} at center, ${list})`
        : `conic-gradient(from ${angle}deg at center, ${list})`
  const css = `background: ${value};`

  const update = (id: number, patch: Partial<Stop>) => setStops((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const addStop = () => {
    const a = sorted[sorted.length - 2] ?? sorted[0]
    const b = sorted[sorted.length - 1]
    const pos = a && b ? Math.round((a.pos + b.pos) / 2) : 50
    setStops((s) => [...s, { id: nextId++, color: b?.color ?? "#ffffff", pos }])
  }
  const randomize = () => {
    const rand = () => toHex({ r: randomInt(256), g: randomInt(256), b: randomInt(256), a: 1 }, false)
    setAngle(randomInt(360))
    setStops([
      { id: nextId++, color: rand(), pos: 0 },
      { id: nextId++, color: rand(), pos: 100 },
    ])
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-4">
        <div className="checkerboard overflow-hidden rounded-xl border shadow-xs">
          <div className="h-72 sm:h-96" style={{ background: value }} />
        </div>
        <Panel title="CSS" actions={<CopyButton value={css} />}>
          <pre className="scroll-thin overflow-x-auto font-mono text-[13px] whitespace-pre-wrap break-all">{css}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton value={value} label="Copy value only" variant="ghost" />
            <CopyButton value={`bg-[${value.replace(/\s+/g, "_")}]`} label="Copy Tailwind class" variant="ghost" />
          </div>
        </Panel>
        <Panel title="Presets">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {PRESETS.map((p) => {
              const l = p.stops.map(([c, pos]) => `${c} ${pos}%`).join(", ")
              const bg = p.kind === "linear" ? `linear-gradient(${p.angle}deg, ${l})` : p.kind === "radial" ? `radial-gradient(circle, ${l})` : `conic-gradient(${l})`
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setKind(p.kind)
                    setAngle(p.angle)
                    setStops(p.stops.map(([color, pos]) => ({ id: nextId++, color, pos })))
                  }}
                  className="group flex flex-col items-center gap-1 outline-none"
                >
                  <span className="aspect-square w-full rounded-lg border shadow-xs transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring" style={{ background: bg }} />
                  <span className="text-[11px] text-muted-foreground">{p.name}</span>
                </button>
              )
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Settings" className="h-fit" actions={<Button size="sm" variant="ghost" onClick={randomize}><Shuffle /> Random</Button>}>
        <div className="space-y-5">
          <Segmented
            ariaLabel="Type"
            value={kind}
            onChange={setKind}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
              { value: "conic", label: "Conic" },
            ]}
          />
          {kind === "radial" ? (
            <Segmented
              ariaLabel="Shape"
              size="sm"
              value={shape}
              onChange={setShape}
              options={[
                { value: "circle", label: "Circle" },
                { value: "ellipse", label: "Ellipse" },
              ]}
            />
          ) : (
            <Field label={`${kind === "linear" ? "Angle" : "Start angle"}: ${angle}°`}>
              <Slider value={[angle]} min={0} max={360} step={1} onValueChange={(v) => setAngle(v[0])} aria-label="Angle" />
            </Field>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Color stops</span>
              <Button size="sm" variant="ghost" onClick={addStop} disabled={stops.length >= 8}>
                <Plus /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {stops.map((s) => {
                const c = parseColor(s.color)
                return (
                  <div key={s.id} className="space-y-2 rounded-lg border p-2.5">
                    <div className="flex items-center gap-2">
                      <label className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-md border" style={{ background: c ? s.color : "transparent" }}>
                        <input type="color" value={c ? toHex(c, false) : "#000000"} onChange={(e) => update(s.id, { color: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Stop color" />
                      </label>
                      <Input value={s.color} onChange={(e) => update(s.id, { color: e.target.value })} className="h-8 font-mono text-xs" aria-invalid={!c || undefined} aria-label="Stop color value" />
                      <Input type="number" min={0} max={100} value={s.pos} onChange={(e) => update(s.id, { pos: Math.min(100, Math.max(0, Number(e.target.value))) })} className="h-8 w-16 text-xs" aria-label="Stop position" />
                      <Button size="icon-sm" variant="ghost" onClick={() => setStops((all) => all.filter((x) => x.id !== s.id))} disabled={stops.length <= 2} aria-label="Remove stop">
                        <Trash2 />
                      </Button>
                    </div>
                    <Slider value={[s.pos]} min={0} max={100} step={1} onValueChange={(v) => update(s.id, { pos: v[0] })} aria-label="Stop position" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
