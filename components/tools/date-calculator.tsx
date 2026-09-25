"use client"

import * as React from "react"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton, Field, OptionSwitch, Panel, Segmented, Stat } from "@/components/tool-kit"
import {
  DAY,
  addBusinessDays,
  addMonths,
  businessDaysBetween,
  diffYMD,
  formatLong,
  parseYMD,
  plural,
  toYMD,
  todayUTC,
  ymdText,
} from "@/lib/dates"

type Unit = "days" | "weeks" | "months" | "years" | "business"

export default function DateCalculator() {
  const [tab, setTab] = React.useState<"between" | "add">("between")
  const [start, setStart] = React.useState("")
  const [end, setEnd] = React.useState("")
  const [inclusive, setInclusive] = React.useState(false)
  const [base, setBase] = React.useState("")
  const [amount, setAmount] = React.useState("30")
  const [unit, setUnit] = React.useState<Unit>("days")
  const [op, setOp] = React.useState<"add" | "sub">("add")

  React.useEffect(() => {
    const today = todayUTC()
    setStart(toYMD(today))
    setEnd(toYMD(addMonths(today, 3)))
    setBase(toYMD(today))
  }, [])

  const between = React.useMemo(() => {
    const a = parseYMD(start)
    const b = parseYMD(end)
    if (a === null || b === null) return null
    const [lo, hi] = a <= b ? [a, b] : [b, a]
    const hiAdj = inclusive ? hi + DAY : hi
    const days = Math.round((hiAdj - lo) / DAY)
    return {
      reversed: a > b,
      ymd: diffYMD(lo, hiAdj),
      days,
      weeks: Math.floor(days / 7),
      weekRem: days % 7,
      business: businessDaysBetween(lo, hi, inclusive),
      hours: days * 24,
    }
  }, [start, end, inclusive])

  const added = React.useMemo(() => {
    const t = parseYMD(base)
    const n = Number.parseInt(amount)
    if (t === null || !Number.isFinite(n)) return null
    const k = op === "add" ? n : -n
    switch (unit) {
      case "days":
        return t + k * DAY
      case "weeks":
        return t + k * 7 * DAY
      case "months":
        return addMonths(t, k)
      case "years":
        return addMonths(t, k * 12)
      case "business":
        return addBusinessDays(t, k)
    }
  }, [base, amount, unit, op])

  return (
    <div className="space-y-4">
      <Segmented
        ariaLabel="Calculation"
        value={tab}
        onChange={setTab}
        options={[
          { value: "between", label: "Time between dates" },
          { value: "add", label: "Add or subtract" },
        ]}
      />

      {tab === "between" ? (
        <>
          <Panel>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Start date" htmlFor="start">
                <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-44" />
              </Field>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Swap dates"
                onClick={() => {
                  setStart(end)
                  setEnd(start)
                }}
              >
                <ArrowLeftRight />
              </Button>
              <Field label="End date" htmlFor="end">
                <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-44" />
              </Field>
              <Button variant="outline" onClick={() => setEnd(toYMD(todayUTC()))}>
                End today
              </Button>
              <div className="pb-2">
                <OptionSwitch id="inclusive" label="Include the end date" checked={inclusive} onChange={setInclusive} />
              </div>
            </div>
          </Panel>
          {between && (
            <>
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
                <div className="text-xs font-medium text-muted-foreground">Duration{between.reversed ? " (end is before start)" : ""}</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-primary">{ymdText(between.ymd)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Total days" value={between.days.toLocaleString()} />
                <Stat label="Weeks" value={between.weeks.toLocaleString()} sub={between.weekRem ? `and ${plural(between.weekRem, "day")}` : "exactly"} />
                <Stat label="Business days" value={between.business.toLocaleString()} sub="Monday to Friday" />
                <Stat label="Hours" value={between.hours.toLocaleString()} />
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <Panel>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Start date" htmlFor="base">
                <Input id="base" type="date" value={base} onChange={(e) => setBase(e.target.value)} className="w-44" />
              </Field>
              <Segmented
                ariaLabel="Add or subtract"
                value={op}
                onChange={setOp}
                options={[
                  { value: "add", label: "+ Add" },
                  { value: "sub", label: "− Subtract" },
                ]}
              />
              <Field label="Amount" htmlFor="amount">
                <Input id="amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28" />
              </Field>
              <Field label="Unit">
                <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                  <SelectTrigger className="w-40" aria-label="Unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="business">Business days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Panel>
          {added !== null && added !== undefined && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Result</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-primary">{formatLong(added)}</div>
                <div className="mt-0.5 font-mono text-sm text-muted-foreground">{toYMD(added)}</div>
              </div>
              <CopyButton value={toYMD(added)} label="Copy date" />
            </div>
          )}
          {(unit === "months" || unit === "years") && (
            <p className="text-xs text-muted-foreground">When the day doesn’t exist in the target month (like 31 February) the result is the last day of that month.</p>
          )}
        </>
      )}
    </div>
  )
}
