"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CopyButton, Field, Message, Panel, ValueRow } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const WHO = ["Owner", "Group", "Public"] as const
const PERMS = [
  { bit: 4, label: "Read", ch: "r" },
  { bit: 2, label: "Write", ch: "w" },
  { bit: 1, label: "Execute", ch: "x" },
] as const
const SPECIAL = [
  { bit: 4, label: "Set user ID (setuid)" },
  { bit: 2, label: "Set group ID (setgid)" },
  { bit: 1, label: "Sticky bit" },
] as const

const COMMON: [string, string][] = [
  ["644", "Files: owner edits, everyone reads"],
  ["755", "Folders and scripts"],
  ["600", "Private files (SSH keys)"],
  ["700", "Private folders"],
  ["664", "Shared group files"],
  ["775", "Shared group folders"],
  ["444", "Read-only for everyone"],
  ["777", "Everyone can do anything (avoid)"],
]

function toSymbolic(special: number, digits: number[]) {
  return digits
    .map((d, i) => {
      let s = PERMS.map((p) => (d & p.bit ? p.ch : "-")).join("")
      const sp = [4, 2, 1][i]
      if (special & sp) {
        const c = i === 2 ? "t" : "s"
        s = s.slice(0, 2) + (d & 1 ? c : c.toUpperCase())
      }
      return s
    })
    .join("")
}

function parseSymbolic(s: string): { special: number; digits: number[] } | null {
  const t = s.trim().replace(/^[-dlcbps]/, (m) => (s.trim().length === 10 ? "" : m))
  if (!/^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(t)) return null
  let special = 0
  const digits = [0, 1, 2].map((i) => {
    const g = t.slice(i * 3, i * 3 + 3)
    let d = (g[0] === "r" ? 4 : 0) + (g[1] === "w" ? 2 : 0)
    if ("xst".includes(g[2])) d += 1
    if ("sStT".includes(g[2])) special |= [4, 2, 1][i]
    return d
  })
  return { special, digits }
}

export default function ChmodCalculator() {
  const [digits, setDigits] = React.useState([7, 5, 5])
  const [special, setSpecial] = React.useState(0)
  const [octalText, setOctalText] = React.useState("755")
  const [symText, setSymText] = React.useState("rwxr-xr-x")
  const [error, setError] = React.useState("")

  const octal = `${special ? special : ""}${digits.join("")}`
  const symbolic = toSymbolic(special, digits)

  React.useEffect(() => {
    setOctalText(octal)
    setSymText(symbolic)
  }, [octal, symbolic])

  const toggle = (who: number, bit: number) => setDigits((d) => d.map((v, i) => (i === who ? v ^ bit : v)))

  const onOctal = (v: string) => {
    setOctalText(v)
    const t = v.trim()
    if (/^[0-7]{3,4}$/.test(t)) {
      const four = t.padStart(4, "0")
      setSpecial(Number(four[0]))
      setDigits([1, 2, 3].map((i) => Number(four[i])))
      setError("")
    } else setError(t ? "Octal permissions are 3 or 4 digits from 0 to 7, like 644 or 2755." : "")
  }
  const onSymbolic = (v: string) => {
    setSymText(v)
    const p = parseSymbolic(v)
    if (p) {
      setSpecial(p.special)
      setDigits(p.digits)
      setError("")
    } else setError(v.trim() ? "Symbolic permissions look like rwxr-xr-x (9 characters, or 10 with the file type)." : "")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Panel bodyClassName="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium" />
                {WHO.map((w, i) => (
                  <th key={w} className="px-2 py-2.5 font-medium">
                    {w}
                    <div className="font-mono text-lg text-primary">{digits[i]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMS.map((p) => (
                <tr key={p.bit} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">
                    {p.label} <span className="font-mono text-xs text-muted-foreground">({p.ch} = {p.bit})</span>
                  </td>
                  {WHO.map((w, i) => (
                    <td key={w} className="px-2 py-3 text-center">
                      <Checkbox checked={!!(digits[i] & p.bit)} onCheckedChange={() => toggle(i, p.bit)} aria-label={`${w} ${p.label}`} className="size-5" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t px-4 py-3">
            {SPECIAL.map((s) => (
              <label key={s.bit} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={!!(special & s.bit)} onCheckedChange={() => setSpecial((v) => v ^ s.bit)} />
                {s.label}
              </label>
            ))}
          </div>
        </Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Octal" htmlFor="octal">
            <Input id="octal" value={octalText} onChange={(e) => onOctal(e.target.value)} className="h-12 font-mono text-2xl" inputMode="numeric" />
          </Field>
          <Field label="Symbolic" htmlFor="sym">
            <Input id="sym" value={symText} onChange={(e) => onSymbolic(e.target.value)} className="h-12 font-mono text-2xl" spellCheck={false} />
          </Field>
        </div>
        {error && <Message>{error}</Message>}
        <Panel title="Commands" bodyClassName="py-1">
          <ValueRow label="chmod (octal)" value={`chmod ${octal} file`} />
          <ValueRow label="chmod (symbolic)" value={`chmod u=${symbolic.slice(0, 3).replace(/-/g, "")},g=${symbolic.slice(3, 6).replace(/-/g, "")},o=${symbolic.slice(6).replace(/-/g, "")} file`} />
          <ValueRow label="Recursive" value={`chmod -R ${octal} folder/`} />
        </Panel>
      </div>
      <Panel title="Common permissions" className="h-fit" bodyClassName="p-0">
        {COMMON.map(([o, label]) => (
          <button
            key={o}
            type="button"
            onClick={() => onOctal(o)}
            className={cn("flex w-full items-center gap-3 border-b px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-accent/50", octal === o && "bg-accent/60")}
          >
            <span className="font-mono font-semibold text-primary">{o}</span>
            <span className="min-w-0 flex-1 text-muted-foreground">{label}</span>
            <span className="font-mono text-xs text-muted-foreground">{toSymbolic(0, [...o].map(Number))}</span>
          </button>
        ))}
        <div className="border-t px-4 py-2">
          <CopyButton value={octal} label="Copy octal" variant="ghost" />
        </div>
      </Panel>
    </div>
  )
}
