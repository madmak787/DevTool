"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeArea, CopyButton, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"
import { randomInt } from "@/lib/text"

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nunc pulvinar sapien ligula vitae gravida nibh vel purus faucibus ornare suspendisse sed nisi lacus viverra maecenas accumsan lacus vel facilisis volutpat blandit cursus risus ultrices tristique nulla aliquet porttitor lacus luctus mauris ultricies leo integer malesuada semper feugiat pellentesque habitant morbi senectus netus fames turpis egestas".split(
    " ",
  )
const OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit"

type Unit = "paragraphs" | "sentences" | "words" | "list"

const pick = () => WORDS[randomInt(WORDS.length)]
const between = (min: number, max: number) => min + randomInt(max - min + 1)

function sentence() {
  const n = between(6, 16)
  const words = Array.from({ length: n }, pick)
  // Occasional comma for a more natural rhythm
  if (n > 8) words[between(3, n - 4)] += ","
  const s = words.join(" ")
  return s.charAt(0).toUpperCase() + s.slice(1) + "."
}

function paragraph() {
  return Array.from({ length: between(4, 7) }, sentence).join(" ")
}

function generate(unit: Unit, count: number, classic: boolean): string[] {
  let items: string[]
  if (unit === "words") {
    const words = Array.from({ length: count }, pick)
    if (classic) OPENING.toLowerCase().replace(",", "").split(" ").slice(0, count).forEach((w, i) => (words[i] = w))
    const s = words.join(" ")
    return [s.charAt(0).toUpperCase() + s.slice(1)]
  }
  if (unit === "sentences") items = Array.from({ length: count }, sentence)
  else if (unit === "list") items = Array.from({ length: count }, () => sentence().replace(/\.$/, ""))
  else items = Array.from({ length: count }, paragraph)
  if (classic && items.length) {
    items[0] = unit === "paragraphs" ? `${OPENING}. ${items[0]}` : unit === "list" ? OPENING : `${OPENING}.`
  }
  return unit === "sentences" ? [items.join(" ")] : items
}

export default function LoremIpsum() {
  const [unit, setUnit] = React.useState<Unit>("paragraphs")
  const [count, setCount] = React.useState("3")
  const [classic, setClassic] = React.useState(true)
  const [html, setHtml] = React.useState(false)
  const [items, setItems] = React.useState<string[]>([])

  const n = Math.min(Math.max(Number.parseInt(count) || 1, 1), unit === "words" ? 5000 : 200)
  const regenerate = React.useCallback(() => setItems(generate(unit, n, classic)), [unit, n, classic])
  React.useEffect(regenerate, [regenerate])

  const output = html
    ? unit === "list"
      ? `<ul>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>`
      : items.map((i) => `<p>${i}</p>`).join("\n\n")
    : unit === "list"
      ? items.map((i) => `- ${i}`).join("\n")
      : items.join("\n\n")

  const wordCount = output ? output.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length : 0

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <div className="grid gap-1.5">
            <label htmlFor="count" className="text-xs font-medium text-muted-foreground">
              How many
            </label>
            <Input
              id="count"
              type="number"
              inputMode="numeric"
              min={1}
              max={unit === "words" ? 5000 : 200}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              onBlur={() => setCount(String(n))}
              className="w-24"
            />
          </div>
          <Segmented
            ariaLabel="Unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: "paragraphs", label: "Paragraphs" },
              { value: "sentences", label: "Sentences" },
              { value: "words", label: "Words" },
              { value: "list", label: "List items" },
            ]}
          />
          <OptionSwitch id="classic" label="Start with “Lorem ipsum…”" checked={classic} onChange={setClassic} />
          <OptionSwitch id="html" label="HTML tags" checked={html} onChange={setHtml} />
          <Button onClick={regenerate} className="ml-auto">
            <RefreshCw /> Generate
          </Button>
        </div>
      </Panel>
      <Panel title="Placeholder text" actions={<CopyButton value={output} />} footer={<span>{wordCount} words · {output.length} characters</span>}>
        <CodeArea readOnly mono={html} value={output} className="h-[50vh] min-h-72 resize-y text-[15px] leading-7" aria-label="Generated text" />
      </Panel>
    </div>
  )
}
