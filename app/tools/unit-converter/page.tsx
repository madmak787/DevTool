"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const conversions = {
  length: {
    meter: 1,
    kilometer: 0.001,
    centimeter: 100,
    millimeter: 1000,
    mile: 0.000621371,
    yard: 1.09361,
    foot: 3.28084,
    inch: 39.3701,
  },
  weight: {
    kilogram: 1,
    gram: 1000,
    milligram: 1000000,
    pound: 2.20462,
    ounce: 35.274,
    ton: 0.001,
  },
  temperature: {
    celsius: (v: number) => v,
    fahrenheit: (v: number) => (v * 9) / 5 + 32,
    kelvin: (v: number) => v + 273.15,
  },
  volume: {
    liter: 1,
    milliliter: 1000,
    gallon: 0.264172,
    quart: 1.05669,
    pint: 2.11338,
    cup: 4.22675,
    fluid_ounce: 33.814,
  },
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<keyof typeof conversions>("length")
  const [fromUnit, setFromUnit] = useState("meter")
  const [toUnit, setToUnit] = useState("kilometer")
  const [fromValue, setFromValue] = useState("")
  const [toValue, setToValue] = useState("")

  const handleConvert = (value: string, from: string, to: string) => {
    if (!value || isNaN(Number(value))) {
      setToValue("")
      return
    }

    const num = Number(value)
    const categoryData = conversions[category]

    if (category === "temperature") {
      const tempFuncs = categoryData as any
      let celsius = num
      if (from === "fahrenheit") celsius = ((num - 32) * 5) / 9
      if (from === "kelvin") celsius = num - 273.15
      const result = tempFuncs[to](celsius)
      setToValue(result.toFixed(2))
    } else {
      const rates = categoryData as Record<string, number>
      const baseValue = num / rates[from]
      const result = baseValue * rates[to]
      setToValue(result.toFixed(6))
    }
  }

  const handleFromChange = (value: string) => {
    setFromValue(value)
    handleConvert(value, fromUnit, toUnit)
  }

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit)
    handleConvert(fromValue, unit, toUnit)
  }

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit)
    handleConvert(fromValue, fromUnit, unit)
  }

  const units = Object.keys(conversions[category])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Unit Converter</h1>
        <p className="text-muted-foreground">Convert between different units of measurement</p>
      </div>

      <Card className="p-6">
        <Tabs value={category} onValueChange={(v) => setCategory(v as keyof typeof conversions)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="length">Length</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>

          <TabsContent value={category} className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>From</Label>
                <Input
                  type="number"
                  placeholder="Enter value"
                  value={fromValue}
                  onChange={(e) => handleFromChange(e.target.value)}
                />
                <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Input type="number" placeholder="Result" value={toValue} readOnly />
                <Select value={toUnit} onValueChange={handleToUnitChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
