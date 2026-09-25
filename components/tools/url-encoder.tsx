"use client"

import * as React from "react"
import { ArrowLeftRight, Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, Message, OptionSwitch, Panel, Segmented, ValueRow } from "@/components/tool-kit"

type Mode = "encode" | "decode"
type Scope = "component" | "uri"

const SAMPLE = "https://example.com/search?q=café & crème&tags=a,b&redirect=/home?tab=1#results"

export default function UrlEncoder() {
  const [mode, setMode] = React.useState<Mode>("encode")
  const [scope, setScope] = React.useState<Scope>("component")
  const [plus, setPlus] = React.useState(false)
  const [input, setInput] = React.useState("")

  const result = React.useMemo(() => {
    if (!input) return { output: "", error: "" }
    try {
      if (mode === "encode") {
        let out = scope === "component" ? encodeURIComponent(input) : encodeURI(input)
        if (plus) out = out.replace(/%20/g, "+")
        return { output: out, error: "" }
      }
      const src = plus ? input.replace(/\+/g, " ") : input
      return { output: scope === "component" ? decodeURIComponent(src) : decodeURI(src), error: "" }
    } catch {
      return { output: "", error: "This text has a malformed % escape (a % must be followed by two hex digits forming valid UTF-8)." }
    }
  }, [input, mode, scope, plus])

  const parsed = React.useMemo(() => {
    const candidate = (mode === "decode" ? result.output : input).trim()
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(candidate)) return null
    try {
      return new URL(candidate)
    } catch {
      return null
    }
  }, [input, mode, result.output])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
        <Segmented
          ariaLabel="Scope"
          size="sm"
          value={scope}
          onChange={setScope}
          options={[
            { value: "component", label: "Component", title: "encodeURIComponent: also escapes / ? & = # for use inside a parameter" },
            { value: "uri", label: "Full URL", title: "encodeURI: keeps the URL structure (/ ? & = #) intact" },
          ]}
        />
        <OptionSwitch id="plus" label="Spaces as +" checked={plus} onChange={setPlus} />
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
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "Text or URL to encode" : "Encoded text, e.g. caf%C3%A9%20cr%C3%A8me"} invalid={!!result.error} className="h-48 resize-y break-all" aria-label="Input" />
        </Panel>
        <Panel title={mode === "encode" ? "Encoded" : "Decoded"} actions={<CopyButton value={result.output} />}>
          {result.error ? <Message>{result.error}</Message> : <CodeArea readOnly value={result.output} placeholder="Result appears here" className="h-48 resize-y break-all" aria-label="Output" />}
        </Panel>
      </div>

      {parsed && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="URL parts" bodyClassName="py-1">
            <ValueRow label="Protocol" value={parsed.protocol} />
            {parsed.username && <ValueRow label="Username" value={parsed.username} />}
            <ValueRow label="Host" value={parsed.hostname} />
            <ValueRow label="Port" value={parsed.port} placeholder="default" />
            <ValueRow label="Path" value={decodeURIComponentSafe(parsed.pathname)} />
            <ValueRow label="Query" value={parsed.search} />
            <ValueRow label="Fragment" value={parsed.hash} />
            <ValueRow label="Origin" value={parsed.origin} />
          </Panel>
          <Panel title={`Query parameters (${[...parsed.searchParams].length})`} bodyClassName="p-0">
            {[...parsed.searchParams].length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No query parameters.</p>
            ) : (
              <table className="w-full text-left text-[13px]">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-2 py-2 font-medium">Value (decoded)</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[...parsed.searchParams].map(([k, v], i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-1.5 text-primary">{k}</td>
                      <td className="px-2 py-1.5 break-all">{v || <span className="text-muted-foreground">empty</span>}</td>
                      <td className="w-10 pr-2">
                        <CopyButton value={v} iconOnly variant="ghost" label={`Copy ${k}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

function decodeURIComponentSafe(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
