"use client"

import * as React from "react"
import { CopyButton } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const fmt = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"

function num(s: string) {
  if (s.trim() === "") return null
  const n = Number(s.replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function NumberInput({ value, onChange, label, suffix }: { value: string; onChange: (v: string) => void; label: string; suffix?: string }) {
  return (
    <span className="relative inline-flex">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        aria-label={label}
        placeholder="0"
        className={cn(
          "h-10 w-28 rounded-md border bg-background px-3 text-right font-mono text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:bg-input/20",
          suffix && "pr-7",
        )}
      />
      {suffix && <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
    </span>
  )
}

function Calc({
  title,
  children,
  result,
  detail,
  tone,
}: {
  title: string
  children: React.ReactNode
  result: string | null
  detail?: string
  tone?: "up" | "down"
}) {
  return (
    <section className="flex flex-col rounded-xl border bg-card shadow-xs">
      <h2 className="border-b px-4 py-2.5 text-sm font-semibold">{title}</h2>
      <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-3 px-4 py-4 text-sm text-muted-foreground">{children}</div>
      <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-2xl font-semibold tracking-tight tabular-nums",
              result ? "text-primary" : "text-muted-foreground/50",
              tone === "up" && "text-success",
              tone === "down" && "text-destructive",
            )}
          >
            {result ?? "—"}
          </div>
          {detail && <div className="truncate text-xs text-muted-foreground">{detail}</div>}
        </div>
        <CopyButton value={result ?? ""} iconOnly variant="ghost" />
      </div>
    </section>
  )
}

export default function Percentage() {
  const [a1, setA1] = React.useState("15")
  const [a2, setA2] = React.useState("240")
  const [b1, setB1] = React.useState("45")
  const [b2, setB2] = React.useState("180")
  const [c1, setC1] = React.useState("80")
  const [c2, setC2] = React.useState("100")
  const [d1, setD1] = React.useState("250")
  const [d2, setD2] = React.useState("20")
  const [e1, setE1] = React.useState("30")
  const [e2, setE2] = React.useState("12")

  const A = num(a1) !== null && num(a2) !== null ? (num(a1)! / 100) * num(a2)! : null
  const B = num(b1) !== null && num(b2) ? (num(b1)! / num(b2)!) * 100 : null
  const C = num(c1) && num(c2) !== null ? ((num(c2)! - num(c1)!) / Math.abs(num(c1)!)) * 100 : null
  const D = num(d1) !== null && num(d2) !== null ? { up: num(d1)! * (1 + num(d2)! / 100), down: num(d1)! * (1 - num(d2)! / 100) } : null
  const E = num(e1) !== null && num(e2) ? num(e1)! / (num(e2)! / 100) : null

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Calc title="Percentage of a number" result={A !== null ? fmt(A) : null}>
        What is <NumberInput label="Percent" value={a1} onChange={setA1} suffix="%" /> of <NumberInput label="Number" value={a2} onChange={setA2} />?
      </Calc>

      <Calc title="What percent is it?" result={B !== null ? `${fmt(B)}%` : null} detail={num(b2) === 0 ? "Can’t divide by zero" : undefined}>
        <NumberInput label="Part" value={b1} onChange={setB1} /> is what percent of <NumberInput label="Whole" value={b2} onChange={setB2} />?
      </Calc>

      <Calc
        title="Percentage change"
        result={C !== null ? `${C > 0 ? "+" : ""}${fmt(C)}%` : null}
        tone={C === null || C === 0 ? undefined : C > 0 ? "up" : "down"}
        detail={C !== null ? `${C >= 0 ? "Increase" : "Decrease"} of ${fmt(Math.abs(num(c2)! - num(c1)!))}` : num(c1) === 0 ? "The starting value can’t be zero" : undefined}
      >
        From <NumberInput label="Old value" value={c1} onChange={setC1} /> to <NumberInput label="New value" value={c2} onChange={setC2} />
      </Calc>

      <Calc title="Increase or decrease by a percent" result={D ? fmt(D.up) : null} detail={D ? `Decreased by ${d2}%: ${fmt(D.down)}` : undefined}>
        <NumberInput label="Value" value={d1} onChange={setD1} /> increased by <NumberInput label="Percent" value={d2} onChange={setD2} suffix="%" />
      </Calc>

      <Calc title="Find the whole" result={E !== null ? fmt(E) : null} detail={E !== null ? `${e1} is ${e2}% of ${fmt(E)}` : undefined}>
        <NumberInput label="Part" value={e1} onChange={setE1} /> is <NumberInput label="Percent" value={e2} onChange={setE2} suffix="%" /> of what?
      </Calc>
    </div>
  )
}
