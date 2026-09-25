"use client"

import * as React from "react"
import { Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, OptionSwitch, Panel, Stat, byteLength, formatBytes } from "@/components/tool-kit"
import { graphemes, sentences, splitLines, words } from "@/lib/text"

const STOP_WORDS = new Set(
  "a an and are as at be but by for from has have he her his i in is it its of on or our she that the their them they this to was we were will with you your not so if do did can".split(" "),
)

function duration(minutes: number) {
  if (minutes === 0) return "0 sec"
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))} sec`
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return s ? `${m} min ${s} sec` : `${m} min`
}

export default function WordCounter() {
  const [text, setText] = React.useState("")
  const [skipCommon, setSkipCommon] = React.useState(true)
  const deferred = React.useDeferredValue(text)

  const stats = React.useMemo(() => {
    const w = words(deferred)
    const chars = graphemes(deferred)
    const freq = new Map<string, number>()
    for (const word of w) {
      const k = word.toLowerCase()
      if (skipCommon && (STOP_WORDS.has(k) || k.length < 2)) continue
      freq.set(k, (freq.get(k) ?? 0) + 1)
    }
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12)
    return {
      words: w.length,
      unique: new Set(w.map((x) => x.toLowerCase())).size,
      characters: chars.length,
      noSpaces: chars.filter((c) => !/\s/.test(c)).length,
      sentences: sentences(deferred),
      paragraphs: deferred.split(/\n\s*\n/).filter((p) => p.trim()).length,
      lines: deferred ? splitLines(deferred).length : 0,
      bytes: byteLength(deferred),
      avgWord: w.length ? w.reduce((n, x) => n + graphemes(x).length, 0) / w.length : 0,
      reading: w.length / 238,
      speaking: w.length / 150,
      top,
    }
  }, [deferred, skipCommon])

  const max = stats.top[0]?.[1] ?? 1

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Words" value={stats.words.toLocaleString()} emphasis />
          <Stat label="Characters" value={stats.characters.toLocaleString()} sub={`${stats.noSpaces.toLocaleString()} without spaces`} />
          <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
          <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        </div>
        <Panel
          title="Text"
          actions={
            <>
              <CopyButton value={text} iconOnly />
              <Button size="sm" variant="ghost" onClick={() => setText("")} disabled={!text}>
                <Eraser /> Clear
              </Button>
            </>
          }
        >
          <CodeArea
            mono={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text"
            className="h-[50vh] min-h-72 resize-y text-[15px] leading-7"
            aria-label="Text to count"
          />
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Details" bodyClassName="p-0">
          <dl className="text-sm">
            {[
              ["Reading time", duration(stats.reading)],
              ["Speaking time", duration(stats.speaking)],
              ["Unique words", stats.unique.toLocaleString()],
              ["Average word length", stats.avgWord ? `${stats.avgWord.toFixed(1)} characters` : "—"],
              ["Lines", stats.lines.toLocaleString()],
              ["Size (UTF-8)", formatBytes(stats.bytes)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b px-4 py-2 last:border-b-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Most used words" actions={<OptionSwitch id="skip-common" label="Skip common" checked={skipCommon} onChange={setSkipCommon} />}>
          {stats.top.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Word frequency appears here.</p>
          ) : (
            <ul className="space-y-1.5">
              {stats.top.map(([w, n]) => (
                <li key={w} className="relative flex items-center justify-between overflow-hidden rounded-md px-2 py-1 text-sm">
                  <span className="absolute inset-y-0 left-0 rounded-md bg-primary/10" style={{ width: `${(n / max) * 100}%` }} />
                  <span className="relative truncate">{w}</span>
                  <span className="relative text-muted-foreground tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
