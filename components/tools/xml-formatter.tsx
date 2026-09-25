"use client"

import * as React from "react"
import xmlFormat from "xml-formatter"
import { CircleCheck, Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, DownloadButton, EDITOR_HEIGHT, Message, OptionSwitch, Panel, Segmented, byteLength, formatBytes } from "@/components/tool-kit"

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><catalog><!-- Sample data --><book id="bk101" available="true"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><price currency="USD">44.95</price><tags><tag>xml</tag><tag>guide</tag></tags></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><price currency="USD">5.95</price><description/></book></catalog>`

/** Check well-formedness with the browser's XML parser and pull out its error message */
function validate(xml: string): string | null {
  if (typeof DOMParser === "undefined") return null
  const doc = new DOMParser().parseFromString(xml, "application/xml")
  const err = doc.getElementsByTagName("parsererror")[0]
  if (!err) return null
  const text = err.textContent ?? "Invalid XML"
  const m = /line (\d+) at column (\d+): (.*)/i.exec(text) ?? /(.*)/.exec(text)
  return m && m.length === 4 ? `Line ${m[1]}, column ${m[2]}: ${m[3].trim()}` : text.replace(/^This page contains the following errors:/, "").split("Below is")[0].trim()
}

export default function XmlFormatter() {
  const [input, setInput] = React.useState("")
  const [mode, setMode] = React.useState<"format" | "minify">("format")
  const [indent, setIndent] = React.useState<"2" | "4" | "tab">("2")
  const [collapse, setCollapse] = React.useState(true)
  const [comments, setComments] = React.useState(true)

  const result = React.useMemo(() => {
    if (!input.trim()) return { output: "", error: "" }
    const error = validate(input)
    if (error) return { output: "", error }
    try {
      const output = xmlFormat(input, {
        indentation: mode === "minify" ? "" : indent === "tab" ? "\t" : " ".repeat(Number(indent)),
        collapseContent: collapse,
        lineSeparator: mode === "minify" ? "" : "\n",
        filter: (node) => comments || node.type !== "Comment",
        whiteSpaceAtEndOfSelfclosingTag: true,
      })
      return { output, error: "" }
    } catch (e) {
      return { output: "", error: (e as Error).message }
    }
  }, [input, mode, indent, collapse, comments])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Segmented ariaLabel="Mode" value={mode} onChange={setMode} options={[{ value: "format", label: "Format" }, { value: "minify", label: "Minify" }]} />
        {mode === "format" && (
          <>
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
            <OptionSwitch id="collapse" label="Keep short text on one line" checked={collapse} onChange={setCollapse} />
          </>
        )}
        <OptionSwitch id="comments" label="Keep comments" checked={comments} onChange={setComments} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="XML"
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
          footer={<span>{formatBytes(byteLength(input))}</span>}
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste XML, SVG, RSS, a sitemap…" invalid={!!result.error} className={EDITOR_HEIGHT} aria-label="XML input" />
        </Panel>
        <Panel
          title="Output"
          actions={
            <>
              <CopyButton value={result.output} />
              <DownloadButton content={result.output} filename="formatted.xml" mime="application/xml" iconOnly />
            </>
          }
          footer={
            result.output ? (
              <>
                <span className="inline-flex items-center gap-1 text-success">
                  <CircleCheck className="size-3.5" /> Well-formed
                </span>
                <span>{formatBytes(byteLength(result.output))}</span>
              </>
            ) : undefined
          }
        >
          {result.error ? (
            <div className={EDITOR_HEIGHT}>
              <Message>
                <p className="font-medium">Not well-formed XML</p>
                <p className="mt-0.5 break-words">{result.error}</p>
              </Message>
            </div>
          ) : (
            <CodeArea readOnly value={result.output} placeholder="Formatted XML appears here" className={EDITOR_HEIGHT} aria-label="Formatted XML" />
          )}
        </Panel>
      </div>
    </div>
  )
}
