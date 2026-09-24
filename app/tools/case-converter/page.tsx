"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy } from "lucide-react"

export default function CaseConverterPage() {
  const [input, setInput] = useState("")

  const convert = (type: string) => {
    switch (type) {
      case "upper":
        return input.toUpperCase()
      case "lower":
        return input.toLowerCase()
      case "title":
        return input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
      case "sentence":
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
      case "camel":
        return input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      case "snake":
        return input
          .replace(/\W+/g, " ")
          .split(/ |\B(?=[A-Z])/)
          .map((word) => word.toLowerCase())
          .join("_")
      case "kebab":
        return input
          .replace(/\W+/g, " ")
          .split(/ |\B(?=[A-Z])/)
          .map((word) => word.toLowerCase())
          .join("-")
      default:
        return input
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Case Converter</h1>
        <p className="text-muted-foreground">Convert text to different cases</p>
      </div>

      <Card className="p-6 mb-6">
        <Textarea
          placeholder="Enter your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={() => setInput(convert("upper"))}>UPPERCASE</Button>
          <Button onClick={() => setInput(convert("lower"))}>lowercase</Button>
          <Button onClick={() => setInput(convert("title"))}>Title Case</Button>
          <Button onClick={() => setInput(convert("sentence"))}>Sentence case</Button>
          <Button onClick={() => setInput(convert("camel"))}>camelCase</Button>
          <Button onClick={() => setInput(convert("snake"))}>snake_case</Button>
          <Button onClick={() => setInput(convert("kebab"))}>kebab-case</Button>
          <Button variant="outline" onClick={() => copyToClipboard(input)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Characters:</span>{" "}
            <span className="font-semibold">{input.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Words:</span>{" "}
            <span className="font-semibold">{input.trim() ? input.trim().split(/\s+/).length : 0}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
