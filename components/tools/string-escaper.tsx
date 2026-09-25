"use client"

import * as React from "react"
import { ArrowLeftRight, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, EDITOR_HEIGHT, Message, Panel, Segmented } from "@/components/tool-kit"

type Target = "json" | "js" | "sql" | "regex" | "csv" | "shell" | "java"
type Mode = "escape" | "unescape"

const TARGETS: { value: Target; label: string; hint: string }[] = [
  { value: "json", label: "JSON", hint: "Body of a JSON string: quotes, backslashes and control characters are escaped." },
  { value: "js", label: "JavaScript", hint: "A single-quoted JavaScript string; also escapes line separators." },
  { value: "java", label: "Java / C#", hint: "A double-quoted string literal with \\uXXXX for non-ASCII." },
  { value: "sql", label: "SQL", hint: "A single-quoted SQL literal: each ' becomes ''." },
  { value: "regex", label: "Regex", hint: "Matches the text literally inside a regular expression." },
  { value: "csv", label: "CSV", hint: "Quotes the field if needed and doubles any quotes inside." },
  { value: "shell", label: "Shell", hint: "A single-quoted POSIX shell argument." },
]

const hex4 = (c: number) => c.toString(16).padStart(4, "0")

function escape(s: string, t: Target) {
  switch (t) {
    case "json":
      return JSON.stringify(s).slice(1, -1)
    case "js":
      return s.replace(/[\\'\n\r\t\b\f\v\0\u2028\u2029]/g, (c) =>
        ({ "\\": "\\\\", "'": "\\'", "\n": "\\n", "\r": "\\r", "\t": "\\t", "\b": "\\b", "\f": "\\f", "\v": "\\v", "\0": "\\0" })[c] ?? `\\u${hex4(c.charCodeAt(0))}`,
      )
    case "java":
      return s.replace(/[\\"\n\r\t\b\f]|[^\x20-\x7e]/g, (c) =>
        ({ "\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t", "\b": "\\b", "\f": "\\f" })[c] ?? `\\u${hex4(c.charCodeAt(0))}`,
      )
    case "sql":
      return s.replace(/'/g, "''")
    case "regex":
      return s.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&")
    case "csv":
      return /[",\n\r]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    case "shell":
      return `'${s.replace(/'/g, `'\\''`)}'`
  }
}

function unescapeBackslashes(s: string) {
  return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-7]{1,3}|.)/gs, (_, e: string) => {
    if (e[0] === "u") return String.fromCodePoint(parseInt(e.replace(/[u{}]/g, ""), 16))
    if (e[0] === "x") return String.fromCharCode(parseInt(e.slice(1), 16))
    if (/^[0-7]+$/.test(e)) return String.fromCharCode(parseInt(e, 8))
    return ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v" } as Record<string, string>)[e] ?? e
  })
}

function unescape(s: string, t: Target) {
  switch (t) {
    case "json":
      return JSON.parse(`"${s.replace(/(^|[^\\])((\\\\)*)"/g, '$1$2\\"')}"`) as string
    case "js":
    case "java":
      return unescapeBackslashes(s)
    case "sql":
      return s.replace(/^'|'$/g, "").replace(/''/g, "'")
    case "regex":
      return s.replace(/\\(.)/g, "$1")
    case "csv":
      return /^".*"$/s.test(s) ? s.slice(1, -1).replace(/""/g, '"') : s
    case "shell":
      return s.replace(/^'|'$/g, "").replace(/'\\''/g, "'")
  }
}

export default function StringEscaper() {
  const [input, setInput] = React.useState("")
  const [target, setTarget] = React.useState<Target>("json")
  const [mode, setMode] = React.useState<Mode>("escape")

  const result = React.useMemo(() => {
    if (!input) return { output: "", error: "" }
    try {
      return { output: mode === "escape" ? escape(input, target) : unescape(input, target), error: "" }
    } catch (e) {
      return { output: "", error: `Couldn’t unescape: ${(e as Error).message}` }
    }
  }, [input, target, mode])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented ariaLabel="Mode" value={mode} onChange={setMode} options={[{ value: "escape", label: "Escape" }, { value: "unescape", label: "Unescape" }]} />
        <Segmented ariaLabel="Target" size="sm" value={target} onChange={setTarget} options={TARGETS.map(({ value, label }) => ({ value, label }))} />
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={!result.output}
          onClick={() => {
            setInput(result.output)
            setMode(mode === "escape" ? "unescape" : "escape")
          }}
        >
          <ArrowLeftRight /> Swap
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{TARGETS.find((t) => t.value === target)!.hint}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Input"
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => setInput(mode === "escape" ? `He said "it's done"\n\tPath: C:\\temp\\new — ✓` : String.raw`He said \"it's done\"\n\tPath: C:\\temp\\new \u2014 \u2713`)}>
                Sample
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
                <Eraser /> Clear
              </Button>
            </>
          }
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "escape" ? "Raw text" : "Escaped text"} invalid={!!result.error} className={EDITOR_HEIGHT} aria-label="Input" />
        </Panel>
        <Panel title={mode === "escape" ? "Escaped" : "Unescaped"} actions={<CopyButton value={result.output} />}>
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
