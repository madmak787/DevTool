"use client"

import * as React from "react"
import { FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeArea, CopyButton, Message, Panel, Segmented } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const FLAGS = [
  { f: "g", label: "global", title: "Find all matches, not just the first" },
  { f: "i", label: "ignore case", title: "Case-insensitive" },
  { f: "m", label: "multiline", title: "^ and $ match at line breaks" },
  { f: "s", label: "dotall", title: ". also matches newlines" },
  { f: "u", label: "unicode", title: "Unicode mode" },
  { f: "y", label: "sticky", title: "Match only at lastIndex" },
] as const

const CHEATSHEET: [string, string][] = [
  [".", "Any character except newline"],
  ["\\d \\w \\s", "Digit, word character, whitespace"],
  ["\\D \\W \\S", "Not digit, word, whitespace"],
  ["[abc] [^abc]", "Any of / none of a, b, c"],
  ["[a-z]", "Character range"],
  ["^ $", "Start / end of string (or line with m)"],
  ["\\b", "Word boundary"],
  ["* + ?", "0 or more, 1 or more, 0 or 1"],
  ["{2,5}", "Between 2 and 5 times"],
  ["*? +?", "Lazy (as few as possible)"],
  ["(abc)", "Capture group"],
  ["(?<name>abc)", "Named capture group"],
  ["(?:abc)", "Group without capturing"],
  ["a|b", "a or b"],
  ["(?=a) (?!a)", "Followed by / not followed by a"],
  ["(?<=a) (?<!a)", "Preceded by / not preceded by a"],
]

const SAMPLE = {
  pattern: String.raw`(?<user>[\w.+-]+)@(?<domain>[\w-]+\.[\w.]+)`,
  text: `Contact ada@example.com or grace.hopper@navy.mil for access.
Invalid: someone@ and @nobody.org
Support: help+tools@khanamir.me`,
}

type Match = { index: number; text: string; groups: (string | undefined)[]; named?: Record<string, string | undefined> }

