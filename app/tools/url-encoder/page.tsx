"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"

export default function URLEncoderPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
    } catch (error) {
      setOutput("Error: Invalid input")
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
    } catch (error) {
      setOutput("Error: Invalid URL encoded string")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">URL Encoder/Decoder</h1>
        <p className="text-muted-foreground">Encode or decode URL strings</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex gap-2">
            <Button variant={mode === "encode" ? "default" : "outline"} onClick={() => setMode("encode")}>
              Encode
            </Button>
            <Button variant={mode === "decode" ? "default" : "outline"} onClick={() => setMode("decode")}>
              Decode
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Input</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter URL to encode..." : "Enter encoded URL to decode..."}
              className="min-h-[200px] font-mono"
            />
          </div>

          <Button onClick={mode === "encode" ? handleEncode : handleDecode} className="w-full">
            {mode === "encode" ? "Encode URL" : "Decode URL"}
          </Button>

          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Output</Label>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea value={output} readOnly className="min-h-[200px] font-mono" />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
