"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Minimize2, Maximize2 } from "lucide-react"

export function MinifyTools() {
  const [jsInput, setJsInput] = useState("")
  const [jsOutput, setJsOutput] = useState("")
  const [cssInput, setCssInput] = useState("")
  const [cssOutput, setCssOutput] = useState("")
  const [htmlInput, setHtmlInput] = useState("")
  const [htmlOutput, setHtmlOutput] = useState("")
  const [jsonInput, setJsonInput] = useState("")
  const [jsonOutput, setJsonOutput] = useState("")

  // JavaScript Minifier
  const minifyJS = () => {
    try {
      const minified = jsInput
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*/g, "")
        // Remove whitespace
        .replace(/\s+/g, " ")
        .replace(/\s*([{}();:,=<>+\-*/%&|!])\s*/g, "$1")
        .replace(/;\s*}/g, "}")
        .trim()
      setJsOutput(minified)
    } catch (error) {
      setJsOutput("Error minifying JavaScript")
    }
  }

  const beautifyJS = () => {
    try {
      const beautified = jsInput
      let indent = 0
      let result = ""
      let inString = false
      let stringChar = ""

      for (let i = 0; i < beautified.length; i++) {
        const char = beautified[i]
        const nextChar = beautified[i + 1]

        // Handle strings
        if ((char === '"' || char === "'" || char === "`") && beautified[i - 1] !== "\\") {
          if (!inString) {
            inString = true
            stringChar = char
          } else if (char === stringChar) {
            inString = false
          }
          result += char
          continue
        }

        if (inString) {
          result += char
          continue
        }

        // Handle formatting
        if (char === "{" || char === "[") {
          result += char + "\n" + "  ".repeat(++indent)
        } else if (char === "}" || char === "]") {
          result += "\n" + "  ".repeat(--indent) + char
        } else if (char === ";") {
          result += char + "\n" + "  ".repeat(indent)
        } else if (char === ",") {
          result += char + " "
        } else {
          result += char
        }
      }

      setJsOutput(result.trim())
    } catch (error) {
      setJsOutput("Error beautifying JavaScript")
    }
  }

  // CSS Minifier
  const minifyCSS = () => {
    try {
      const minified = cssInput
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Remove whitespace
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,>+~])\s*/g, "$1")
        .replace(/;\s*}/g, "}")
        .trim()
      setCssOutput(minified)
    } catch (error) {
      setCssOutput("Error minifying CSS")
    }
  }

  const beautifyCSS = () => {
    try {
      const beautified = cssInput
        .replace(/\s+/g, " ")
        .replace(/\s*{\s*/g, " {\n  ")
        .replace(/\s*}\s*/g, "\n}\n\n")
        .replace(/\s*;\s*/g, ";\n  ")
        .replace(/\s*,\s*/g, ",\n")
        .trim()
      setCssOutput(beautified)
    } catch (error) {
      setCssOutput("Error beautifying CSS")
    }
  }

  // HTML Minifier
  const minifyHTML = () => {
    try {
      const minified = htmlInput
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, "")
        // Remove whitespace between tags
        .replace(/>\s+</g, "><")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        .trim()
      setHtmlOutput(minified)
    } catch (error) {
      setHtmlOutput("Error minifying HTML")
    }
  }

  const beautifyHTML = () => {
    try {
      const beautified = htmlInput
      let indent = 0
      let result = ""
      const tokens = beautified.split(/(<[^>]+>)/g).filter((token) => token.trim())

      tokens.forEach((token) => {
        if (token.startsWith("</")) {
          indent--
          result += "  ".repeat(Math.max(0, indent)) + token + "\n"
        } else if (token.startsWith("<") && !token.endsWith("/>") && !token.startsWith("<!")) {
          result += "  ".repeat(indent) + token + "\n"
          if (!token.match(/<(br|hr|img|input|meta|link)/i)) {
            indent++
          }
        } else if (token.startsWith("<")) {
          result += "  ".repeat(indent) + token + "\n"
        } else {
          result += "  ".repeat(indent) + token.trim() + "\n"
        }
      })

      setHtmlOutput(result.trim())
    } catch (error) {
      setHtmlOutput("Error beautifying HTML")
    }
  }

  // JSON Minifier
  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed))
    } catch (error) {
      setJsonOutput("Error: Invalid JSON")
    }
  }

  const beautifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed, null, 2))
    } catch (error) {
      setJsonOutput("Error: Invalid JSON")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Tabs defaultValue="javascript" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="html">HTML</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>

      <TabsContent value="javascript" className="space-y-4">
        <Card className="p-6">
          <Label htmlFor="js-input" className="mb-2 block">
            JavaScript Input
          </Label>
          <Textarea
            id="js-input"
            placeholder="Paste your JavaScript code here..."
            value={jsInput}
            onChange={(e) => setJsInput(e.target.value)}
            className="min-h-[250px] mb-4 font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={minifyJS}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minify
            </Button>
            <Button onClick={beautifyJS} variant="outline">
              <Maximize2 className="h-4 w-4 mr-2" />
              Beautify
            </Button>
          </div>
        </Card>

        {jsOutput && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-2">
              <Label>Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(jsOutput)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadFile(jsOutput, "script.js")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={jsOutput} readOnly className="min-h-[250px] font-mono text-sm" />
            <div className="mt-2 text-sm text-muted-foreground">
              Original: {jsInput.length} bytes → Processed: {jsOutput.length} bytes (
              {jsInput.length > 0 ? Math.round(((jsInput.length - jsOutput.length) / jsInput.length) * 100) : 0}%
              reduction)
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="css" className="space-y-4">
        <Card className="p-6">
          <Label htmlFor="css-input" className="mb-2 block">
            CSS Input
          </Label>
          <Textarea
            id="css-input"
            placeholder="Paste your CSS code here..."
            value={cssInput}
            onChange={(e) => setCssInput(e.target.value)}
            className="min-h-[250px] mb-4 font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={minifyCSS}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minify
            </Button>
            <Button onClick={beautifyCSS} variant="outline">
              <Maximize2 className="h-4 w-4 mr-2" />
              Beautify
            </Button>
          </div>
        </Card>

        {cssOutput && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-2">
              <Label>Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(cssOutput)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadFile(cssOutput, "styles.css")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={cssOutput} readOnly className="min-h-[250px] font-mono text-sm" />
            <div className="mt-2 text-sm text-muted-foreground">
              Original: {cssInput.length} bytes → Processed: {cssOutput.length} bytes (
              {cssInput.length > 0 ? Math.round(((cssInput.length - cssOutput.length) / cssInput.length) * 100) : 0}%
              reduction)
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="html" className="space-y-4">
        <Card className="p-6">
          <Label htmlFor="html-input" className="mb-2 block">
            HTML Input
          </Label>
          <Textarea
            id="html-input"
            placeholder="Paste your HTML code here..."
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            className="min-h-[250px] mb-4 font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={minifyHTML}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minify
            </Button>
            <Button onClick={beautifyHTML} variant="outline">
              <Maximize2 className="h-4 w-4 mr-2" />
              Beautify
            </Button>
          </div>
        </Card>

        {htmlOutput && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-2">
              <Label>Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(htmlOutput)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadFile(htmlOutput, "index.html")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={htmlOutput} readOnly className="min-h-[250px] font-mono text-sm" />
            <div className="mt-2 text-sm text-muted-foreground">
              Original: {htmlInput.length} bytes → Processed: {htmlOutput.length} bytes (
              {htmlInput.length > 0 ? Math.round(((htmlInput.length - htmlOutput.length) / htmlInput.length) * 100) : 0}
              % reduction)
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="json" className="space-y-4">
        <Card className="p-6">
          <Label htmlFor="json-input" className="mb-2 block">
            JSON Input
          </Label>
          <Textarea
            id="json-input"
            placeholder="Paste your JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="min-h-[250px] mb-4 font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={minifyJSON}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minify
            </Button>
            <Button onClick={beautifyJSON} variant="outline">
              <Maximize2 className="h-4 w-4 mr-2" />
              Beautify
            </Button>
          </div>
        </Card>

        {jsonOutput && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-2">
              <Label>Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(jsonOutput)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadFile(jsonOutput, "data.json")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={jsonOutput} readOnly className="min-h-[250px] font-mono text-sm" />
            <div className="mt-2 text-sm text-muted-foreground">
              Original: {jsonInput.length} bytes → Processed: {jsonOutput.length} bytes
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
