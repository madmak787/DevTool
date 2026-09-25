"use client"

import * as React from "react"
import { ArrowLeftRight, Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, EDITOR_HEIGHT, Panel, Segmented } from "@/components/tool-kit"

type Mode = "encode" | "decode"
type Scope = "minimal" | "non-ascii" | "all"

const BASIC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
const NAMED: Record<number, string> = {
  160: "nbsp", 169: "copy", 174: "reg", 8482: "trade", 8364: "euro", 163: "pound", 165: "yen", 162: "cent", 167: "sect",
  176: "deg", 177: "plusmn", 215: "times", 247: "divide", 8211: "ndash", 8212: "mdash", 8216: "lsquo", 8217: "rsquo",
  8220: "ldquo", 8221: "rdquo", 8226: "bull", 8230: "hellip", 8592: "larr", 8594: "rarr", 8593: "uarr", 8595: "darr",
  171: "laquo", 187: "raquo", 182: "para", 183: "middot", 8800: "ne", 8804: "le", 8805: "ge", 8734: "infin",
}

function encode(s: string, scope: Scope) {
  let out = ""
  for (const ch of s) {
    const cp = ch.codePointAt(0)!
    if (BASIC[ch]) out += BASIC[ch]
    else if (scope === "all" && ch !== "\n" && ch !== "\t" && ch !== " ") out += NAMED[cp] ? `&${NAMED[cp]};` : `&#${cp};`
    else if (scope !== "minimal" && cp > 126) out += NAMED[cp] ? `&${NAMED[cp]};` : `&#x${cp.toString(16).toUpperCase()};`
    else out += ch
  }
  return out
}

function decode(s: string) {
  if (typeof document === "undefined") return s
  const t = document.createElement("textarea")
  t.innerHTML = s
  return t.value
}

export default function HtmlEncoder() {
  const [mode, setMode] = React.useState<Mode>("encode")
  const [scope, setScope] = React.useState<Scope>("minimal")
  const [input, setInput] = React.useState("")

  const output = React.useMemo(() => (!input ? "" : mode === "encode" ? encode(input, scope) : decode(input)), [input, mode, scope])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Escape" },
            { value: "decode", label: "Unescape" },
          ]}
        />
        {mode === "encode" && (
          <Segmented
            ariaLabel="Characters to escape"
            size="sm"
            value={scope}
            onChange={setScope}
            options={[
              { value: "minimal", label: "Special characters", title: "& < > \" '" },
              { value: "non-ascii", label: "+ non-ASCII", title: "Also é, ©, emoji… as entities" },
              { value: "all", label: "Everything", title: "Every character as a numeric entity" },
            ]}
          />
        )}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={!output}
          onClick={() => {
            setInput(output)
            setMode(mode === "encode" ? "decode" : "encode")
          }}
        >
          <ArrowLeftRight /> Swap
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Input"
          actions={
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInput(mode === "encode" ? `<a href="/search?q=café&lang=en">Café © 2026 — “quotes” & more…</a>` : "&lt;p class=&quot;note&quot;&gt;Caf&eacute; &amp; cr&#232;me &#x1F600;&lt;/p&gt;")}
              >
                <FileInput /> Sample
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
                <Eraser /> Clear
              </Button>
            </>
          }
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "HTML or text to escape" : "Text with entities like &amp;lt; &amp;#233; &amp;copy;"} className={EDITOR_HEIGHT} aria-label="Input" />
        </Panel>
        <Panel title={mode === "encode" ? "Escaped" : "Unescaped"} actions={<CopyButton value={output} />}>
          <CodeArea readOnly value={output} placeholder="Result appears here" className={EDITOR_HEIGHT} aria-label="Output" />
        </Panel>
      </div>
    </div>
  )
}
