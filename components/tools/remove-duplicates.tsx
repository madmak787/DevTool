"use client"

import * as React from "react"
import { OptionSwitch } from "@/components/tool-kit"
import { LineTool } from "@/components/line-tool"
import { splitLines } from "@/lib/text"

export default function RemoveDuplicates() {
  const [input, setInput] = React.useState("")
  const [ignoreCase, setIgnoreCase] = React.useState(false)
  const [trim, setTrim] = React.useState(true)
  const [removeEmpty, setRemoveEmpty] = React.useState(true)
  const [showRemoved, setShowRemoved] = React.useState(false)

  const result = React.useMemo(() => {
    if (!input) return { output: "", total: 0, kept: 0, removed: [] as string[] }
    const lines = splitLines(input)
    const seen = new Set<string>()
    const kept: string[] = []
    const removed: string[] = []
    for (const raw of lines) {
      const line = trim ? raw.trim() : raw
      if (removeEmpty && line.trim() === "") continue
      const key = ignoreCase ? line.toLowerCase() : line
      if (seen.has(key)) removed.push(line)
      else {
        seen.add(key)
        kept.push(line)
      }
    }
    return { output: (showRemoved ? removed : kept).join("\n"), total: lines.length, kept: kept.length, removed }
  }, [input, ignoreCase, trim, removeEmpty, showRemoved])

  return (
    <LineTool
      input={input}
      setInput={setInput}
      output={result.output}
      filename={showRemoved ? "duplicates.txt" : "unique.txt"}
      inputFooter={<span>{result.total} lines</span>}
      outputFooter={
        input ? (
          <>
            <span>{result.kept} unique</span>
            <span className={result.removed.length ? "font-medium text-foreground" : ""}>
              {result.removed.length} duplicate{result.removed.length === 1 ? "" : "s"} removed
            </span>
          </>
        ) : null
      }
      options={
        <>
          <OptionSwitch id="case" label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
          <OptionSwitch id="trim" label="Ignore surrounding spaces" checked={trim} onChange={setTrim} />
          <OptionSwitch id="empty" label="Remove empty lines" checked={removeEmpty} onChange={setRemoveEmpty} />
          <OptionSwitch id="removed" label="Show only the duplicates" checked={showRemoved} onChange={setShowRemoved} />
        </>
      }
    />
  )
}
