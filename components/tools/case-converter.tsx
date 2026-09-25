"use client"

import * as React from "react"
import { Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, Panel } from "@/components/tool-kit"

/** Split an identifier or phrase into words: "parseHTTPResponse2xx_code" → parse, HTTP, Response, 2xx, code */
export function tokenize(s: string): string[] {
  return (
    s
      .replace(/([\p{Ll}\d])(\p{Lu})/gu, "$1 $2")
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  )
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
const SMALL = new Set("a an and as at but by en for if in nor of on or per the to v vs via".split(" "))

const perLine = (fn: (line: string) => string) => (s: string) => s.split("\n").map(fn).join("\n")

const CASES: { id: string; label: string; fn: (s: string) => string }[] = [
  { id: "sentence", label: "Sentence case", fn: (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_, p, c: string) => p + c.toUpperCase()) },
  { id: "lower", label: "lower case", fn: (s) => s.toLowerCase() },
  { id: "upper", label: "UPPER CASE", fn: (s) => s.toUpperCase() },
  {
    id: "title",
    label: "Title Case",
    fn: perLine((line) => {
      const parts = line.split(/(\s+)/)
      const idx = parts.map((p, i) => (p.trim() ? i : -1)).filter((i) => i >= 0)
      return parts
        .map((p, i) => {
          if (!p.trim()) return p
          const lower = p.toLowerCase()
          if (i !== idx[0] && i !== idx[idx.length - 1] && SMALL.has(lower)) return lower
          return p.replace(/\p{L}.*/u, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        })
        .join("")
    }),
  },
  { id: "camel", label: "camelCase", fn: perLine((l) => tokenize(l).map((w, i) => (i ? cap(w) : w.toLowerCase())).join("")) },
  { id: "pascal", label: "PascalCase", fn: perLine((l) => tokenize(l).map(cap).join("")) },
  { id: "snake", label: "snake_case", fn: perLine((l) => tokenize(l).map((w) => w.toLowerCase()).join("_")) },
  { id: "constant", label: "CONSTANT_CASE", fn: perLine((l) => tokenize(l).map((w) => w.toUpperCase()).join("_")) },
  { id: "kebab", label: "kebab-case", fn: perLine((l) => tokenize(l).map((w) => w.toLowerCase()).join("-")) },
  { id: "train", label: "Train-Case", fn: perLine((l) => tokenize(l).map(cap).join("-")) },
  { id: "dot", label: "dot.case", fn: perLine((l) => tokenize(l).map((w) => w.toLowerCase()).join(".")) },
  { id: "path", label: "path/case", fn: perLine((l) => tokenize(l).map((w) => w.toLowerCase()).join("/")) },
  {
    id: "inverse",
    label: "iNVERSE cASE",
    fn: (s) => Array.from(s, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
  },
  {
    id: "alternating",
    label: "aLtErNaTiNg",
    fn: (s) => {
      let i = 0
      return Array.from(s, (c) => (/\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join("")
    },
  },
]

export default function CaseConverter() {
  const [input, setInput] = React.useState("")

  return (
    <div className="space-y-4">
      <Panel
        title="Text"
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setInput("the quick brown fox\nparseHTTPResponse\nuser_account-id")}>
              <FileInput /> Sample
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
              <Eraser /> Clear
            </Button>
          </>
        }
      >
        <CodeArea
          mono={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text. Code cases (camelCase, snake_case…) convert each line separately."
          className="h-40 resize-y text-[15px]"
          aria-label="Text to convert"
        />
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CASES.map((c) => {
          const value = input ? c.fn(input) : ""
          return (
            <div key={c.id} className="flex min-w-0 flex-col rounded-xl border bg-card shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
                <span className="text-xs font-semibold">{c.label}</span>
                <div className="flex items-center">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={!value} onClick={() => setInput(value)}>
                    Use
                  </Button>
                  <CopyButton value={value} iconOnly variant="ghost" label={`Copy ${c.label}`} />
                </div>
              </div>
              <pre className="scroll-thin max-h-28 min-h-12 overflow-auto px-3 py-2 font-mono text-[13px] whitespace-pre-wrap break-words text-foreground/90">
                {value || <span className="text-muted-foreground/60">{c.fn("the quick brown fox")}</span>}
              </pre>
            </div>
          )
        })}
      </div>
    </div>
  )
}
