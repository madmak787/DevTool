"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton, Field, Message, Panel, Segmented, ValueRow } from "@/components/tool-kit"

type Unit = "auto" | "s" | "ms" | "us" | "ns"

function detectUnit(digits: string): Exclude<Unit, "auto"> {
  const n = digits.replace(/^-/, "").split(".")[0].length
  if (n <= 11) return "s"
  if (n <= 14) return "ms"
  if (n <= 17) return "us"
  return "ns"
}

const UNIT_LABEL = { s: "seconds", ms: "milliseconds", us: "microseconds", ns: "nanoseconds" }

function relative(ms: number) {
  const diff = ms - Date.now()
  const abs = Math.abs(diff)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31557600000],
    ["month", 2629800000],
    ["week", 604800000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
    ["second", 1000],
  ]
  const [unit, size] = units.find(([, s]) => abs >= s) ?? ["second", 1000]
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(diff / size), unit)
}

function inZone(ms: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(ms)
}

function isoInZone(ms: number, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(ms)
      .map((p) => [p.type, p.value]),
  )
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second)
  const offset = Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000)
  const sign = offset >= 0 ? "+" : "-"
  const o = Math.abs(offset)
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${String(Math.floor(o / 60)).padStart(2, "0")}:${String(o % 60).padStart(2, "0")}`
}

/** Value for <input type="datetime-local"> in the browser's own zone */
function toLocalInput(ms: number) {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function TimestampTool() {
  const [now, setNow] = React.useState<number | null>(null)
  const [paused, setPaused] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [unit, setUnit] = React.useState<Unit>("auto")
  const [dateText, setDateText] = React.useState("")
  const [zones, setZones] = React.useState<string[]>(["UTC"])
  const [zone, setZone] = React.useState("UTC")
  const [localZone, setLocalZone] = React.useState("UTC")

  React.useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone
    setLocalZone(local)
    setZone(local)
    const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? []
    setZones(["UTC", ...all.filter((z) => z !== "UTC")])
    const ms = Date.now()
    setNow(ms)
    setInput(String(Math.floor(ms / 1000)))
  }, [])

  React.useEffect(() => {
    if (paused) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [paused])

  const parsed = React.useMemo(() => {
    const s = input.trim().replace(/[_,\s]/g, "")
    if (!s) return null
    if (!/^-?\d+(\.\d+)?$/.test(s)) return { error: "A Unix timestamp is a number, e.g. 1767225600." }
    const u = unit === "auto" ? detectUnit(s) : unit
    const n = Number(s)
    const ms = u === "s" ? n * 1000 : u === "ms" ? n : u === "us" ? n / 1000 : n / 1e6
    if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) return { error: "That timestamp is outside the range JavaScript dates support." }
    return { ms, unit: u }
  }, [input, unit])

  const fromDate = React.useMemo(() => {
    if (!dateText.trim()) return null
    const ms = Date.parse(dateText)
    return Number.isNaN(ms) ? { error: "Couldn’t read that date. Try 2026-01-31 14:30, an ISO string or an RFC 2822 date." } : { ms }
  }, [dateText])

  const ms = parsed && "ms" in parsed ? parsed.ms! : null

  return (
    <div className="space-y-4">
      <Panel
        title="Current time"
        actions={
          <Button size="sm" variant="ghost" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play /> : <Pause />} {paused ? "Resume" : "Pause"}
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Unix seconds", now !== null ? String(Math.floor(now / 1000)) : ""],
            ["Milliseconds", now !== null ? String(now) : ""],
            ["ISO 8601 (UTC)", now !== null ? new Date(now).toISOString() : ""],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="truncate font-mono text-base font-semibold tabular-nums sm:text-lg">{value || "…"}</div>
              </div>
              <CopyButton value={value} iconOnly variant="ghost" label={`Copy ${label}`} />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Timestamp → date">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Unix timestamp" htmlFor="ts" className="min-w-48 flex-1">
                <Input id="ts" value={input} onChange={(e) => setInput(e.target.value)} inputMode="numeric" className="font-mono" aria-invalid={!!parsed?.error || undefined} />
              </Field>
              <Button variant="outline" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>
                Now
              </Button>
            </div>
            <Segmented
              ariaLabel="Unit"
              size="sm"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "auto", label: parsed && "unit" in parsed && unit === "auto" ? `Auto (${parsed.unit})` : "Auto" },
                { value: "s", label: "s" },
                { value: "ms", label: "ms" },
                { value: "us", label: "µs" },
                { value: "ns", label: "ns" },
              ]}
            />
            {parsed?.error && <Message>{parsed.error}</Message>}
            <Field label="Show in time zone">
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="w-full" aria-label="Time zone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>
                      {z === localZone ? `${z} (yours)` : z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-3">
            <ValueRow label={zone} value={ms !== null ? inZone(ms, zone) : ""} mono={false} />
            <ValueRow label="UTC" value={ms !== null ? inZone(ms, "UTC") : ""} mono={false} />
            <ValueRow label="ISO 8601" value={ms !== null ? new Date(ms).toISOString() : ""} />
            <ValueRow label="ISO with offset" value={ms !== null ? isoInZone(ms, zone) : ""} />
            <ValueRow label="RFC 2822" value={ms !== null ? new Date(ms).toUTCString() : ""} />
            <ValueRow label="Relative" value={ms !== null ? relative(ms) : ""} mono={false} />
            {parsed && "unit" in parsed && (
              <p className="pt-2 text-xs text-muted-foreground">Read as {UNIT_LABEL[parsed.unit!]}.</p>
            )}
          </div>
        </Panel>

        <Panel title="Date → timestamp">
          <div className="space-y-4">
            <Field label="Pick a date and time (your time zone)" htmlFor="dt">
              <Input
                id="dt"
                type="datetime-local"
                step={1}
                value={fromDate && "ms" in fromDate ? toLocalInput(fromDate.ms!) : ""}
                onChange={(e) => {
                  const v = e.target.value
                  if (!v) return setDateText("")
                  // datetime-local has no zone: build the date from its parts so it is read as local time
                  const [d, t] = v.split("T")
                  const [y, mo, da] = d.split("-").map(Number)
                  const [h, mi, se = 0] = t.split(":").map(Number)
                  setDateText(new Date(y, mo - 1, da, h, mi, se).toISOString())
                }}
              />
            </Field>
            <Field label="…or type any date" htmlFor="dtext" hint="ISO 8601, “2026-01-31 14:30”, “Jan 31 2026 2:30 PM GMT+5:30”…">
              <Input id="dtext" value={dateText} onChange={(e) => setDateText(e.target.value)} className="font-mono" aria-invalid={!!fromDate?.error || undefined} />
            </Field>
            {fromDate?.error && <Message>{fromDate.error}</Message>}
          </div>
          <div className="mt-3">
            <ValueRow label="Unix seconds" value={fromDate && "ms" in fromDate ? String(Math.floor(fromDate.ms! / 1000)) : ""} />
            <ValueRow label="Milliseconds" value={fromDate && "ms" in fromDate ? String(fromDate.ms) : ""} />
            <ValueRow label="ISO 8601" value={fromDate && "ms" in fromDate ? new Date(fromDate.ms!).toISOString() : ""} />
          </div>
        </Panel>
      </div>
    </div>
  )
}
