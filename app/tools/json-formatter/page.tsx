"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function JSONFormatterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [indentation, setIndentation] = useState("2")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const formatJSON = () => {
    setError("")
    setSuccess("")
    try {
      const parsed = JSON.parse(input)
      const spaces = Number.parseInt(indentation)
      const formatted = JSON.stringify(parsed, null, spaces)
      setOutput(formatted)
      setSuccess("JSON formatted successfully!")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
      setOutput("")
    }
  }

  const minifyJSON = () => {
    setError("")
    setSuccess("")
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setSuccess("JSON minified successfully!")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
      setOutput("")
    }
  }

  const validateJSON = () => {
    setError("")
    setSuccess("")
    try {
      JSON.parse(input)
      setSuccess("Valid JSON!")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setSuccess("Copied to clipboard!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const downloadJSON = () => {
    const blob = new Blob([output], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "formatted.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSuccess("Downloaded!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
    setSuccess("")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">JSON Formatter</h1>
        <p className="text-muted-foreground">Format, validate, and minify JSON data</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <Label htmlFor="input" className="text-lg font-semibold mb-3 block">
            Input JSON
          </Label>
          <Textarea
            id="input"
            placeholder='{"name": "John", "age": 30}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
        </Card>

        <Card className="p-6">
          <Label htmlFor="output" className="text-lg font-semibold mb-3 block">
            Output
          </Label>
          <Textarea
            id="output"
            placeholder="Formatted JSON will appear here..."
            value={output}
            readOnly
            className="min-h-[400px] font-mono text-sm bg-muted"
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1">
            <Label htmlFor="indentation" className="mb-2 block">
              Indentation
            </Label>
            <Select value={indentation} onValueChange={setIndentation}>
              <SelectTrigger id="indentation" className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
                <SelectItem value="8">8 spaces</SelectItem>
                <SelectItem value="tab">Tab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button onClick={formatJSON} className="flex-1 md:flex-none">
              Format
            </Button>
            <Button onClick={minifyJSON} variant="secondary" className="flex-1 md:flex-none">
              Minify
            </Button>
            <Button onClick={validateJSON} variant="outline" className="flex-1 md:flex-none bg-transparent">
              Validate
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              disabled={!output}
              className="flex-1 md:flex-none bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={downloadJSON}
              variant="outline"
              disabled={!output}
              className="flex-1 md:flex-none bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={clearAll} variant="ghost" className="flex-1 md:flex-none">
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">About JSON Formatter</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Format:</strong> Beautify your JSON with proper indentation and line breaks for better readability.
          </p>
          <p>
            <strong>Minify:</strong> Remove all whitespace to reduce file size for production use.
          </p>
          <p>
            <strong>Validate:</strong> Check if your JSON syntax is correct and identify any errors.
          </p>
        </div>
      </Card>
    </div>
  )
}
