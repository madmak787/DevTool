"use client"

import * as React from "react"
import { ArrowLeftRight, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, EDITOR_HEIGHT, Message, Panel, Segmented } from "@/components/tool-kit"

type Enc = "binary" | "hex" | "octal" | "decimal" | "codepoints"
type Mode = "encode" | "decode"

const BASE: Record<Exclude<Enc, "codepoints">, { radix: number; width: number }> = {
  binary: { radix: 2, width: 8 },
  hex: { radix: 16, width: 2 },
  octal: { radix: 8, width: 3 },
  decimal: { radix: 10, width: 0 },
}

function encode(text: string, enc: Enc, sep: string) {
  if (enc === "codepoints") return Array.from(text, (c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`).join(sep)
  const { radix, width } = BASE[enc]
  return Array.from(new TextEncoder().encode(text), (b) => {
    const s = b.toString(radix)
    return enc === "hex" ? s.padStart(width, "0").toUpperCase() : s.padStart(width, "0")
  }).join(sep)
}

function decode(input: string, enc: Enc) {
  const s = input.trim()
  if (!s) return ""
  if (enc === "codepoints") {
    const parts = s.match(/(?:U\+|\\u|0x)?[0-9a-f]+/gi) ?? []
    return parts.map((p) => String.fromCodePoint(parseInt(p.replace(/^(U\+|\\u|0x)/i, ""), 16))).join("")
  }
  const { radix, width } = BASE[enc]
  let tokens = s.split(/[\s,;:]+/).filter(Boolean)
  // Unseparated input like "48656c6c6f" or "0100100001101001": split into fixed-width bytes
  if (tokens.length === 1 && width && tokens[0].length > width) {
    const t = tokens[0].replace(/^0x/i, "")
    if (t.length % width !== 0) throw new Error(`Expected groups of ${width} digits`)
    tokens = t.match(new RegExp(`.{${width}}`, "g"))!
  }
  const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^(0x)?[0-9a-f]+$/i }[radix]!
  const bytes = tokens.map((t) => {
    if (!valid.test(t)) throw new Error(`“${t}” isn’t valid ${enc}`)
    const n = parseInt(t.replace(/^0x/i, ""), radix)
    if (n > 255) throw new Error(`“${t}” is larger than one byte (255)`)
    return n
  })
  return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes))
}

export default function TextBinary() {
  const [mode, setMode] = React.useState<Mode>("encode")
  const [enc, setEnc] = React.useState<Enc>("binary")
  const [sep, setSep] = React.useState<" " | "" | "\n">(" ")
  const [input, setInput] = React.useState("")

  const result = React.useMemo(() => {
    if (!input) return { output: "", error: "" }
    try {
      return { output: mode === "encode" ? encode(input, enc, enc === "codepoints" && sep === "" ? " " : sep) : decode(input, enc), error: "" }
    } catch (e) {
      return { output: "", error: (e as Error).message }
    }
  }, [input, mode, enc, sep])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented ariaLabel="Direction" value={mode} onChange={setMode} options={[{ value: "encode", label: "Text → code" }, { value: "decode", label: "Code → text" }]} />
        <Segmented
          ariaLabel="Encoding"
          size="sm"
          value={enc}
          onChange={setEnc}
          options={[
            { value: "binary", label: "Binary" },
            { value: "hex", label: "Hex" },
            { value: "octal", label: "Octal" },
            { value: "decimal", label: "Decimal" },
            { value: "codepoints", label: "Code points" },
          ]}
        />
        {mode === "encode" && (
          <Segmented
            ariaLabel="Separator"
            size="sm"
            value={sep}
            onChange={setSep}
            options={[
              { value: " ", label: "Spaces" },
              { value: "", label: "None" },
              { value: "\n", label: "New lines" },
            ]}
          />
        )}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={!result.output}
          onClick={() => {
            setInput(result.output)
            setMode(mode === "encode" ? "decode" : "encode")
          }}
        >
          <ArrowLeftRight /> Swap
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={mode === "encode" ? "Text" : "Code"}
          actions={
            <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
              <Eraser /> Clear
            </Button>
          }
          footer={mode === "encode" && input ? <span>{new TextEncoder().encode(input).length} bytes (UTF-8)</span> : undefined}
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "Hello 👋" : "01001000 01101001"} invalid={!!result.error} className={EDITOR_HEIGHT} aria-label="Input" />
        </Panel>
        <Panel title={mode === "encode" ? "Code" : "Text"} actions={<CopyButton value={result.output} />}>
          {result.error ? (
            <div className={EDITOR_HEIGHT}>
              <Message>{result.error}</Message>
            </div>
          ) : (
            <CodeArea readOnly value={result.output} placeholder="Result appears here" className={EDITOR_HEIGHT} aria-label="Output" />
          )}
        </Panel>
      </div>
    </div>
  )
}
