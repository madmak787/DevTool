"use client"

import * as React from "react"
import { Segmented } from "@/components/tool-kit"
import { LineTool } from "@/components/line-tool"
import { graphemes, splitLines } from "@/lib/text"

type Mode = "chars" | "words" | "lines" | "each-line" | "flip"

// Upside-down look-alikes for "flip" mode
const FLIP: Record<string, string> = Object.fromEntries(
  [..."abcdefghijklmnopqrstuvwxyz0123456789.,!?'\"()[]{}<>&_;"].map((c, i) => [
    c,
    [..."ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz0ƖᄅƐㄣϛ9ㄥ86˙'¡¿,„)(][}{><⅋‾؛"][i],
  ]),
)

export default function TextReverser() {
  const [input, setInput] = React.useState("")
  const [mode, setMode] = React.useState<Mode>("chars")

  const output = React.useMemo(() => {
    if (!input) return ""
    switch (mode) {
      case "chars":
        return graphemes(input).reverse().join("")
      case "words":
        return splitLines(input)
          .map((l) => l.split(/(\s+)/).reverse().join(""))
          .join("\n")
      case "lines":
        return splitLines(input).reverse().join("\n")
      case "each-line":
        return splitLines(input)
          .map((l) => graphemes(l).reverse().join(""))
          .join("\n")
      case "flip":
        return graphemes(input.toLowerCase())
          .reverse()
          .map((c) => FLIP[c] ?? c)
          .join("")
    }
  }, [input, mode])

  return (
    <LineTool
      input={input}
      setInput={setInput}
      output={output}
      placeholder="Type or paste text"
      filename="reversed.txt"
      options={
        <Segmented
          ariaLabel="Reverse by"
          value={mode}
          onChange={setMode}
          options={[
            { value: "chars", label: "Characters" },
            { value: "words", label: "Words" },
            { value: "lines", label: "Line order" },
            { value: "each-line", label: "Each line" },
            { value: "flip", label: "Upside down" },
          ]}
        />
      }
    />
  )
}
