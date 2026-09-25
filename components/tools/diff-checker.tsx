"use client"

import * as React from "react"
import { diffArrays, diffWordsWithSpace } from "diff"
import { ArrowLeftRight, Eraser, FileInput, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

type Side = { n: number; text: string }
type Row = { kind: "same" | "change" | "del" | "add"; left?: Side; right?: Side }
type Item = { type: "row"; row: Row } | { type: "gap"; count: number }

const SAMPLE_A = `server:
  host: localhost
  port: 8080
  debug: true
database:
  name: app_dev
  pool: 5
features:
  - search
  - export`
const SAMPLE_B = `server:
  host: 0.0.0.0
  port: 8080
database:
  name: app_production
  pool: 20
  ssl: true
features:
  - search
  - export
  - billing`

function splitLines(s: string) {
  if (s === "") return []
  return s.replace(/\r\n?/g, "\n").split("\n")
}

function buildRows(a: string, b: string, ignoreWs: boolean, ignoreCase: boolean): Row[] {
  const norm = (l: string) => {
    let s = ignoreWs ? l.replace(/\s+/g, " ").trim() : l
    if (ignoreCase) s = s.toLowerCase()
    return s
  }
  const left = splitLines(a)
  const right = splitLines(b)
  const changes = diffArrays(left, right, { comparator: (x: string, y: string) => norm(x) === norm(y) })
  const rows: Row[] = []
  let ln = 1
  let rn = 1
  for (let i = 0; i < changes.length; i++) {
    const c = changes[i]
    if (!c.added && !c.removed) {
      // c.value holds the left side's lines; with ignore options the right side's text can differ, so read it directly
      for (let k = 0; k < c.value.length; k++) {
        rows.push({ kind: "same", left: { n: ln, text: left[ln - 1] }, right: { n: rn, text: right[rn - 1] } })
        ln++
        rn++
      }
    } else if (c.removed) {
      const next = changes[i + 1]
      const removed = c.value
      const added = next?.added ? next.value : []
      if (next?.added) i++
      const pairs = Math.max(removed.length, added.length)
      for (let k = 0; k < pairs; k++) {
        const l = k < removed.length ? { n: ln++, text: removed[k] } : undefined
        const r = k < added.length ? { n: rn++, text: added[k] } : undefined
        rows.push({ kind: l && r ? "change" : l ? "del" : "add", left: l, right: r })
      }
    } else {
      for (const text of c.value) rows.push({ kind: "add", right: { n: rn++, text } })
    }
  }
  return rows
}

function collapse(rows: Row[], context: number): Item[] {
  const keep = new Array(rows.length).fill(false)
  rows.forEach((r, i) => {
    if (r.kind !== "same") for (let k = Math.max(0, i - context); k <= Math.min(rows.length - 1, i + context); k++) keep[k] = true
  })
  const items: Item[] = []
  let gap = 0
  rows.forEach((row, i) => {
    if (keep[i]) {
      if (gap) items.push({ type: "gap", count: gap })
      gap = 0
      items.push({ type: "row", row })
    } else gap++
  })
  if (gap) items.push({ type: "gap", count: gap })
  return items
}

function WordDiff({ a, b, side }: { a: string; b: string; side: "left" | "right" }) {
  const parts = diffWordsWithSpace(a, b)
  return (
    <>
      {parts.map((p, i) => {
        if (side === "left" && p.added) return null
        if (side === "right" && p.removed) return null
        const hl = (side === "left" && p.removed) || (side === "right" && p.added)
        return (
          <span key={i} className={cn(hl && (side === "left" ? "rounded-sm bg-diff-del/30" : "rounded-sm bg-diff-add/30"))}>
            {p.value}
          </span>
        )
      })}
    </>
  )
}

const lineBg = {
  del: "bg-diff-del/10",
  add: "bg-diff-add/10",
}

function Gutter({ n, className }: { n?: number; className?: string }) {
  return (
    <span className={cn("w-12 shrink-0 select-none border-r px-2 text-right text-muted-foreground/70 tabular-nums", className)}>
      {n ?? ""}
    </span>
  )
}

function Code({ children, sign, className }: { children: React.ReactNode; sign: string; className?: string }) {
  return (
    <span className={cn("flex min-w-0 flex-1 gap-2 px-2 whitespace-pre-wrap break-all", className)}>
      <span className="w-2 shrink-0 select-none text-muted-foreground/70">{sign}</span>
      <span className="min-w-0 flex-1">{children === "" ? "​" : children}</span>
    </span>
  )
}

function GapRow({ count }: { count: number }) {
  return (
    <div className="border-y bg-muted/50 px-3 py-1 text-center text-xs text-muted-foreground">
      ⋯ {count} unchanged {count === 1 ? "line" : "lines"}
    </div>
  )
}

function SplitView({ items }: { items: Item[] }) {
  return (
    <div className="font-mono text-[13px] leading-6">
      {items.map((it, i) => {
        if (it.type === "gap") return <GapRow key={i} count={it.count} />
        const { row } = it
        const leftCls = row.kind === "change" || row.kind === "del" ? lineBg.del : row.kind === "add" ? "bg-muted/40" : ""
        const rightCls = row.kind === "change" || row.kind === "add" ? lineBg.add : row.kind === "del" ? "bg-muted/40" : ""
        return (
          <div key={i} className="grid grid-cols-2">
            <div className={cn("flex border-r", leftCls)}>
              <Gutter n={row.left?.n} />
              <Code sign={row.left && row.kind !== "same" ? "−" : ""}>
                {row.left ? row.kind === "change" ? <WordDiff a={row.left.text} b={row.right!.text} side="left" /> : row.left.text : ""}
              </Code>
            </div>
            <div className={cn("flex", rightCls)}>
              <Gutter n={row.right?.n} />
              <Code sign={row.right && row.kind !== "same" ? "+" : ""}>
                {row.right ? row.kind === "change" ? <WordDiff a={row.left!.text} b={row.right.text} side="right" /> : row.right.text : ""}
              </Code>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UnifiedView({ items }: { items: Item[] }) {
  const out: React.ReactNode[] = []
  let block: Row[] = []
  const flush = (key: string) => {
    if (!block.length) return
    const lefts = block.filter((r) => r.left)
    const rights = block.filter((r) => r.right)
    lefts.forEach((r, i) =>
      out.push(
        <div key={`${key}-l${i}`} className={cn("flex", lineBg.del)}>
          <Gutter n={r.left!.n} />
          <Gutter />
          <Code sign="−">{r.kind === "change" ? <WordDiff a={r.left!.text} b={r.right!.text} side="left" /> : r.left!.text}</Code>
        </div>,
      ),
    )
    rights.forEach((r, i) =>
      out.push(
        <div key={`${key}-r${i}`} className={cn("flex", lineBg.add)}>
          <Gutter />
          <Gutter n={r.right!.n} />
          <Code sign="+">{r.kind === "change" ? <WordDiff a={r.left!.text} b={r.right!.text} side="right" /> : r.right!.text}</Code>
        </div>,
      ),
    )
    block = []
  }
  items.forEach((it, i) => {
    if (it.type === "row" && it.row.kind !== "same") {
      block.push(it.row)
      return
    }
    flush(String(i))
    if (it.type === "gap") out.push(<GapRow key={i} count={it.count} />)
    else
      out.push(
        <div key={i} className="flex">
          <Gutter n={it.row.left!.n} />
          <Gutter n={it.row.right!.n} />
          <Code sign="">{it.row.left!.text}</Code>
        </div>,
      )
  })
  flush("end")
  return <div className="font-mono text-[13px] leading-6">{out}</div>
}

function FileButton({ onText }: { onText: (text: string) => void }) {
  const ref = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => ref.current?.click()}>
        <FolderOpen /> Open
      </Button>
      <input
        ref={ref}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) onText(await f.text())
          e.target.value = ""
        }}
      />
    </>
  )
}

export default function DiffChecker() {
  const [a, setA] = React.useState("")
  const [b, setB] = React.useState("")
  const [view, setView] = React.useState<"split" | "unified">("split")
  const [ignoreWs, setIgnoreWs] = React.useState(false)
  const [ignoreCase, setIgnoreCase] = React.useState(false)
  const [onlyChanges, setOnlyChanges] = React.useState(true)
  const da = React.useDeferredValue(a)
  const db = React.useDeferredValue(b)

  const rows = React.useMemo(() => buildRows(da, db, ignoreWs, ignoreCase), [da, db, ignoreWs, ignoreCase])
  const stats = React.useMemo(
    () => ({
      added: rows.filter((r) => r.right && r.kind !== "same").length,
      removed: rows.filter((r) => r.left && r.kind !== "same").length,
    }),
    [rows],
  )
  const items = React.useMemo<Item[]>(
    () => (onlyChanges ? collapse(rows, 3) : rows.map((row) => ({ type: "row", row }))),
    [rows, onlyChanges],
  )
  const hasInput = a.length > 0 || b.length > 0
  const identical = hasInput && stats.added === 0 && stats.removed === 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Original"
          actions={
            <>
              <FileButton onText={setA} />
              <Button size="sm" variant="ghost" onClick={() => setA("")} disabled={!a} aria-label="Clear original">
                <Eraser />
              </Button>
            </>
          }
        >
          <CodeArea value={a} onChange={(e) => setA(e.target.value)} placeholder="Paste the original text" className="h-64 resize-y" aria-label="Original text" />
        </Panel>
        <Panel
          title="Changed"
          actions={
            <>
              <FileButton onText={setB} />
              <Button size="sm" variant="ghost" onClick={() => setB("")} disabled={!b} aria-label="Clear changed">
                <Eraser />
              </Button>
            </>
          }
        >
          <CodeArea value={b} onChange={(e) => setB(e.target.value)} placeholder="Paste the changed text" className="h-64 resize-y" aria-label="Changed text" />
        </Panel>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Segmented
          ariaLabel="View"
          value={view}
          onChange={setView}
          options={[
            { value: "split", label: "Side by side" },
            { value: "unified", label: "Unified" },
          ]}
        />
        <OptionSwitch id="only-changes" label="Hide unchanged lines" checked={onlyChanges} onChange={setOnlyChanges} />
        <OptionSwitch id="ignore-ws" label="Ignore whitespace" checked={ignoreWs} onChange={setIgnoreWs} />
        <OptionSwitch id="ignore-case" label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setA(b)
              setB(a)
            }}
            disabled={!hasInput}
          >
            <ArrowLeftRight /> Swap
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setA(SAMPLE_A)
              setB(SAMPLE_B)
            }}
          >
            <FileInput /> Sample
          </Button>
        </div>
      </div>

      <Panel
        title="Differences"
        actions={
          hasInput && (
            <div className="flex items-center gap-3 text-xs font-medium tabular-nums">
              <span className="text-diff-add">+{stats.added} added</span>
              <span className="text-diff-del">−{stats.removed} removed</span>
            </div>
          )
        }
        bodyClassName="p-0"
      >
        {!hasInput ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Paste two texts above to compare them.</p>
        ) : identical ? (
          <p className="px-4 py-12 text-center text-sm text-success">The two texts are identical{ignoreWs || ignoreCase ? " (with the ignore options applied)" : ""}.</p>
        ) : (
          <div className="scroll-thin max-h-[70vh] overflow-auto">
            <div className={cn(view === "split" && "min-w-[640px]")}>
              {view === "split" ? <SplitView items={items} /> : <UnifiedView items={items} />}
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
