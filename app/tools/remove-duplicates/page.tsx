"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function RemoveDuplicatesPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const removeDuplicates = () => {
    const lines = input.split("\n")
    const unique = [...new Set(lines)]
    setOutput(unique.join("\n"))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Remove Duplicates</h1>
        <p className="text-muted-foreground">Remove duplicate lines from text</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Input</h3>
          <Textarea
            placeholder="Enter text (one item per line)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[300px] mb-4"
          />
          <Button onClick={removeDuplicates} className="w-full">
            Remove Duplicates
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Output</h3>
          <Textarea value={output} readOnly className="min-h-[300px] mb-4" />
          <div className="text-sm text-muted-foreground">
            Removed {input.split("\n").length - output.split("\n").length} duplicate lines
          </div>
        </Card>
      </div>
    </div>
  )
}
