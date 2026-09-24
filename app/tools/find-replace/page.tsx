"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function FindReplacePage() {
  const [text, setText] = useState("")
  const [find, setFind] = useState("")
  const [replace, setReplace] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)

  const handleReplace = () => {
    if (!find) return

    try {
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi"
        const regex = new RegExp(find, flags)
        setText(text.replace(regex, replace))
      } else {
        const flags = caseSensitive ? "g" : "gi"
        const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags)
        setText(text.replace(regex, replace))
      }
    } catch (error) {
      console.error("[v0] Regex error:", error)
    }
  }

  const countMatches = () => {
    if (!find) return 0
    try {
      const flags = caseSensitive ? "g" : "gi"
      const regex = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags)
      return (text.match(regex) || []).length
    } catch {
      return 0
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find & Replace</h1>
        <p className="text-muted-foreground">Find and replace text with support for regex</p>
      </div>

      <Card className="p-6 mb-4">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="find">Find</Label>
            <Input id="find" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Text to find..." />
          </div>
          <div>
            <Label htmlFor="replace">Replace with</Label>
            <Input
              id="replace"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="case"
              checked={caseSensitive}
              onCheckedChange={(checked) => setCaseSensitive(checked === true)}
            />
            <Label htmlFor="case" className="cursor-pointer">
              Case sensitive
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="regex" checked={useRegex} onCheckedChange={(checked) => setUseRegex(checked === true)} />
            <Label htmlFor="regex" className="cursor-pointer">
              Use regex
            </Label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Matches found: {countMatches()}</div>
          <Button onClick={handleReplace}>Replace All</Button>
        </div>
      </Card>

      <Card className="p-6">
        <Textarea
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px]"
        />
      </Card>
    </div>
  )
}
