"use client"

import * as React from "react"
import { Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CodeArea, CopyButton, DownloadButton, EDITOR_HEIGHT, Message, Panel } from "@/components/tool-kit"
import { convert, parseInput, type InputFormat, type OutputFormat } from "@/lib/convert"

const OUTPUTS: { value: OutputFormat; label: string; file: string; mime: string }[] = [
  { value: "json", label: "JSON", file: "data.json", mime: "application/json" },
  { value: "yaml", label: "YAML", file: "data.yaml", mime: "text/yaml" },
  { value: "csv", label: "CSV", file: "data.csv", mime: "text/csv" },
  { value: "xml", label: "XML", file: "data.xml", mime: "application/xml" },
  { value: "typescript", label: "TypeScript types", file: "types.ts", mime: "text/plain" },
  { value: "php", label: "PHP array", file: "data.php", mime: "text/plain" },
  { value: "print_r", label: "PHP print_r", file: "print_r.txt", mime: "text/plain" },
  { value: "var_dump", label: "PHP var_dump", file: "var_dump.txt", mime: "text/plain" },
  { value: "sql", label: "SQL INSERT", file: "insert.sql", mime: "application/sql" },
]

const SAMPLE = `[
  { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "active": true, "tags": ["math", "poetry"] },
  { "id": 2, "name": "Alan Turing", "email": "alan@example.com", "active": false, "tags": [] },
  { "id": 3, "name": "Grace O'Hopper", "email": null, "active": true, "tags": ["navy"] }
]`

const INPUT_LABEL: Record<Exclude<InputFormat, "auto">, string> = { json: "JSON", yaml: "YAML", csv: "CSV" }

export default function DataConverter() {
  const [input, setInput] = React.useState("")
  const [from, setFrom] = React.useState<InputFormat>("auto")
  const [to, setTo] = React.useState<OutputFormat>("yaml")
  const [table, setTable] = React.useState("users")
  const [root, setRoot] = React.useState("root")

  const result = React.useMemo(() => {
    if (!input.trim()) return { output: "", error: "", detected: null }
    let parsed
    try {
      parsed = parseInput(input, from)
    } catch (e) {
      return { output: "", error: `Couldn’t read the input: ${(e as Error).message}`, detected: null }
    }
    try {
      return { output: convert(parsed.data, to, { table, root }), error: "", detected: parsed.detected }
    } catch (e) {
      return { output: "", error: (e as Error).message, detected: parsed.detected }
    }
  }, [input, from, to, table, root])

  const out = OUTPUTS.find((o) => o.value === to)!

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">From</span>
          <Select value={from} onValueChange={(v) => setFrom(v as InputFormat)}>
            <SelectTrigger className="w-40" aria-label="Input format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Detect automatically</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="csv">CSV (with header row)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">To</span>
          <Select value={to} onValueChange={(v) => setTo(v as OutputFormat)}>
            <SelectTrigger className="w-44" aria-label="Output format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUTS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {to === "sql" && (
          <div className="grid gap-1.5">
            <label htmlFor="table" className="text-xs font-medium text-muted-foreground">
              Table name
            </label>
            <Input id="table" value={table} onChange={(e) => setTable(e.target.value)} className="w-40 font-mono" />
          </div>
        )}
        {(to === "xml" || to === "typescript") && (
          <div className="grid gap-1.5">
            <label htmlFor="root" className="text-xs font-medium text-muted-foreground">
              {to === "xml" ? "Root element" : "Root type name"}
            </label>
            <Input id="root" value={root} onChange={(e) => setRoot(e.target.value)} className="w-40 font-mono" />
          </div>
        )}
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
          footer={result.detected ? <span>Read as {INPUT_LABEL[result.detected]}</span> : <span>JSON, YAML or CSV</span>}
        >
          <CodeArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste JSON, YAML or CSV, e.g.\n[{"name": "Ada", "age": 36}]'}
            invalid={!!result.error && !result.detected}
            className={EDITOR_HEIGHT}
            aria-label="Input data"
          />
        </Panel>

        <Panel
          title={out.label}
          actions={
            <>
              <CopyButton value={result.output} />
              <DownloadButton content={result.output} filename={out.file} mime={out.mime} iconOnly />
            </>
          }
        >
          {result.error ? (
            <div className={EDITOR_HEIGHT}>
              <Message>{result.error}</Message>
            </div>
          ) : (
            <CodeArea readOnly value={result.output} placeholder="Converted output appears here" className={EDITOR_HEIGHT} aria-label="Output" />
          )}
        </Panel>
      </div>
    </div>
  )
}
