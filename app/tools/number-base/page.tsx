"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NumberBasePage() {
  const [inputValue, setInputValue] = useState("")
  const [fromBase, setFromBase] = useState("10")
  const [results, setResults] = useState({
    binary: "",
    octal: "",
    decimal: "",
    hexadecimal: "",
  })

  const handleConvert = (value: string, base: string) => {
    if (!value) {
      setResults({ binary: "", octal: "", decimal: "", hexadecimal: "" })
      return
    }

    try {
      const decimal = Number.parseInt(value, Number(base))
      if (isNaN(decimal)) {
        setResults({ binary: "Invalid input", octal: "", decimal: "", hexadecimal: "" })
        return
      }

      setResults({
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hexadecimal: decimal.toString(16).toUpperCase(),
      })
    } catch (error) {
      setResults({ binary: "Invalid input", octal: "", decimal: "", hexadecimal: "" })
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    handleConvert(value, fromBase)
  }

  const handleBaseChange = (base: string) => {
    setFromBase(base)
    handleConvert(inputValue, base)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Number Base Converter</h1>
        <p className="text-muted-foreground">Convert numbers between different bases</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input">Input Number</Label>
            <Input
              id="input"
              placeholder="Enter number..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base">Input Base</Label>
            <Select value={fromBase} onValueChange={handleBaseChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Binary (Base 2)</SelectItem>
                <SelectItem value="8">Octal (Base 8)</SelectItem>
                <SelectItem value="10">Decimal (Base 10)</SelectItem>
                <SelectItem value="16">Hexadecimal (Base 16)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Results</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Binary (Base 2)</Label>
                <Input value={results.binary} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Octal (Base 8)</Label>
                <Input value={results.octal} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Decimal (Base 10)</Label>
                <Input value={results.decimal} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Hexadecimal (Base 16)</Label>
                <Input value={results.hexadecimal} readOnly />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
