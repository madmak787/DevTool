"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy } from "lucide-react"

const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
]

export default function LoremIpsumPage() {
  const [count, setCount] = useState(5)
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs")
  const [output, setOutput] = useState("")

  const generateLorem = () => {
    let result = ""

    if (type === "words") {
      const words = []
      for (let i = 0; i < count; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
      }
      result = words.join(" ")
    } else if (type === "sentences") {
      for (let i = 0; i < count; i++) {
        const sentenceLength = Math.floor(Math.random() * 10) + 5
        const words = []
        for (let j = 0; j < sentenceLength; j++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
        }
        result += words.join(" ").charAt(0).toUpperCase() + words.join(" ").slice(1) + ". "
      }
    } else {
      for (let i = 0; i < count; i++) {
        const paragraphLength = Math.floor(Math.random() * 5) + 3
        const sentences = []
        for (let j = 0; j < paragraphLength; j++) {
          const sentenceLength = Math.floor(Math.random() * 10) + 5
          const words = []
          for (let k = 0; k < sentenceLength; k++) {
            words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
          }
          sentences.push(words.join(" ").charAt(0).toUpperCase() + words.join(" ").slice(1) + ".")
        }
        result += sentences.join(" ") + "\n\n"
      }
    }

    setOutput(result.trim())
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lorem Ipsum Generator</h1>
        <p className="text-muted-foreground">Generate placeholder text</p>
      </div>

      <Card className="p-6 mb-4">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="count">Count</Label>
            <Input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={100}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Type</Label>
            <div className="flex gap-2 mt-2">
              <Button variant={type === "paragraphs" ? "default" : "outline"} onClick={() => setType("paragraphs")}>
                Paragraphs
              </Button>
              <Button variant={type === "sentences" ? "default" : "outline"} onClick={() => setType("sentences")}>
                Sentences
              </Button>
              <Button variant={type === "words" ? "default" : "outline"} onClick={() => setType("words")}>
                Words
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={generateLorem} className="w-full">
          Generate
        </Button>
      </Card>

      {output && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Generated Text</h3>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(output)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea value={output} readOnly className="min-h-[300px]" />
        </Card>
      )}
    </div>
  )
}