export default function RegexTester() {
  const [pattern, setPattern] = React.useState("")
  const [flags, setFlags] = React.useState("g")
  const [text, setText] = React.useState("")
  const [tab, setTab] = React.useState<"matches" | "replace">("matches")
  const [replacement, setReplacement] = React.useState("")

  const result = React.useMemo(() => {
    if (!pattern) return { error: "", matches: [] as Match[], regex: null as RegExp | null }
    let regex: RegExp
    try {
      regex = new RegExp(pattern, flags)
    } catch (e) {
      return { error: (e as Error).message, matches: [], regex: null }
    }
    const matches: Match[] = []
    if (flags.includes("g") || flags.includes("y")) {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g")
      for (const m of text.matchAll(re)) {
        matches.push({ index: m.index!, text: m[0], groups: m.slice(1), named: m.groups })
        if (matches.length >= 2000) break
        if (flags.includes("y") && !flags.includes("g")) break
      }
    } else {
      const m = regex.exec(text)
      if (m) matches.push({ index: m.index, text: m[0], groups: m.slice(1), named: m.groups })
    }
    return { error: "", matches, regex }
  }, [pattern, flags, text])

  const replaced = React.useMemo(() => {
    if (!result.regex) return ""
    try {
      return text.replace(result.regex, replacement)
    } catch {
      return ""
    }
  }, [result.regex, text, replacement])

  const highlighted = React.useMemo(() => {
    const parts: React.ReactNode[] = []
    let last = 0
    result.matches.forEach((m, i) => {
      if (m.index > last) parts.push(text.slice(last, m.index))
      parts.push(
        <mark key={i} className={cn("hl", i % 2 && "alt")} title={`Match ${i + 1}`}>
          {m.text || "​"}
        </mark>,
      )
      last = m.index + m.text.length
    })
    parts.push(text.slice(last))
    return parts
  }, [result.matches, text])

  const toggleFlag = (f: string) => setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : cur + f))
  const groupCount = result.matches[0]?.groups.length ?? 0
  const namedKeys = Object.keys(result.matches[0]?.named ?? {})

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4">
        <Panel
          title="Regular expression"
          actions={
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPattern(SAMPLE.pattern)
                  setText(SAMPLE.text)
                  setFlags("g")
                  setReplacement("$<user> at $<domain>")
                }}
              >
                <FileInput /> Sample
              </Button>
              <CopyButton value={pattern ? `/${pattern}/${flags}` : ""} label="Copy regex" />
            </>
          }
        >
          <div
            className={cn(
              "flex h-10 items-center rounded-md border bg-background font-mono text-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25 dark:bg-input/20",
              result.error && "border-destructive",
            )}
          >
            <span className="pl-3 text-muted-foreground">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="[A-Z]\w+"
              spellCheck={false}
              autoCapitalize="off"
              aria-label="Pattern"
              className="h-full min-w-0 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground/60"
            />
            <span className="pr-3 text-muted-foreground">/{flags}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FLAGS.map(({ f, label, title }) => (
              <button
                key={f}
                type="button"
                title={title}
                aria-pressed={flags.includes(f)}
                onClick={() => toggleFlag(f)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors",
                  flags.includes(f) ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-mono font-semibold">{f}</span> {label}
              </button>
            ))}
          </div>
          {result.error && <Message className="mt-3">{result.error}</Message>}
        </Panel>

        <Panel
          title="Test string"
          actions={
            pattern &&
            !result.error && (
              <span className={cn("text-xs font-medium", result.matches.length ? "text-success" : "text-muted-foreground")}>
                {result.matches.length} {result.matches.length === 1 ? "match" : "matches"}
              </span>
            )
          }
        >
          <CodeArea value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to test the pattern against" className="h-40 resize-y" aria-label="Test string" />
          {text && pattern && !result.error && (
            <div className="mt-3">
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Highlighted</div>
              <pre className="scroll-thin max-h-72 overflow-auto rounded-md border bg-muted/30 px-3 py-2.5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                {highlighted}
              </pre>
            </div>
          )}
        </Panel>

        <Panel
          title={
            <Segmented
              size="sm"
              ariaLabel="Result view"
              value={tab}
              onChange={setTab}
              options={[
                { value: "matches", label: "Match details" },
                { value: "replace", label: "Replace" },
              ]}
            />
          }
          actions={tab === "replace" && <CopyButton value={replaced} />}
          bodyClassName={tab === "matches" ? "p-0" : undefined}
        >
          {tab === "matches" ? (
            result.matches.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {pattern ? "No matches yet." : "Enter a pattern to see matches."}
              </p>
            ) : (
              <div className="scroll-thin max-h-96 overflow-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                    <tr className="border-b">
                      <th className="px-4 py-2 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Index</th>
                      <th className="px-2 py-2 font-medium">Match</th>
                      {Array.from({ length: groupCount }, (_, g) => (
                        <th key={g} className="px-2 py-2 font-medium">
                          ${g + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {result.matches.map((m, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="px-4 py-1.5 font-sans text-muted-foreground tabular-nums">{i + 1}</td>
                        <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{m.index}</td>
                        <td className="max-w-72 truncate px-2 py-1.5" title={m.text}>
                          {m.text || <span className="text-muted-foreground italic">empty</span>}
                        </td>
                        {m.groups.map((g, gi) => (
                          <td key={gi} className="max-w-56 truncate px-2 py-1.5" title={g}>
                            {g ?? <span className="text-muted-foreground">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {namedKeys.length > 0 && (
                  <p className="border-t px-4 py-2 text-xs text-muted-foreground">
                    Named groups: {namedKeys.map((k) => <code key={k} className="mr-2 font-mono">{k}</code>)}
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="space-y-3">
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="Replacement, e.g. $1 or $<name>"
                className="font-mono"
                aria-label="Replacement"
              />
              <CodeArea readOnly value={replaced} placeholder="Result after replacing" className="h-40 resize-y" aria-label="Replaced text" />
              <p className="text-xs text-muted-foreground">
                Use <code className="font-mono">$&amp;</code> for the whole match, <code className="font-mono">$1</code> for a group and{" "}
                <code className="font-mono">$&lt;name&gt;</code> for a named group. Without the g flag only the first match is replaced.
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Quick reference" className="h-fit xl:sticky xl:top-20" bodyClassName="p-0">
        <dl className="text-[13px]">
          {CHEATSHEET.map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b px-4 py-1.5 last:border-b-0">
              <dt className="w-24 shrink-0 font-mono text-primary">{k}</dt>
              <dd className="text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  )
}
