"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUpAZ, ArrowDownAZ, Shuffle } from "lucide-react"

export default function TextSorterPage() {
  const [input, setInput] = useState("")

  const sortLines = (order: "asc" | "desc" | "random") => {
    const lines = input.split("\n")
    if (order === "random") {
      const shuffled = [...lines].sort(() => Math.random() - 0.5)
      setInput(shuffled.join("\n"))
    } else {
      const sorted = [...lines].sort((a, b) => {
        return order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
      })
      setInput(sorted.join("\n"))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Text Sorter</h1>
        <p className="text-muted-foreground">Sort lines of text alphabetically</p>
      </div>

      <Card className="p-6">
        <Textarea
          placeholder="Enter text (one item per line)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[300px] mb-4"
        />
        <div className="flex gap-2">
          <Button onClick={() => sortLines("asc")}>
            <ArrowUpAZ className="h-4 w-4 mr-2" />
            Sort A-Z
          </Button>
          <Button onClick={() => sortLines("desc")}>
            <ArrowDownAZ className="h-4 w-4 mr-2" />
            Sort Z-A
          </Button>
          <Button variant="outline" onClick={() => sortLines("random")}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
        </div>
      </Card>
    </div>
  )
}
