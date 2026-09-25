"use client"

import * as React from "react"
import { ArrowDownToLine, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, DownloadButton, EDITOR_HEIGHT, Panel } from "@/components/tool-kit"

/** Input on the left, live output on the right, options above: the layout shared by line-based text tools */
export function LineTool({
  input,
  setInput,
  output,
  options,
  inputFooter,
  outputFooter,
  placeholder = "One item per line",
  filename = "output.txt",
}: {
  input: string
  setInput: (v: string) => void
  output: string
  options: React.ReactNode
  inputFooter?: React.ReactNode
  outputFooter?: React.ReactNode
  placeholder?: string
  filename?: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">{options}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Input"
          actions={
            <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
              <Eraser /> Clear
            </Button>
          }
          footer={inputFooter}
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className={EDITOR_HEIGHT} aria-label="Input" />
        </Panel>
        <Panel
          title="Output"
          actions={
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInput(output)}
                disabled={!output || output === input}
                title="Move the output into the input to keep working on it"
              >
                <ArrowDownToLine className="-rotate-90" /> Use as input
              </Button>
              <CopyButton value={output} />
              <DownloadButton content={output} filename={filename} iconOnly />
            </>
          }
          footer={outputFooter}
        >
          <CodeArea readOnly value={output} placeholder="Result appears here" className={EDITOR_HEIGHT} aria-label="Output" />
        </Panel>
      </div>
    </div>
  )
}
