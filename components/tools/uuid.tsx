"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeArea, CopyButton, DownloadButton, Field, Message, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"

function hex(bytes: Uint8Array) {
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

function uuidv4() {
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  return hex(b)
}

let lastMs = 0
let seq = 0
/** RFC 9562 v7: 48-bit Unix ms timestamp, then random bits; a counter keeps ids sorted within the same millisecond */
function uuidv7() {
  const b = crypto.getRandomValues(new Uint8Array(16))
  let ms = Date.now()
  if (ms <= lastMs) {
    seq++
    ms = lastMs
  } else seq = b[6] & 0x0f
  lastMs = ms
  const t = BigInt(ms)
  for (let i = 0; i < 6; i++) b[i] = Number((t >> BigInt(8 * (5 - i))) & 0xffn)
  b[6] = 0x70 | ((seq >> 8) & 0x0f)
  b[7] = seq & 0xff
  b[8] = (b[8] & 0x3f) | 0x80
  return hex(b)
}

const RE = /^[{(]?([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})[})]?$/i

export default function UuidTool() {
  const [version, setVersion] = React.useState<"v4" | "v7">("v4")
  const [count, setCount] = React.useState("10")
  const [upper, setUpper] = React.useState(false)
  const [hyphens, setHyphens] = React.useState(true)
  const [braces, setBraces] = React.useState(false)
  const [quoted, setQuoted] = React.useState(false)
  const [list, setList] = React.useState<string[]>([])
  const [check, setCheck] = React.useState("")

  const n = Math.min(Math.max(Number.parseInt(count) || 1, 1), 1000)
  const generate = React.useCallback(() => setList(Array.from({ length: n }, version === "v4" ? uuidv4 : uuidv7)), [n, version])
  React.useEffect(generate, [generate])

  const formatted = list.map((u) => {
    let s = hyphens ? u : u.replace(/-/g, "")
    if (upper) s = s.toUpperCase()
    if (braces) s = `{${s}}`
    if (quoted) s = `"${s}"`
    return s
  })
  const output = quoted ? formatted.join(",\n") : formatted.join("\n")

  const info = React.useMemo(() => {
    const m = RE.exec(check.trim())
    if (!check.trim()) return null
    if (!m) return { valid: false as const }
    const h = m.slice(1).join("").toLowerCase()
    const ver = parseInt(h[12], 16)
    const variantBits = parseInt(h[16], 16)
    const variant = variantBits >= 8 && variantBits < 12 ? "RFC 9562" : variantBits < 8 ? "NCS (legacy)" : variantBits < 14 ? "Microsoft" : "Reserved"
    const nil = /^0+$/.test(h)
    const max = /^f+$/.test(h)
    let time: string | null = null
    if (ver === 7) time = new Date(parseInt(h.slice(0, 12), 16)).toISOString()
    if (ver === 1) {
      const ts = BigInt("0x" + h.slice(13, 16) + h.slice(8, 12) + h.slice(0, 8))
      time = new Date(Number((ts - 122192928000000000n) / 10000n)).toISOString()
    }
    return { valid: true as const, ver, variant, nil, max, time, canonical: `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}` }
  }, [check])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Panel
        title={`${list.length} UUID${list.length === 1 ? "" : "s"}`}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={generate}>
              <RefreshCw /> Regenerate
            </Button>
            <CopyButton value={output} label="Copy all" />
            <DownloadButton content={output} filename="uuids.txt" iconOnly />
          </>
        }
      >
        <CodeArea readOnly value={output} className="h-[55vh] min-h-72 resize-y" aria-label="Generated UUIDs" />
      </Panel>

      <div className="space-y-4">
        <Panel title="Settings">
          <div className="space-y-4">
            <Segmented
              ariaLabel="Version"
              value={version}
              onChange={setVersion}
              className="w-full [&>button]:flex-1"
              options={[
                { value: "v4", label: "v4 · random" },
                { value: "v7", label: "v7 · time-ordered" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              {version === "v4" ? "122 random bits. The usual choice for ids." : "Starts with a timestamp, so ids sort by creation time. Good for database primary keys."}
            </p>
            <Field label="How many (1–1000)" htmlFor="count">
              <Input id="count" type="number" min={1} max={1000} value={count} onChange={(e) => setCount(e.target.value)} onBlur={() => setCount(String(n))} className="w-28" />
            </Field>
            <div className="grid gap-3">
              <OptionSwitch id="upper" label="Uppercase" checked={upper} onChange={setUpper} />
              <OptionSwitch id="hyphens" label="Hyphens" checked={hyphens} onChange={setHyphens} />
              <OptionSwitch id="braces" label="Braces { }" checked={braces} onChange={setBraces} />
              <OptionSwitch id="quoted" label="Quotes and commas" checked={quoted} onChange={setQuoted} />
            </div>
          </div>
        </Panel>
        <Panel title="Validate a UUID">
          <Input value={check} onChange={(e) => setCheck(e.target.value)} placeholder="Paste a UUID" className="font-mono" aria-label="UUID to validate" />
          {info && !info.valid && <Message className="mt-3">Not a valid UUID.</Message>}
          {info?.valid && (
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Valid</dt>
                <dd className="font-medium text-success">Yes{info.nil ? " (nil UUID)" : info.max ? " (max UUID)" : ""}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-medium">{info.nil || info.max ? "—" : `v${info.ver}`}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Variant</dt>
                <dd className="font-medium">{info.variant}</dd>
              </div>
              {info.time && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-mono text-xs">{info.time}</dd>
                </div>
              )}
            </dl>
          )}
        </Panel>
      </div>
    </div>
  )
}
