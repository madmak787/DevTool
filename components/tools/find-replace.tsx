"use client"

import * as React from "react"
import { ArrowDownToLine, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeArea, CopyButton, DownloadButton, Field, Message, OptionSwitch, Panel } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export default function FindReplace() {
  const [text, setText] = React.useState("")
  const [find, setFind] = React.useState("")
  const [replace, setReplace] = React.useState("")
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [wholeWord, setWholeWord] = React.useState(false)
  const [useRegex, setUseRegex] = React.useState(false)

  const result = React.useMemo(() => {
    if (!find) return { regex: null, error: "", count: 0, output: text }
    let regex: RegExp
    try {
      let source = useRegex ? find : escapeRegex(find)
      if (wholeWord) source = `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`
      regex = new RegExp(source, `g${caseSensitive ? "" : "i"}${wholeWord ? "u" : ""}`)
    } catch (e) {
      return { regex: null, error: (e as Error).message, count: 0, output: text }
    }
    let count = 0
    const repl = useRegex ? replace.replace(/\\n/g, "\n").replace(/\\t/g, "\t") : replace
    const output = text.replace(regex, (...args) => {
      count++
      if (!useRegex) return repl
      // Expand $1, $<name> and $& the same way String.prototype.replace does
      const match = args[0] as string
      const hasNamed = typeof args[args.length - 1] === "object"
      const groups = (hasNamed ? args[args.length - 1] : {}) as Record<string, string>
      const caps = args.slice(1, hasNamed ? -3 : -2) as string[]
      return repl.replace(/\$(\$|&|<([^>]+)>|(\d{1,2}))/g, (whole, tok, name, num) => {
        if (tok === "$") return "$"
        if (tok === "&") return match
        if (name !== undefined) return groups?.[name] ?? ""
        const i = Number(num)
        return i >= 1 && i <= caps.length ? (caps[i - 1] ?? "") : whole
      })
    })
    return { regex, error: "", count, output }
  }, [text, find, replace, caseSensitive, wholeWord, useRegex])

  const preview = React.useMemo(() => {
    if (!result.regex || !result.count) return null
    const parts: React.ReactNode[] = []
    let last = 0
    let i = 0
    for (const m of text.matchAll(result.regex)) {
      if (m[0] === "") continue
      parts.push(text.slice(last, m.index))
      parts.push(
        <mark key={i} className={cn("hl", i % 2 && "alt")}>
          {m[0]}
        </mark>,
      )
      last = m.index! + m[0].length
      if (++i > 5000) break
    }
    parts.push(text.slice(last))
    return parts
  }, [text, result.regex, result.count])

  return (
    <div className="space-y-4">
      <Panel>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Find" htmlFor="find">
            <Input id="find" value={find} onChange={(e) => setFind(e.target.value)} placeholder={useRegex ? "Pattern, e.g. (\\w+)@(\\w+)" : "Text to find"} className="font-mono" aria-invalid={!!result.error || undefined} />
          </Field>
          <Field label="Replace with" htmlFor="replace">
            <Input id="replace" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder={useRegex ? "Replacement, e.g. $2: $1" : "Replacement text (can be empty)"} className="font-mono" />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <OptionSwitch id="case" label="Match case" checked={caseSensitive} onChange={setCaseSensitive} />
          <OptionSwitch id="word" label="Whole words" checked={wholeWord} onChange={setWholeWord} />
          <OptionSwitch id="regex" label="Regular expression" checked={useRegex} onChange={setUseRegex} />
          <span className={cn("ml-auto text-sm font-medium tabular-nums", result.count ? "text-foreground" : "text-muted-foreground")}>
            {find ? `${result.count} ${result.count === 1 ? "match" : "matches"}` : ""}
          </span>
        </div>
        {result.error && <Message className="mt-3">Invalid pattern: {result.error}</Message>}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Text"
          actions={
            <Button size="sm" variant="ghost" onClick={() => setText("")} disabled={!text}>
              <Eraser /> Clear
            </Button>
          }
        >
          <CodeArea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text to search" className="h-[45vh] min-h-64 resize-y" aria-label="Text" />
          {preview && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Show matches in the text</summary>
              <pre className="scroll-thin mt-2 max-h-72 overflow-auto rounded-md border bg-muted/30 px-3 py-2 font-mono text-[13px] whitespace-pre-wrap break-words">{preview}</pre>
            </details>
          )}
        </Panel>
        <Panel
          title="Result"
          actions={
            <>
              <Button size="sm" variant="outline" onClick={() => setText(result.output)} disabled={!result.count} title="Replace the text on the left with this result">
                <ArrowDownToLine className="-rotate-90" /> Apply
              </Button>
              <CopyButton value={result.output} />
              <DownloadButton content={result.output} filename="replaced.txt" iconOnly />
            </>
          }
        >
          <CodeArea readOnly value={result.output} placeholder="The text with replacements appears here" className="h-[45vh] min-h-64 resize-y" aria-label="Result" />
        </Panel>
      </div>
    </div>
  )
}
