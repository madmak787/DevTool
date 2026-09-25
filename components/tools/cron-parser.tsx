"use client"

import * as React from "react"
import cronstrue from "cronstrue"
import { Input } from "@/components/ui/input"
import { CopyButton, Message, Panel } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const PRESETS: [string, string][] = [
  ["* * * * *", "Every minute"],
  ["*/5 * * * *", "Every 5 minutes"],
  ["0 * * * *", "Every hour"],
  ["0 0 * * *", "Every day at midnight"],
  ["30 9 * * 1-5", "Weekdays at 09:30"],
  ["0 0 * * 0", "Every Sunday"],
  ["0 0 1 * *", "First of the month"],
  ["0 3 1 1 *", "Every 1 January"],
]

const FIELDS = [
  { name: "Minute", min: 0, max: 59 },
  { name: "Hour", min: 0, max: 23 },
  { name: "Day of month", min: 1, max: 31 },
  { name: "Month", min: 1, max: 12, names: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] },
  { name: "Day of week", min: 0, max: 7, names: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] },
]

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
}

// Expand one field (a step like "every 15", a range "1-5", a list "mon,wed") into the set of values it allows
function expand(field: string, f: (typeof FIELDS)[number]): Set<number> {
  const out = new Set<number>()
  for (const part of field.toLowerCase().split(",")) {
    const [rangePart, stepPart] = part.split("/")
    const step = stepPart === undefined ? 1 : Number(stepPart)
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step “${part}” in ${f.name.toLowerCase()}`)
    const val = (s: string) => {
      const i = f.names?.indexOf(s) ?? -1
      const n = i >= 0 ? i + f.min : Number(s)
      if (!/^\d+$/.test(s) && i < 0) throw new Error(`“${s}” isn’t valid in ${f.name.toLowerCase()}`)
      if (n < f.min || n > f.max) throw new Error(`${f.name} must be between ${f.min} and ${f.max}; got ${s}`)
      return n
    }
    let lo: number, hi: number
    if (rangePart === "*" || rangePart === "?") [lo, hi] = [f.min, f.max]
    else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-")
      ;[lo, hi] = [val(a), val(b)]
      if (lo > hi) throw new Error(`Range ${rangePart} runs backwards`)
    } else {
      lo = val(rangePart)
      hi = stepPart === undefined ? lo : f.max
    }
    for (let v = lo; v <= hi; v += step) out.add(v)
  }
  return out
}

function nextRuns(expr: string, count: number, from = new Date()) {
  const parts = expr.split(/\s+/)
  const [min, hour, dom, mon, dow] = parts.map((p, i) => expand(p, FIELDS[i]))
  if (dow.has(7)) dow.add(0)
  const domAny = parts[2] === "*" || parts[2] === "?"
  const dowAny = parts[4] === "*" || parts[4] === "?"
  const runs: Date[] = []
  const d = new Date(from)
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  // Step minute by minute, skipping whole days/hours that can't match; bounded to about 5 years
  for (let guard = 0; guard < 600_000 && runs.length < count; guard++) {
    if (!mon.has(d.getMonth() + 1)) {
      d.setMonth(d.getMonth() + 1, 1)
      d.setHours(0, 0, 0, 0)
      continue
    }
    // Standard cron: when both day fields are restricted, either may match
    const dayOk = domAny && dowAny ? true : domAny ? dow.has(d.getDay()) : dowAny ? dom.has(d.getDate()) : dom.has(d.getDate()) || dow.has(d.getDay())
    if (!dayOk) {
      d.setDate(d.getDate() + 1)
      d.setHours(0, 0, 0, 0)
      continue
    }
    if (!hour.has(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0)
      continue
    }
    if (min.has(d.getMinutes())) runs.push(new Date(d))
    d.setMinutes(d.getMinutes() + 1)
  }
  return runs
}

export default function CronParser() {
  const [expr, setExpr] = React.useState("30 9 * * 1-5")
  const [now, setNow] = React.useState<Date | null>(null)
  React.useEffect(() => setNow(new Date()), [])

  const result = React.useMemo(() => {
    const raw = expr.trim().replace(/\s+/g, " ")
    if (!raw) return null
    const normalized = MACROS[raw.toLowerCase()] ?? raw
    const parts = normalized.split(" ")
    if (parts.length !== 5) return { error: `A cron expression has 5 fields (minute hour day month weekday); this has ${parts.length}.` }
    try {
      // Validate each field ourselves first: the messages are clearer than cronstrue's
      parts.forEach((p, i) => expand(p, FIELDS[i]))
      const description = cronstrue.toString(normalized, { use24HourTimeFormat: true, verbose: true })
      const runs = now ? nextRuns(normalized, 8, now) : []
      return { description, runs, parts }
    } catch (e) {
      return { error: String((e as Error).message ?? e).replace(/^Error: /, "") }
    }
  }, [expr, now])

  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div className="space-y-4">
      <Panel>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              className="h-12 text-center font-mono text-xl tracking-widest"
              spellCheck={false}
              aria-label="Cron expression"
              aria-invalid={!!result?.error || undefined}
            />
            <CopyButton value={expr.trim()} iconOnly size="default" />
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-[11px] text-muted-foreground">
            {FIELDS.map((f, i) => (
              <div key={f.name} className={cn("rounded-md border px-1 py-1.5", result && "parts" in result && "bg-muted/40")}>
                <div className="font-mono text-sm text-foreground">{result && "parts" in result ? result.parts![i] : "·"}</div>
                {f.name}
              </div>
            ))}
          </div>
          {result?.error ? (
            <Message>{result.error}</Message>
          ) : result ? (
            <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-lg font-medium text-primary">“{result.description}”</p>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Next runs (your local time)" bodyClassName="p-0">
          {result && "runs" in result && result.runs!.length > 0 ? (
            <ol className="text-sm">
              {result.runs!.map((r, i) => (
                <li key={i} className="flex justify-between gap-3 border-b px-4 py-2 last:border-b-0">
                  <span className="text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="font-mono tabular-nums">{fmt.format(r)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">{result?.error ? "Fix the expression to see run times." : "This schedule never runs in the next few years."}</p>
          )}
        </Panel>
        <Panel title="Presets" bodyClassName="p-0">
          {PRESETS.map(([e, label]) => (
            <button
              key={e}
              type="button"
              onClick={() => setExpr(e)}
              className={cn("flex w-full items-center justify-between gap-3 border-b px-4 py-2 text-left text-sm last:border-b-0 hover:bg-accent/50", expr.trim() === e && "bg-accent/60")}
            >
              <span>{label}</span>
              <code className="font-mono text-muted-foreground">{e}</code>
            </button>
          ))}
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            Syntax: <code className="font-mono">*</code> any, <code className="font-mono">,</code> list, <code className="font-mono">-</code> range, <code className="font-mono">/</code> step. Macros like <code className="font-mono">@daily</code> work too.
          </p>
        </Panel>
      </div>
    </div>
  )
}
