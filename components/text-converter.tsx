"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Download } from "lucide-react"

type ConversionFormat =
  | "json"
  | "array"
  | "print_r"
  | "var_dump"
  | "php_array"
  | "php_object"
  | "csv"
  | "xml"
  | "yaml"
  | "sql"

export function TextConverter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  const convertTo = (format: ConversionFormat) => {
    setError("")
    try {
      let data: any

      // Try to parse input as JSON first
      try {
        data = JSON.parse(input)
      } catch {
        // If not JSON, treat as plain text lines
        data = input.split("\n").filter((line) => line.trim())
      }

      let result = ""

      switch (format) {
        case "json":
          result = JSON.stringify(data, null, 2)
          break

        case "array":
          if (Array.isArray(data)) {
            result = `[\n${data.map((item) => `  ${JSON.stringify(item)}`).join(",\n")}\n]`
          } else if (typeof data === "object") {
            result = `[\n${Object.entries(data)
              .map(([key, value]) => `  "${key}": ${JSON.stringify(value)}`)
              .join(",\n")}\n]`
          } else {
            result = JSON.stringify([data], null, 2)
          }
          break

        case "print_r":
          result = generatePrintR(data)
          break

        case "var_dump":
          result = generateVarDump(data)
          break

        case "php_array":
          result = generatePHPArray(data)
          break

        case "php_object":
          result = generatePHPObject(data)
          break

        case "csv":
          result = generateCSV(data)
          break

        case "xml":
          result = generateXML(data)
          break

        case "yaml":
          result = generateYAML(data)
          break

        case "sql":
          result = generateSQL(data)
          break

        default:
          result = JSON.stringify(data, null, 2)
      }

      setOutput(result)
    } catch (err) {
      setError(`Conversion error: ${err instanceof Error ? err.message : "Unknown error"}`)
      setOutput("")
    }
  }

  const generatePrintR = (data: any, indent = 0): string => {
    const spaces = "    ".repeat(indent)
    if (Array.isArray(data)) {
      let result = "Array\n" + spaces + "(\n"
      data.forEach((item, index) => {
        result += spaces + `    [${index}] => `
        if (typeof item === "object") {
          result += generatePrintR(item, indent + 1)
        } else {
          result += `${item}\n`
        }
      })
      result += spaces + ")\n"
      return result
    } else if (typeof data === "object" && data !== null) {
      let result = "Array\n" + spaces + "(\n"
      Object.entries(data).forEach(([key, value]) => {
        result += spaces + `    [${key}] => `
        if (typeof value === "object") {
          result += generatePrintR(value, indent + 1)
        } else {
          result += `${value}\n`
        }
      })
      result += spaces + ")\n"
      return result
    }
    return String(data)
  }

  const generateVarDump = (data: any, indent = 0): string => {
    const spaces = "  ".repeat(indent)
    if (Array.isArray(data)) {
      let result = `array(${data.length}) {\n`
      data.forEach((item, index) => {
        result += spaces + `  [${index}]=>\n`
        result += spaces + "  " + generateVarDump(item, indent + 1)
      })
      result += spaces + "}\n"
      return result
    } else if (typeof data === "object" && data !== null) {
      const entries = Object.entries(data)
      let result = `array(${entries.length}) {\n`
      entries.forEach(([key, value]) => {
        result += spaces + `  ["${key}"]=>\n`
        result += spaces + "  " + generateVarDump(value, indent + 1)
      })
      result += spaces + "}\n"
      return result
    } else if (typeof data === "string") {
      return `string(${data.length}) "${data}"\n`
    } else if (typeof data === "number") {
      return Number.isInteger(data) ? `int(${data})\n` : `float(${data})\n`
    } else if (typeof data === "boolean") {
      return `bool(${data})\n`
    }
    return `${data}\n`
  }

  const generatePHPArray = (data: any): string => {
    if (Array.isArray(data)) {
      const items = data.map((item) => {
        if (typeof item === "object") {
          return generatePHPArray(item)
        }
        return typeof item === "string" ? `'${item}'` : item
      })
      return `array(${items.join(", ")})`
    } else if (typeof data === "object" && data !== null) {
      const items = Object.entries(data).map(([key, value]) => {
        const val =
          typeof value === "object" ? generatePHPArray(value) : typeof value === "string" ? `'${value}'` : value
        return `'${key}' => ${val}`
      })
      return `array(${items.join(", ")})`
    }
    return typeof data === "string" ? `'${data}'` : String(data)
  }

  const generatePHPObject = (data: any): string => {
    if (typeof data === "object" && data !== null) {
      const props = Object.entries(data)
        .map(([key, value]) => {
          const val =
            typeof value === "object" ? generatePHPObject(value) : typeof value === "string" ? `'${value}'` : value
          return `    public $${key} = ${val};`
        })
        .join("\n")
      return `class DataObject {\n${props}\n}`
    }
    return String(data)
  }

  const generateCSV = (data: any): string => {
    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === "object") {
        const headers = Object.keys(data[0])
        const rows = data.map((item) => headers.map((h) => `"${item[h] || ""}"`).join(","))
        return [headers.join(","), ...rows].join("\n")
      }
      return data.join("\n")
    }
    return String(data)
  }

  const generateXML = (data: any, rootName = "root"): string => {
    const buildXML = (obj: any, name: string): string => {
      if (Array.isArray(obj)) {
        return obj.map((item, i) => buildXML(item, `item`)).join("\n")
      } else if (typeof obj === "object" && obj !== null) {
        const children = Object.entries(obj)
          .map(([key, value]) => buildXML(value, key))
          .join("\n")
        return `<${name}>\n${children}\n</${name}>`
      }
      return `<${name}>${obj}</${name}>`
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXML(data, rootName)}`
  }

  const generateYAML = (data: any, indent = 0): string => {
    const spaces = "  ".repeat(indent)
    if (Array.isArray(data)) {
      return data
        .map((item) => spaces + "- " + (typeof item === "object" ? "\n" + generateYAML(item, indent + 1) : item))
        .join("\n")
    } else if (typeof data === "object" && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => {
          if (typeof value === "object") {
            return spaces + key + ":\n" + generateYAML(value, indent + 1)
          }
          return spaces + key + ": " + (typeof value === "string" ? `"${value}"` : value)
        })
        .join("\n")
    }
    return String(data)
  }

  const generateSQL = (data: any): string => {
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      const tableName = "data_table"
      const columns = Object.keys(data[0])
      const values = data
        .map((row) => {
          const vals = columns.map((col) => {
            const val = row[col]
            return typeof val === "string" ? `'${val}'` : val
          })
          return `(${vals.join(", ")})`
        })
        .join(",\n  ")
      return `INSERT INTO ${tableName} (${columns.join(", ")})\nVALUES\n  ${values};`
    }
    return "-- Unable to generate SQL from this data format"
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "converted.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Label htmlFor="input" className="mb-2 block">
          Input Text
        </Label>
        <Textarea
          id="input"
          placeholder='Enter your text or JSON data here...\nExample: {"name": "John", "age": 30}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] mb-4 font-mono"
        />

        <div className="mb-4">
          <Label className="mb-2 block">Convert To:</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button onClick={() => convertTo("json")} variant="outline">
              JSON
            </Button>
            <Button onClick={() => convertTo("array")} variant="outline">
              Array
            </Button>
            <Button onClick={() => convertTo("print_r")} variant="outline">
              print_r
            </Button>
            <Button onClick={() => convertTo("var_dump")} variant="outline">
              var_dump
            </Button>
            <Button onClick={() => convertTo("php_array")} variant="outline">
              PHP Array
            </Button>
            <Button onClick={() => convertTo("php_object")} variant="outline">
              PHP Object
            </Button>
            <Button onClick={() => convertTo("csv")} variant="outline">
              CSV
            </Button>
            <Button onClick={() => convertTo("xml")} variant="outline">
              XML
            </Button>
            <Button onClick={() => convertTo("yaml")} variant="outline">
              YAML
            </Button>
            <Button onClick={() => convertTo("sql")} variant="outline">
              SQL Insert
            </Button>
          </div>
        </div>

        {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4 text-sm">{error}</div>}

        {output && (
          <>
            <Label htmlFor="output" className="mb-2 block">
              Output
            </Label>
            <Textarea id="output" value={output} readOnly className="min-h-[300px] mb-4 font-mono" />
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={downloadFile} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-3">Additional Text Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const lines = input.split("\n")
              setOutput(lines.reverse().join("\n"))
            }}
          >
            Reverse Lines
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const lines = input.split("\n")
              setOutput([...new Set(lines)].join("\n"))
            }}
          >
            Remove Duplicates
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const lines = input.split("\n").sort()
              setOutput(lines.join("\n"))
            }}
          >
            Sort Lines
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const lines = input.split("\n").filter((line) => line.trim())
              setOutput(lines.join("\n"))
            }}
          >
            Remove Empty Lines
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const lines = input.split("\n").map((line) => line.trim())
              setOutput(lines.join("\n"))
            }}
          >
            Trim Lines
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const lines = input.split("\n").map((line, i) => `${i + 1}. ${line}`)
              setOutput(lines.join("\n"))
            }}
          >
            Number Lines
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOutput(input.toUpperCase())
            }}
          >
            UPPERCASE
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOutput(input.toLowerCase())
            }}
          >
            lowercase
          </Button>
        </div>
      </Card>
    </div>
  )
}
