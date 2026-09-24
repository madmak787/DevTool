"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function TextReverserPage() {
  const [input, setInput] = useState("")

  const reverseText = () => {
    setInput(input.split("").reverse().join(""))
  }

  const reverseWords = () => {
    setInput(input.split(" ").reverse().join(" "))
  }

  const reverseLines = () => {
    setInput(input.split("\n").reverse().join("\n"))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Text Reverser</h1>
        <p className="text-muted-foreground">Reverse text, words, or lines</p>
      </div>

      <Card className="p-6">
        <Textarea
          placeholder="Enter your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[300px] mb-4"
        />
        <div className="flex gap-2">
          <Button onClick={reverseText}>Reverse Text</Button>
          <Button onClick={reverseWords}>Reverse Words</Button>
          <Button onClick={reverseLines}>Reverse Lines</Button>
        </div>
      </Card>
    </div>
  )
}
