"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, Message, OptionSwitch, Panel, ValueRow } from "@/components/tool-kit"

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz"

function parseBig(raw: string, base: number): bigint {
  let s = raw.trim().toLowerCase().replace(/[\s_,']/g, "")
  let negative = false
  if (s.startsWith("-")) {
    negative = true
    s = s.slice(1)
  } else if (s.startsWith("+")) s = s.slice(1)
  const prefix = { 2: "0b", 8: "0o", 16: "0x" }[base as 2 | 8 | 16]
  if (prefix && s.startsWith(prefix)) s = s.slice(2)
  if (!s) throw new Error("Enter a number")
  const b = BigInt(base)
  let n = 0n
  for (const ch of s) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= base) throw new Error(`“${ch}” is not a valid digit in base ${base}`)
    n = n * b + BigInt(d)
  }
  return negative ? -n : n
}

function toBase(n: bigint, base: number) {
  return n.toString(base)
}

function group(s: string, size: number, sep = " ") {
  const neg = s.startsWith("-")
  const digits = neg ? s.slice(1) : s
  const out = digits.replace(new RegExp(`\\B(?=(.{${size}})+$)`, "g"), sep)
  return neg ? `-${out}` : out
}

function detectBase(s: string): number | null {
  const t = s.trim().toLowerCase().replace(/^[-+]/, "")
  if (t.startsWith("0x")) return 16
  if (t.startsWith("0b")) return 2
  if (t.startsWith("0o")) return 8
  return null
}

export default function NumberBase() {
  const [value, setValue] = React.useState("")
  const [base, setBase] = React.useState("10")
  const [custom, setCustom] = React.useState("36")
  const [grouped, setGrouped] = React.useState(true)
  const [upper, setUpper] = React.useState(true)

  const onChange = (v: string) => {
    setValue(v)
    const detected = detectBase(v)
    if (detected) setBase(String(detected))
  }

  const result = React.useMemo(() => {
    if (!value.trim()) return null
    try {
      return { n: parseBig(value, Number(base)) }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [value, base])

  const customBase = Math.min(Math.max(Number.parseInt(custom) || 36, 2), 36)
  const n = result && "n" in result ? result.n! : null
  const fmt = (s: string, size: number) => {
    const cased = upper ? s.toUpperCase() : s
    return grouped ? group(cased, size) : cased
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <Panel title="Number" className="h-fit">
        <div className="space-y-4">
          <Field label="Value" htmlFor="value" hint="Prefixes 0x, 0b and 0o pick the base automatically. Spaces, _ and commas are ignored.">
            <Input id="value" value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. 255, 0xff, 0b1010" className="h-11 font-mono text-base" autoComplete="off" spellCheck={false} aria-invalid={!!result?.error || undefined} />
          </Field>
          <Field label="Input base">
            <Select value={base} onValueChange={setBase}>
              <SelectTrigger aria-label="Input base" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Binary (2)</SelectItem>
                <SelectItem value="8">Octal (8)</SelectItem>
                <SelectItem value="10">Decimal (10)</SelectItem>
                <SelectItem value="16">Hexadecimal (16)</SelectItem>
                {Array.from({ length: 35 }, (_, i) => i + 2)
                  .filter((b) => ![2, 8, 10, 16].includes(b))
                  .map((b) => (
                    <SelectItem key={b} value={String(b)}>
                      Base {b}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <OptionSwitch id="group" label="Group digits" checked={grouped} onChange={setGrouped} />
            <OptionSwitch id="upper" label="Uppercase hex" checked={upper} onChange={setUpper} />
          </div>
          {result?.error && <Message>{result.error}</Message>}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Conversions" bodyClassName="py-1">
          <ValueRow label="Binary" value={n !== null ? fmt(toBase(n, 2), 4) : ""} />
          <ValueRow label="Octal" value={n !== null ? fmt(toBase(n, 8), 3) : ""} />
          <ValueRow label="Decimal" value={n !== null ? (grouped ? group(toBase(n, 10), 3, ",") : toBase(n, 10)) : ""} />
          <ValueRow label="Hexadecimal" value={n !== null ? fmt(toBase(n, 16), 4) : ""} />
          <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-3 border-t py-2">
            <label htmlFor="custom" className="text-xs font-medium text-muted-foreground">
              Base
            </label>
            <Input id="custom" type="number" min={2} max={36} value={custom} onChange={(e) => setCustom(e.target.value)} className="h-8 w-20" />
          </div>
          <ValueRow label={`Base ${customBase}`} value={n !== null ? fmt(toBase(n, customBase), 4) : ""} />
        </Panel>
        {n !== null && (
          <Panel title="Details" bodyClassName="py-1">
            <ValueRow label="Bit length" value={`${(n < 0n ? -n : n).toString(2).length} bits`} mono={false} />
            <ValueRow label="Bytes" value={`${Math.ceil((n < 0n ? -n : n).toString(2).length / 8)}`} mono={false} />
            {n >= 0n && n < 0x110000n && <ValueRow label="Character" value={String.fromCodePoint(Number(n))} />}
            {n >= -(2n ** 63n) && n < 2n ** 64n && (
              <ValueRow label="64-bit two’s complement" value={fmt(BigInt.asUintN(64, n).toString(16).padStart(16, "0"), 4)} />
            )}
          </Panel>
        )}
      </div>
    </div>
  )
}
