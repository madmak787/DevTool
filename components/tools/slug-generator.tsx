"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { CodeArea, CopyButton, Field, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"

const STOP = new Set("a an and are as at be but by for from in into is it of on or so than that the to was with".split(" "))
const SPECIAL: Record<string, string> = { ß: "ss", æ: "ae", œ: "oe", ø: "o", đ: "d", ð: "d", þ: "th", ł: "l", "&": " and ", "@": " at ", "%": " percent " }

export function slugify(text: string, o: { sep: string; lower: boolean; stop: boolean; max: number }) {
  let s = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ßæœøđðþł&@%]/gi, (c) => SPECIAL[c.toLowerCase()] ?? c)
  if (o.lower) s = s.toLowerCase()
  let words = s.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  if (o.stop && words.length > 1) {
    const kept = words.filter((w) => !STOP.has(w.toLowerCase()))
    if (kept.length) words = kept
  }
  let slug = words.join(o.sep)
  if (o.max > 0 && slug.length > o.max) {
    // Cut at a word boundary where possible
    const cut = slug.slice(0, o.max + 1)
    const at = cut.lastIndexOf(o.sep)
    slug = at > o.max / 2 ? cut.slice(0, at) : slug.slice(0, o.max)
  }
  return slug
}

export default function SlugGenerator() {
  const [text, setText] = React.useState("10 Tips & Tricks for Writing Clean Code in 2026 — Ça Marche!")
  const [sep, setSep] = React.useState<"-" | "_" | ".">("-")
  const [lower, setLower] = React.useState(true)
  const [stop, setStop] = React.useState(false)
  const [max, setMax] = React.useState("80")
  const [bulk, setBulk] = React.useState("")

  const opts = { sep, lower, stop, max: Number.parseInt(max) || 0 }
  const slug = slugify(text, opts)
  const bulkOut = bulk
    .split("\n")
    .map((l) => (l.trim() ? slugify(l, opts) : ""))
    .join("\n")

  return (
    <div className="space-y-4">
      <Panel>
        <div className="space-y-4">
          <Field label="Title or text" htmlFor="text">
            <Input id="text" value={text} onChange={(e) => setText(e.target.value)} className="h-11 text-base" />
          </Field>
          <div className="flex items-center gap-2 rounded-lg border bg-primary/5 px-4 py-3">
            <code className="min-w-0 flex-1 truncate font-mono text-base text-primary">{slug || <span className="text-muted-foreground">—</span>}</code>
            <span className="text-xs text-muted-foreground tabular-nums">{slug.length} chars</span>
            <CopyButton value={slug} />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Segmented
              ariaLabel="Separator"
              size="sm"
              value={sep}
              onChange={setSep}
              options={[
                { value: "-", label: "hyphen -" },
                { value: "_", label: "underscore _" },
                { value: ".", label: "dot ." },
              ]}
            />
            <OptionSwitch id="lower" label="Lowercase" checked={lower} onChange={setLower} />
            <OptionSwitch id="stop" label="Remove words like “the”, “and”" checked={stop} onChange={setStop} />
            <label className="flex items-center gap-2 text-sm">
              Max length
              <Input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} className="h-8 w-20" aria-label="Maximum length (0 for none)" />
            </label>
          </div>
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Many titles" description="One per line">
          <CodeArea mono={false} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Hello World\nWhat’s new in Next.js 16?"} className="h-56 resize-y" aria-label="Titles, one per line" />
        </Panel>
        <Panel title="Slugs" actions={<CopyButton value={bulkOut} />}>
          <CodeArea readOnly value={bulkOut} className="h-56 resize-y" aria-label="Slugs" />
        </Panel>
      </div>
    </div>
  )
}
