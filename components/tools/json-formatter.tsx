"use client"

import * as React from "react"
import { CircleCheck, Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CodeArea,
  CopyButton,
  DownloadButton,
  EDITOR_HEIGHT,
  Message,
  OptionSwitch,
  Panel,
  Segmented,
  byteLength,
  formatBytes,
} from "@/components/tool-kit"

const SAMPLE = `{"name":"DevTools","version":2,"private":true,"tags":["json","formatter"],"author":{"name":"Mohd Amir Khan","url":"https://khanamir.me"},"tools":[{"slug":"json-formatter","live":true},{"slug":"diff-checker","live":true}],"license":null}`

type Indent = "2" | "4" | "tab"

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    )
  }
  return value
}

/** Find where JSON stops being valid. Only runs after JSON.parse fails, to locate the error. */
function findJsonError(s: string): { pos: number; message: string } {
  let i = 0
  const fail = (message: string): never => {
    throw { pos: i, message }
  }
  const ws = () => {
    while (i < s.length && " \t\n\r".includes(s[i])) i++
  }
  const describe = () => (i >= s.length ? "Unexpected end of input" : `Unexpected character ${JSON.stringify(s[i])}`)
  const string = () => {
    i++
    while (i < s.length && s[i] !== '"') {
      if (s[i] === "\\") {
        i++
        if (s[i] === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(s.slice(i + 1, i + 5))) fail("Invalid \\u escape")
          i += 4
        } else if (!'"\\/bfnrt'.includes(s[i])) fail("Invalid escape sequence")
      } else if (s.charCodeAt(i) < 0x20) fail("Control character in string (use \\n or \\t)")
      i++
    }
    if (i >= s.length) fail("Unterminated string")
    i++
  }
  const value = (): void => {
    ws()
    const c = s[i]
    if (c === "{") {
      i++
      ws()
      if (s[i] === "}") return void i++
      for (;;) {
        ws()
        if (s[i] !== '"') fail(s[i] === "}" ? "Trailing comma before }" : `Expected a quoted property name. ${describe()}`)
        string()
        ws()
        if (s[i] !== ":") fail(`Expected ':' after property name. ${describe()}`)
        i++
        value()
        ws()
        if (s[i] === ",") i++
        else if (s[i] === "}") return void i++
        else fail(`Expected ',' or '}'. ${describe()}`)
      }
    }
    if (c === "[") {
      i++
      ws()
      if (s[i] === "]") return void i++
      for (;;) {
        ws()
        if (s[i] === "]") fail("Trailing comma before ]")
        value()
        ws()
        if (s[i] === ",") i++
        else if (s[i] === "]") return void i++
        else fail(`Expected ',' or ']'. ${describe()}`)
      }
    }
    if (c === '"') return string()
    const lit = /^(true|false|null|-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?)/.exec(s.slice(i))
    if (lit) return void (i += lit[0].length)
    if (c === "'") fail("Strings must use double quotes")
    fail(describe())
  }
  try {
    value()
    ws()
    if (i < s.length) fail(`Unexpected content after the JSON value: ${JSON.stringify(s[i])}`)
  } catch (e) {
    if (e && typeof e === "object" && "pos" in e) return e as { pos: number; message: string }
  }
  return { pos: s.length, message: "Invalid JSON" }
}

/** Turn a JSON.parse failure into a message with the exact line and column */
export function describeJsonError(input: string) {
  const { pos, message } = findJsonError(input)
  const before = input.slice(0, pos)
  const line = before.split("\n").length
  const column = before.length - before.lastIndexOf("\n")
  return { message, line, column }
}

export default function JsonFormatter() {
  const [input, setInput] = React.useState("")
  const [mode, setMode] = React.useState<"format" | "minify">("format")
  const [indent, setIndent] = React.useState<Indent>("2")
  const [sorted, setSorted] = React.useState(false)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const result = React.useMemo(() => {
    if (!input.trim()) return { output: "", error: null }
    try {
      let data = JSON.parse(input)
      if (sorted) data = sortKeys(data)
      const space = mode === "minify" ? undefined : indent === "tab" ? "\t" : Number(indent)
      return { output: JSON.stringify(data, null, space), error: null }
    } catch {
      return { output: "", error: describeJsonError(input) }
    }
  }, [input, mode, indent, sorted])

  const jumpToError = () => {
    const el = inputRef.current
    const err = result.error
    if (!el || !err?.line) return
    const lines = input.split("\n")
    const offset = lines.slice(0, err.line - 1).reduce((n, l) => n + l.length + 1, 0) + (err.column ?? 1) - 1
    el.focus()
    el.setSelectionRange(offset, Math.min(offset + 1, input.length))
  }

  const inBytes = byteLength(input)
  const outBytes = byteLength(result.output)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          ariaLabel="Output style"
          value={mode}
          onChange={setMode}
          options={[
            { value: "format", label: "Format" },
            { value: "minify", label: "Minify" },
          ]}
        />
        {mode === "format" && (
          <Segmented
            ariaLabel="Indentation"
            size="sm"
            value={indent}
            onChange={setIndent}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
              { value: "tab", label: "Tabs" },
            ]}
          />
        )}
        <OptionSwitch id="sort-keys" label="Sort keys" checked={sorted} onChange={setSorted} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Input"
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)}>
                <FileInput /> Sample
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
                <Eraser /> Clear
              </Button>
            </>
          }
          footer={<span>{formatBytes(inBytes)}</span>}
        >
          <CodeArea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste JSON here, e.g. {"name": "Ada", "age": 36}'
            invalid={!!result.error}
            className={EDITOR_HEIGHT}
            aria-label="JSON input"
          />
        </Panel>

        <Panel
          title="Output"
          actions={
            <>
              <CopyButton value={result.output} />
              <DownloadButton content={result.output} filename="formatted.json" mime="application/json" iconOnly />
            </>
          }
          footer={
            result.output ? (
              <>
                <span className="inline-flex items-center gap-1 text-success">
                  <CircleCheck className="size-3.5" /> Valid JSON
                </span>
                <span>{formatBytes(outBytes)}</span>
                {inBytes > 0 && outBytes !== inBytes && (
                  <span>
                    {outBytes < inBytes ? "−" : "+"}
                    {Math.abs(Math.round(((outBytes - inBytes) / inBytes) * 100))}% vs input
                  </span>
                )}
              </>
            ) : (
              <span>Output updates as you type</span>
            )
          }
        >
          {result.error ? (
            <div className={`${EDITOR_HEIGHT} flex flex-col gap-3`}>
              <Message>
                <p className="font-medium">Invalid JSON</p>
                <p className="mt-0.5 break-words">{result.error.message}</p>
                {result.error.line && (
                  <button type="button" onClick={jumpToError} className="mt-1.5 text-xs font-medium underline underline-offset-2">
                    Go to line {result.error.line}, column {result.error.column}
                  </button>
                )}
              </Message>
            </div>
          ) : (
            <CodeArea
              readOnly
              value={result.output}
              placeholder="Formatted JSON appears here"
              className={EDITOR_HEIGHT}
              aria-label="Formatted JSON"
            />
          )}
        </Panel>
      </div>
    </div>
  )
}
