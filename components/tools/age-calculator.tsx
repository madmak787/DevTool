"use client"

import * as React from "react"
import { Cake } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Field, Message, Panel, Stat } from "@/components/tool-kit"
import { DAY, addMonths, diffYMD, formatLong, parseYMD, plural, toYMD, todayUTC } from "@/lib/dates"

export default function AgeCalculator() {
  const [birth, setBirth] = React.useState("")
  const [at, setAt] = React.useState("")

  React.useEffect(() => setAt(toYMD(todayUTC())), [])

  const result = React.useMemo(() => {
    const b = parseYMD(birth)
    const t = parseYMD(at)
    if (b === null || t === null) return null
    if (b > t) return { error: "The date of birth is after the date to calculate the age on." }
    const ymd = diffYMD(b, t)
    const days = Math.round((t - b) / DAY)
    // The next birthday: same month and day, clamped to Feb 28 for 29 February birthdays in common years
    let next = addMonths(b, (ymd.years + (ymd.months || ymd.days ? 1 : 0)) * 12)
    if (next < t) next = addMonths(b, (ymd.years + 1) * 12)
    const untilNext = Math.round((next - t) / DAY)
    return {
      ymd,
      days,
      weeks: Math.floor(days / 7),
      months: ymd.years * 12 + ymd.months,
      hours: days * 24,
      next,
      untilNext,
      turning: new Date(next).getUTCFullYear() - new Date(b).getUTCFullYear(),
      bornOn: new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: "UTC" }).format(b),
    }
  }, [birth, at])

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Date of birth" htmlFor="birth">
            <Input id="birth" type="date" value={birth} max={at || undefined} onChange={(e) => setBirth(e.target.value)} className="w-48" />
          </Field>
          <Field label="Age on" htmlFor="at">
            <Input id="at" type="date" value={at} onChange={(e) => setAt(e.target.value)} className="w-48" />
          </Field>
        </div>
      </Panel>

      {!result ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Enter a date of birth to see the exact age.</p>
      ) : "error" in result ? (
        <Message>{result.error}</Message>
      ) : (
        <>
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-5">
            <div className="text-xs font-medium text-muted-foreground">Age</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-4xl font-semibold tracking-tight text-primary tabular-nums">{result.ymd.years}</span>
              <span className="text-lg text-muted-foreground">
                years, {plural(result.ymd.months, "month")} and {plural(result.ymd.days, "day")}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Born on a {result.bornOn}.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total months" value={result.months.toLocaleString()} />
            <Stat label="Total weeks" value={result.weeks.toLocaleString()} />
            <Stat label="Total days" value={result.days.toLocaleString()} />
            <Stat label="Total hours" value={result.hours.toLocaleString()} />
          </div>
          <Panel>
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cake className="size-5" />
              </span>
              <div>
                {result.untilNext === 0 ? (
                  <p className="font-semibold">Happy birthday! Turning {result.turning} today.</p>
                ) : (
                  <p className="font-semibold">
                    Next birthday in {plural(result.untilNext, "day")}: turning {result.turning}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{formatLong(result.next)}</p>
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
