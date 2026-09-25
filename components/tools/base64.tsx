"use client"

import * as React from "react"
import { ArrowLeftRight, Download, Eraser, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CodeArea,
  CopyButton,
  EDITOR_HEIGHT,
  Message,
  OptionSwitch,
  Panel,
  Segmented,
  formatBytes,
} from "@/components/tool-kit"
import { downloadBlob } from "@/lib/download"

function bytesToBase64(bytes: Uint8Array) {
  let bin = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return btoa(bin)
}

function base64ToBytes(input: string) {
  let s = input.trim()
  const dataUri = /^data:([^;,]+)?(;[^,]*)?,/.exec(s)
  let mime: string | null = null
  if (dataUri) {
    mime = dataUri[1] ?? null
    s = s.slice(dataUri[0].length)
  }
  s = s.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
  if (/[^A-Za-z0-9+/=]/.test(s)) throw new Error("The input contains characters that aren’t valid in Base64.")
  s = s.replace(/=+$/, "")
  if (s.length % 4 === 1) throw new Error("The Base64 input is truncated (its length is not valid).")
  s = s.padEnd(Math.ceil(s.length / 4) * 4, "=")
  const bin = atob(s)
  return { bytes: Uint8Array.from(bin, (c) => c.charCodeAt(0)), mime }
}

function sniffMime(b: Uint8Array): string | null {
  const hex = Array.from(b.subarray(0, 12), (x) => x.toString(16).padStart(2, "0")).join("")
  if (hex.startsWith("89504e47")) return "image/png"
  if (hex.startsWith("ffd8ff")) return "image/jpeg"
  if (hex.startsWith("47494638")) return "image/gif"
  if (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") return "image/webp"
  if (hex.startsWith("25504446")) return "application/pdf"
  if (hex.startsWith("504b0304")) return "application/zip"
  return null
}

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/zip": "zip",
}

export default function Base64Tool() {
  const [mode, setMode] = React.useState<"encode" | "decode">("encode")
  const [input, setInput] = React.useState("")
  const [urlSafe, setUrlSafe] = React.useState(false)
  const [wrap, setWrap] = React.useState(false)
  const [file, setFile] = React.useState<{ name: string; type: string; bytes: Uint8Array } | null>(null)
  const [asDataUri, setAsDataUri] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const encode = React.useCallback(
    (bytes: Uint8Array, mime?: string) => {
      let out = bytesToBase64(bytes)
      if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
      if (asDataUri && mime) return `data:${mime};base64,${out}`
      if (wrap) out = out.replace(/(.{76})(?=.)/g, "$1\n")
      return out
    },
    [urlSafe, wrap, asDataUri],
  )

  const result = React.useMemo(() => {
    if (mode === "encode") {
      if (file) return { text: encode(file.bytes, file.type || "application/octet-stream") }
      if (!input) return { text: "" }
      return { text: encode(new TextEncoder().encode(input)) }
    }
    if (!input.trim()) return { text: "" }
    try {
      const { bytes, mime } = base64ToBytes(input)
      const type = mime ?? sniffMime(bytes)
      try {
        if (type && !type.startsWith("text/") && type !== "image/svg+xml") throw new Error("binary")
        const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
        return { text, bytes, type }
      } catch {
        return { text: "", bytes, type: type ?? "application/octet-stream", binary: true }
      }
    } catch (e) {
      return { text: "", error: (e as Error).message }
    }
  }, [mode, input, file, encode])

  const preview = React.useMemo(() => {
    if (!result.binary || !result.bytes || !result.type?.startsWith("image/")) return null
    return URL.createObjectURL(new Blob([result.bytes as BlobPart], { type: result.type }))
  }, [result])
  React.useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  const switchMode = (m: "encode" | "decode") => {
    setMode(m)
    setFile(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
        {mode === "encode" && (
          <>
            <OptionSwitch id="url-safe" label="URL-safe (- _ no padding)" checked={urlSafe} onChange={setUrlSafe} />
            <OptionSwitch id="wrap" label="Wrap at 76 characters" checked={wrap} onChange={setWrap} />
            {file && <OptionSwitch id="data-uri" label="Data URI" checked={asDataUri} onChange={setAsDataUri} />}
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={!result.text || !!file}
          onClick={() => {
            setInput(result.text)
            setMode(mode === "encode" ? "decode" : "encode")
          }}
          title="Use the output as the new input and switch direction"
        >
          <ArrowLeftRight /> Swap
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={mode === "encode" ? "Text or file" : "Base64"}
          actions={
            <>
              {mode === "encode" && (
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
                      if (f) setFile({ name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) })
                      e.target.value = ""
                    }}
                  />
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInput("")
                  setFile(null)
                }}
                disabled={!input && !file}
              >
                <Eraser /> Clear
              </Button>
            </>
          }
        >
          {file ? (
            <div className={`${EDITOR_HEIGHT} flex flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center`}>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(file.bytes.length)} · {file.type || "unknown type"}
              </p>
              <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                Remove file
              </Button>
            </div>
          ) : (
            <CodeArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Text to encode (UTF-8), or choose a file" : "Base64, URL-safe Base64 or a data: URI"}
              invalid={!!result.error}
              className={EDITOR_HEIGHT}
              aria-label="Input"
            />
          )}
        </Panel>

        <Panel
          title={mode === "encode" ? "Base64" : "Decoded"}
          actions={
            result.binary ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadBlob(new Blob([result.bytes as BlobPart], { type: result.type }), `decoded.${EXT[result.type!] ?? "bin"}`)}
              >
                <Download /> Download file
              </Button>
            ) : (
              <CopyButton value={result.text} />
            )
          }
          footer={result.text ? <span>{result.text.length.toLocaleString()} characters</span> : undefined}
        >
          {result.error ? (
            <div className={EDITOR_HEIGHT}>
              <Message>{result.error}</Message>
            </div>
          ) : result.binary ? (
            <div className={`${EDITOR_HEIGHT} flex flex-col items-center justify-center gap-3 rounded-md border bg-muted/30 p-4 text-center`}>
              {preview && <img src={preview} alt="Decoded image" className="checkerboard max-h-[70%] max-w-full rounded border object-contain" />}
              <p className="text-sm text-muted-foreground">
                Binary data ({result.type}, {formatBytes(result.bytes!.length)}). Download it to open the file.
              </p>
            </div>
          ) : (
            <CodeArea readOnly value={result.text} placeholder="Result appears here" className={EDITOR_HEIGHT} aria-label="Output" />
          )}
        </Panel>
      </div>
    </div>
  )
}
