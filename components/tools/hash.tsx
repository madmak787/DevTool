"use client"

import * as React from "react"
import SparkMD5 from "spark-md5"
import { CircleCheck, Eraser, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeArea, CopyButton, Field, Message, OptionSwitch, Panel, Segmented, formatBytes } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const
type Algo = (typeof ALGOS)[number]

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
}
function hexToB64(hex: string) {
  return btoa(hex.match(/../g)!.map((h) => String.fromCharCode(parseInt(h, 16))).join(""))
}

async function digest(algo: Algo, data: Uint8Array, hmacKey: string | null): Promise<string | null> {
  if (algo === "MD5") {
    if (hmacKey !== null) return null
    return SparkMD5.ArrayBuffer.hash(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  }
  if (hmacKey !== null) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(hmacKey), { name: "HMAC", hash: algo }, false, ["sign"])
    return toHex(await crypto.subtle.sign("HMAC", key, data as BufferSource))
  }
  return toHex(await crypto.subtle.digest(algo, data as BufferSource))
}

export default function HashTool() {
  const [text, setText] = React.useState("")
  const [file, setFile] = React.useState<{ name: string; size: number; bytes: Uint8Array } | null>(null)
  const [useHmac, setUseHmac] = React.useState(false)
  const [key, setKey] = React.useState("")
  const [format, setFormat] = React.useState<"hex" | "HEX" | "base64">("hex")
  const [compare, setCompare] = React.useState("")
  const [hashes, setHashes] = React.useState<Partial<Record<Algo, string | null>>>({})
  const [busy, setBusy] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const secure = typeof window === "undefined" || !!globalThis.crypto?.subtle

  React.useEffect(() => {
    if (!secure) return
    const data = file ? file.bytes : new TextEncoder().encode(text)
    if (!file && !text) {
      setHashes({})
      return
    }
    let cancelled = false
    setBusy(true)
    const t = setTimeout(async () => {
      const entries = await Promise.all(ALGOS.map(async (a) => [a, await digest(a, data, useHmac ? key : null)] as const))
      if (!cancelled) {
        setHashes(Object.fromEntries(entries))
        setBusy(false)
      }
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [text, file, useHmac, key, secure])

  const show = (h: string | null | undefined) => {
    if (!h) return ""
    if (format === "HEX") return h.toUpperCase()
    if (format === "base64") return hexToB64(h)
    return h
  }

  const cmp = compare.trim().toLowerCase()
  const matched = cmp ? ALGOS.find((a) => hashes[a] && (hashes[a] === cmp || hexToB64(hashes[a]!).toLowerCase() === cmp)) : undefined

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="space-y-4">
        <Panel
          title={file ? "File" : "Text"}
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
                <FolderOpen /> File
              </Button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) setFile({ name: f.name, size: f.size, bytes: new Uint8Array(await f.arrayBuffer()) })
                  e.target.value = ""
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                disabled={!text && !file}
                onClick={() => {
                  setText("")
                  setFile(null)
                }}
              >
                <Eraser /> Clear
              </Button>
            </>
          }
        >
          {file ? (
            <div className="flex h-44 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center">
              <p className="font-medium break-all">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
              <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                Hash text instead
              </Button>
            </div>
          ) : (
            <CodeArea value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to hash (UTF-8)" className="h-44 resize-y" aria-label="Text to hash" />
          )}
        </Panel>
        <Panel title="Options">
          <div className="space-y-4">
            <OptionSwitch id="hmac" label="HMAC with a secret key" checked={useHmac} onChange={setUseHmac} />
            {useHmac && <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Secret key" className="font-mono" aria-label="HMAC key" />}
            <Segmented
              ariaLabel="Output format"
              size="sm"
              value={format}
              onChange={setFormat}
              options={[
                { value: "hex", label: "hex" },
                { value: "HEX", label: "HEX" },
                { value: "base64", label: "Base64" },
              ]}
            />
            <Field label="Compare with a known hash" htmlFor="compare">
              <Input id="compare" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Paste the expected checksum" className="font-mono" />
            </Field>
            {cmp && Object.keys(hashes).length > 0 && (
              <Message tone={matched ? "success" : "error"}>
                {matched ? `Match: this is the ${matched}${useHmac ? " HMAC" : ""} hash.` : "No match with any algorithm."}
              </Message>
            )}
          </div>
        </Panel>
      </div>

      <Panel title={useHmac ? "HMAC" : "Hashes"} actions={busy && <span className="text-xs text-muted-foreground">Hashing…</span>} bodyClassName="py-1">
        {!secure && <Message className="my-3">Hashing needs a secure (https) page.</Message>}
        {ALGOS.map((a) => {
          const v = show(hashes[a])
          const isMatch = matched === a
          return (
            <div key={a} className={cn("border-b py-3 last:border-b-0", isMatch && "-mx-4 rounded-md bg-success/10 px-4")}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {a}
                  {isMatch && <CircleCheck className="size-3.5 text-success" />}
                  {a === "MD5" && <span className="font-normal text-muted-foreground">· not for security</span>}
                  {a === "SHA-1" && <span className="font-normal text-muted-foreground">· legacy</span>}
                </span>
                <CopyButton value={v} iconOnly variant="ghost" label={`Copy ${a}`} />
              </div>
              <p className={cn("font-mono text-[13px] break-all", !v && "text-muted-foreground")}>
                {v || (a === "MD5" && useHmac ? "HMAC-MD5 isn’t supported" : "—")}
              </p>
            </div>
          )
        })}
      </Panel>
    </div>
  )
}
