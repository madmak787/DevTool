"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PercentagePage() {
  const [value1, setValue1] = useState("")
  const [value2, setValue2] = useState("")
  const [result, setResult] = useState("")

  const calculatePercentage = (val1: string, val2: string) => {
    const num1 = Number(val1)
    const num2 = Number(val2)
    if (isNaN(num1) || isNaN(num2)) return ""
    return ((num1 / num2) * 100).toFixed(2)
  }

  const calculatePercentOf = (percent: string, total: string) => {
    const p = Number(percent)
    const t = Number(total)
    if (isNaN(p) || isNaN(t)) return ""
    return ((p / 100) * t).toFixed(2)
  }

  const calculatePercentChange = (oldVal: string, newVal: string) => {
    const old = Number(oldVal)
    const newV = Number(newVal)
    if (isNaN(old) || isNaN(newV) || old === 0) return ""
    return (((newV - old) / old) * 100).toFixed(2)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Percentage Calculator</h1>
        <p className="text-muted-foreground">Calculate percentages, increases, and decreases</p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="of">Percent Of</TabsTrigger>
            <TabsTrigger value="change">Change</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">What percent of X is Y?</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  placeholder="Enter value..."
                  value={value1}
                  onChange={(e) => {
                    setValue1(e.target.value)
                    setResult(calculatePercentage(e.target.value, value2))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input
                  type="number"
                  placeholder="Enter total..."
                  value={value2}
                  onChange={(e) => {
                    setValue2(e.target.value)
                    setResult(calculatePercentage(value1, e.target.value))
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Result</Label>
              <div className="text-3xl font-bold text-primary">{result ? `${result}%` : "-"}</div>
            </div>
          </TabsContent>

          <TabsContent value="of" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">What is X% of Y?</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Percentage</Label>
                <Input
                  type="number"
                  placeholder="Enter percentage..."
                  value={value1}
                  onChange={(e) => {
                    setValue1(e.target.value)
                    setResult(calculatePercentOf(e.target.value, value2))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input
                  type="number"
                  placeholder="Enter total..."
                  value={value2}
                  onChange={(e) => {
                    setValue2(e.target.value)
                    setResult(calculatePercentOf(value1, e.target.value))
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Result</Label>
              <div className="text-3xl font-bold text-primary">{result || "-"}</div>
            </div>
          </TabsContent>

          <TabsContent value="change" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">Percentage change from X to Y</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Old Value</Label>
                <Input
                  type="number"
                  placeholder="Enter old value..."
                  value={value1}
                  onChange={(e) => {
                    setValue1(e.target.value)
                    setResult(calculatePercentChange(e.target.value, value2))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>New Value</Label>
                <Input
                  type="number"
                  placeholder="Enter new value..."
                  value={value2}
                  onChange={(e) => {
                    setValue2(e.target.value)
                    setResult(calculatePercentChange(value1, e.target.value))
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Result</Label>
              <div className="text-3xl font-bold text-primary">
                {result ? `${Number(result) >= 0 ? "+" : ""}${result}%` : "-"}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
