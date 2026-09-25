"use client"

import * as React from "react"
import { Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptionSwitch, Segmented } from "@/components/tool-kit"
import { LineTool } from "@/components/line-tool"
import { naturalCollator, shuffle, splitLines } from "@/lib/text"

type Order = "az" | "za" | "natural" | "length" | "reverse" | "random"

const caseCollator = new Intl.Collator(undefined, { sensitivity: "variant", caseFirst: "upper" })
const plainCollator = new Intl.Collator(undefined, { sensitivity: "base" })

export default function TextSorter() {
  const [input, setInput] = React.useState("")
  const [order, setOrder] = React.useState<Order>("az")
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [removeEmpty, setRemoveEmpty] = React.useState(true)
  const [trim, setTrim] = React.useState(true)
  const [seed, setSeed] = React.useState(0)

  const output = React.useMemo(() => {
    if (!input) return ""
    let lines = splitLines(input)
    if (trim) lines = lines.map((l) => l.trim())
    if (removeEmpty) lines = lines.filter((l) => l.trim() !== "")
    const collator = caseSensitive ? caseCollator : plainCollator
    switch (order) {
      case "az":
        return [...lines].sort(collator.compare).join("\n")
      case "za":
        return [...lines].sort((a, b) => collator.compare(b, a)).join("\n")
      case "natural":
        return [...lines].sort(naturalCollator.compare).join("\n")
      case "length":
        return [...lines].sort((a, b) => a.length - b.length || collator.compare(a, b)).join("\n")
      case "reverse":
        return [...lines].reverse().join("\n")
      case "random":
        return shuffle(lines).join("\n")
    }
    // seed only forces a new shuffle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, order, caseSensitive, removeEmpty, trim, seed])

  const count = output ? output.split("\n").length : 0

  return (
    <LineTool
      input={input}
      setInput={setInput}
      output={output}
      filename="sorted.txt"
      outputFooter={<span>{count} lines</span>}
      options={
        <>
          <Segmented
            ariaLabel="Sort order"
            value={order}
            onChange={setOrder}
            options={[
              { value: "az", label: "A → Z" },
              { value: "za", label: "Z → A" },
              { value: "natural", label: "Natural", title: "Numbers in order: item2 before item10" },
              { value: "length", label: "Length" },
              { value: "reverse", label: "Reverse" },
              { value: "random", label: "Shuffle" },
            ]}
          />
          {order === "random" && (
            <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>
              <Shuffle /> Shuffle again
            </Button>
          )}
          <OptionSwitch id="case" label="Uppercase first" checked={caseSensitive} onChange={setCaseSensitive} />
          <OptionSwitch id="trim" label="Trim spaces" checked={trim} onChange={setTrim} />
          <OptionSwitch id="empty" label="Remove empty lines" checked={removeEmpty} onChange={setRemoveEmpty} />
        </>
      }
    />
  )
}
