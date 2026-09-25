"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { CopyButton, Field, Panel } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

type Unit = "px" | "rem" | "em" | "pt" | "vw" | "vh" | "%"
const UNITS: { id: Unit; label: string }[] = [
  { id: "px", label: "Pixels" },
  { id: "rem", label: "Root em" },
  { id: "em", label: "Em (parent font)" },
  { id: "pt", label: "Points" },
  { id: "vw", label: "Viewport width" },
  { id: "vh", label: "Viewport height" },
  { id: "%", label: "Percent of parent" },
]

const round = (n: number) => String(Number(n.toFixed(4)))

export default function CssUnits() {
  const [value, setValue] = React.useState("24")
  const [unit, setUnit] = React.useState<Unit>("px")
  const [root, setRoot] = React.useState("16")
  const [parent, setParent] = React.useState("16")
  const [vw, setVw] = React.useState("1440")
  const [vh, setVh] = React.useState("900")
  const [parentWidth, setParentWidth] = React.useState("1200")

  const ctx = { root: Number(root) || 16, parent: Number(parent) || 16, vw: Number(vw) || 1440, vh: Number(vh) || 900, pw: Number(parentWidth) || 1200 }
  const perPx: Record<Unit, number> = {
    px: 1,
    rem: ctx.root,
    em: ctx.parent,
    pt: 96 / 72,
    vw: ctx.vw / 100,
    vh: ctx.vh / 100,
    "%": ctx.pw / 100,
  }
  const n = Number(value)
  const valid = value.trim() !== "" && Number.isFinite(n)
  const px = valid ? n * perPx[unit] : null

  const table = [4, 8, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64]

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <Panel>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Value" htmlFor="val">
              <Input id="val" value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" className="h-12 w-36 font-mono text-xl" />
            </Field>
            <div className="flex flex-wrap gap-1.5 pb-1.5">
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnit(u.id)}
                  aria-pressed={unit === u.id}
                  className={cn("h-9 rounded-md border px-3 font-mono text-sm", unit === u.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}
                >
                  {u.id}
                </button>
              ))}
            </div>
          </div>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {UNITS.map((u) => {
            const v = px !== null ? `${round(px / perPx[u.id])}${u.id}` : ""
            return (
              <div key={u.id} className={cn("flex items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 shadow-xs", u.id === unit && "border-primary/40 bg-primary/5")}>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{u.label}</div>
                  <div className="truncate font-mono text-lg font-semibold">{v || "—"}</div>
                </div>
                <CopyButton value={v} iconOnly variant="ghost" />
              </div>
            )
          })}
        </div>
        <Panel title={`px ↔ rem at ${ctx.root}px root`} bodyClassName="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {table.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setValue(String(p))
                  setUnit("px")
                }}
                className="flex justify-between border-b px-4 py-2 text-left font-mono text-sm hover:bg-accent/50 sm:[&:not(:nth-child(4n))]:border-r [&:not(:nth-child(2n))]:border-r"
              >
                <span>{p}px</span>
                <span className="text-primary">{round(p / ctx.root)}rem</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Context" className="h-fit">
        <div className="grid gap-4">
          <Field label="Root font size (px)" htmlFor="root" hint="Browsers default to 16px.">
            <Input id="root" type="number" value={root} onChange={(e) => setRoot(e.target.value)} />
          </Field>
          <Field label="Parent font size (px), for em" htmlFor="parent">
            <Input id="parent" type="number" value={parent} onChange={(e) => setParent(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Viewport width" htmlFor="vw">
              <Input id="vw" type="number" value={vw} onChange={(e) => setVw(e.target.value)} />
            </Field>
            <Field label="Viewport height" htmlFor="vh">
              <Input id="vh" type="number" value={vh} onChange={(e) => setVh(e.target.value)} />
            </Field>
          </div>
          <Field label="Parent width (px), for %" htmlFor="pw">
            <Input id="pw" type="number" value={parentWidth} onChange={(e) => setParentWidth(e.target.value)} />
          </Field>
        </div>
      </Panel>
    </div>
  )
}
