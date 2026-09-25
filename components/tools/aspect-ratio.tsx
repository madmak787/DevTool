"use client"

import * as React from "react"
import { Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CopyButton, Field, Panel, ValueRow } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const COMMON: [string, number, number, string][] = [
  ["16:9", 16, 9, "HD video, YouTube, monitors"],
  ["9:16", 9, 16, "Stories, Reels, TikTok"],
  ["4:3", 4, 3, "Classic TV, iPad"],
  ["3:2", 3, 2, "DSLR photos"],
  ["1:1", 1, 1, "Instagram posts, avatars"],
  ["4:5", 4, 5, "Instagram portrait"],
  ["21:9", 21, 9, "Ultrawide, cinema"],
  ["1.91:1", 1.91, 1, "Open Graph / link previews"],
]

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

export default function AspectRatio() {
  const [w, setW] = React.useState("1920")
  const [h, setH] = React.useState("1080")
  const [rw, setRw] = React.useState("16")
  const [rh, setRh] = React.useState("9")
  const [newW, setNewW] = React.useState("1280")
  const [newH, setNewH] = React.useState("")
  const [last, setLast] = React.useState<"w" | "h">("w")

  const W = Number(w)
  const H = Number(h)
  const valid = W > 0 && H > 0
  const g = valid && Number.isInteger(W) && Number.isInteger(H) ? gcd(W, H) : 1
  const simplified = valid ? (Number.isInteger(W) && Number.isInteger(H) ? `${W / g}:${H / g}` : `${(W / H).toFixed(3)}:1`) : ""

  const RW = Number(rw)
  const RH = Number(rh)
  const ratioOk = RW > 0 && RH > 0
  const calcH = ratioOk && Number(newW) > 0 ? Math.round((Number(newW) * RH) / RW) : null
  const calcW = ratioOk && Number(newH) > 0 ? Math.round((Number(newH) * RW) / RH) : null

  const previewRatio = ratioOk ? RW / RH : 16 / 9

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Panel title="Resize with a fixed ratio">
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <Field label="Ratio width" htmlFor="rw">
                <Input id="rw" value={rw} onChange={(e) => setRw(e.target.value)} inputMode="decimal" className="w-24 font-mono" />
              </Field>
              <span className="pb-2 text-lg text-muted-foreground">:</span>
              <Field label="Ratio height" htmlFor="rh">
                <Input id="rh" value={rh} onChange={(e) => setRh(e.target.value)} inputMode="decimal" className="w-24 font-mono" />
              </Field>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
              <Field label="Width" htmlFor="nw">
                <Input
                  id="nw"
                  value={last === "w" ? newW : (calcW ?? "").toString()}
                  onChange={(e) => {
                    setLast("w")
                    setNewW(e.target.value)
                  }}
                  inputMode="numeric"
                  className={cn("h-11 font-mono text-lg", last === "h" && "bg-primary/5 text-primary")}
                />
              </Field>
              <Lock className="mb-3.5 size-4 text-muted-foreground" aria-label="Proportions locked" />
              <Field label="Height" htmlFor="nh">
                <Input
                  id="nh"
                  value={last === "h" ? newH : (calcH ?? "").toString()}
                  onChange={(e) => {
                    setLast("h")
                    setNewH(e.target.value)
                  }}
                  inputMode="numeric"
                  className={cn("h-11 font-mono text-lg", last === "w" && "bg-primary/5 text-primary")}
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">Type a width or a height; the other is calculated.</p>
          </div>
        </Panel>
        <Panel title="Find the ratio of a size">
          <div className="flex items-end gap-2">
            <Field label="Width" htmlFor="w">
              <Input id="w" value={w} onChange={(e) => setW(e.target.value)} inputMode="numeric" className="w-32 font-mono" />
            </Field>
            <span className="pb-2 text-muted-foreground">×</span>
            <Field label="Height" htmlFor="h">
              <Input id="h" value={h} onChange={(e) => setH(e.target.value)} inputMode="numeric" className="w-32 font-mono" />
            </Field>
          </div>
          <div className="mt-3">
            <ValueRow label="Aspect ratio" value={simplified} />
            <ValueRow label="Decimal" value={valid ? String(Number((W / H).toFixed(4))) : ""} />
            <ValueRow label="CSS" value={valid ? `aspect-ratio: ${simplified.replace(":", " / ")};` : ""} />
          </div>
        </Panel>
      </div>
      <div className="space-y-4">
        <Panel title="Preview">
          <div className="flex h-64 items-center justify-center rounded-lg bg-muted/30 p-4">
            <div
              className="flex max-h-full max-w-full items-center justify-center rounded-md border-2 border-primary/50 bg-primary/10 font-mono text-sm text-primary"
              style={{ aspectRatio: previewRatio, width: previewRatio >= 1 ? "100%" : "auto", height: previewRatio < 1 ? "100%" : "auto" }}
            >
              {rw}:{rh}
            </div>
          </div>
        </Panel>
        <Panel title="Common ratios" bodyClassName="p-0">
          {COMMON.map(([label, a, b, use]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setRw(String(a))
                setRh(String(b))
              }}
              className={cn("flex w-full items-center gap-3 border-b px-4 py-2 text-left text-sm last:border-b-0 hover:bg-accent/50", rw === String(a) && rh === String(b) && "bg-accent/60")}
            >
              <span className="w-14 font-mono font-semibold text-primary">{label}</span>
              <span className="flex-1 text-muted-foreground">{use}</span>
            </button>
          ))}
          <div className="border-t px-4 py-2">
            <CopyButton value={`${rw}:${rh}`} label="Copy ratio" variant="ghost" />
          </div>
        </Panel>
      </div>
    </div>
  )
}
