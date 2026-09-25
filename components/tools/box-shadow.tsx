"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CopyButton, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

type Layer = { id: number; x: number; y: number; blur: number; spread: number; color: string; opacity: number; inset: boolean }

const PRESETS: { name: string; layers: Omit<Layer, "id">[] }[] = [
  { name: "Subtle", layers: [{ x: 0, y: 1, blur: 3, spread: 0, color: "#000000", opacity: 10, inset: false }, { x: 0, y: 1, blur: 2, spread: -1, color: "#000000", opacity: 10, inset: false }] },
  { name: "Medium", layers: [{ x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, inset: false }, { x: 0, y: 2, blur: 4, spread: -2, color: "#000000", opacity: 10, inset: false }] },
  { name: "Large", layers: [{ x: 0, y: 20, blur: 25, spread: -5, color: "#000000", opacity: 10, inset: false }, { x: 0, y: 8, blur: 10, spread: -6, color: "#000000", opacity: 10, inset: false }] },
  { name: "Floating", layers: [{ x: 0, y: 25, blur: 50, spread: -12, color: "#000000", opacity: 25, inset: false }] },
  { name: "Glow", layers: [{ x: 0, y: 0, blur: 24, spread: 2, color: "#6366f1", opacity: 55, inset: false }] },
  { name: "Inset", layers: [{ x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 12, inset: true }] },
  { name: "Hard", layers: [{ x: 6, y: 6, blur: 0, spread: 0, color: "#111827", opacity: 100, inset: false }] },
  { name: "Neumorphic", layers: [{ x: 8, y: 8, blur: 16, spread: 0, color: "#a3a9b8", opacity: 60, inset: false }, { x: -8, y: -8, blur: 16, spread: 0, color: "#ffffff", opacity: 90, inset: false }] },
]

let nextId = 10
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a}%)`
}

function Row({ label, value, min, max, onChange, unit = "px" }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={(v) => onChange(v[0])} aria-label={label} />
      <span className="text-right font-mono tabular-nums">
        {value}
        {unit}
      </span>
    </div>
  )
}

export default function BoxShadow() {
  const [layers, setLayers] = React.useState<Layer[]>(PRESETS[2].layers.map((l) => ({ ...l, id: nextId++ })))
  const [active, setActive] = React.useState(layers[0].id)
  const [surface, setSurface] = React.useState<"light" | "dark">("light")
  const [radius, setRadius] = React.useState(16)

  const value = layers.map((l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l.color, l.opacity)}`).join(",\n  ")
  const css = `box-shadow: ${value};`
  const cur = layers.find((l) => l.id === active) ?? layers[0]
  const set = (patch: Partial<Layer>) => setLayers((ls) => ls.map((l) => (l.id === cur.id ? { ...l, ...patch } : l)))

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-4">
        <div className={cn("flex h-80 items-center justify-center rounded-xl border sm:h-96", surface === "light" ? "bg-[#eef0f4]" : "bg-[#1b1d26]")}>
          <div className={cn("size-44 sm:size-52", surface === "light" ? (layers.some((l) => l.color === "#ffffff") ? "bg-[#eef0f4]" : "bg-white") : "bg-[#262935]")} style={{ boxShadow: layers.map((l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l.color, l.opacity)}`).join(", "), borderRadius: radius }} />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Segmented ariaLabel="Preview background" size="sm" value={surface} onChange={setSurface} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
          <div className="w-56">
            <Row label="Radius" value={radius} min={0} max={100} onChange={setRadius} />
          </div>
        </div>
        <Panel title="CSS" actions={<CopyButton value={css} />}>
          <pre className="scroll-thin overflow-x-auto font-mono text-[13px] whitespace-pre-wrap">{css}</pre>
          <div className="mt-3">
            <CopyButton value={`shadow-[${layers.map((l) => `${l.inset ? "inset_" : ""}${l.x}px_${l.y}px_${l.blur}px_${l.spread}px_${rgba(l.color, l.opacity).replace(/ /g, "_")}`).join(",")}]`} label="Copy Tailwind class" variant="ghost" />
          </div>
        </Panel>
        <Panel title="Presets">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  const ls = p.layers.map((l) => ({ ...l, id: nextId++ }))
                  setLayers(ls)
                  setActive(ls[0].id)
                }}
                className="group flex flex-col items-center gap-2 rounded-lg p-2 outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="size-10 rounded-lg bg-white" style={{ boxShadow: p.layers.map((l) => `${l.inset ? "inset " : ""}${l.x / 2}px ${l.y / 2}px ${l.blur / 2}px ${l.spread / 2}px ${rgba(l.color, l.opacity)}`).join(", ") }} />
                <span className="text-[11px] text-muted-foreground">{p.name}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Layers"
        className="h-fit"
        actions={
          <Button
            size="sm"
            variant="ghost"
            disabled={layers.length >= 6}
            onClick={() => {
              const l = { ...cur, id: nextId++ }
              setLayers((ls) => [...ls, l])
              setActive(l.id)
            }}
          >
            <Plus /> Add
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          {layers.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setActive(l.id)}
              className={cn("h-7 rounded-md border px-2.5 text-xs font-medium", l.id === cur.id ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground")}
            >
              Layer {i + 1}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <Row label="X offset" value={cur.x} min={-100} max={100} onChange={(x) => set({ x })} />
          <Row label="Y offset" value={cur.y} min={-100} max={100} onChange={(y) => set({ y })} />
          <Row label="Blur" value={cur.blur} min={0} max={150} onChange={(blur) => set({ blur })} />
          <Row label="Spread" value={cur.spread} min={-50} max={50} onChange={(spread) => set({ spread })} />
          <Row label="Opacity" value={cur.opacity} min={0} max={100} unit="%" onChange={(opacity) => set({ opacity })} />
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Color
              <input type="color" value={cur.color} onChange={(e) => set({ color: e.target.value })} className="h-8 w-12 cursor-pointer rounded-md border bg-transparent" />
            </label>
            <OptionSwitch id="inset" label="Inset" checked={cur.inset} onChange={(inset) => set({ inset })} />
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Delete layer"
              disabled={layers.length <= 1}
              onClick={() => {
                const rest = layers.filter((l) => l.id !== cur.id)
                setLayers(rest)
                setActive(rest[0].id)
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
