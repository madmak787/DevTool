"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DateCalculatorPage() {
  const [date1, setDate1] = useState("")
  const [date2, setDate2] = useState("")
  const [addDate, setAddDate] = useState("")
  const [addDays, setAddDays] = useState("")

  const calculateDifference = () => {
    if (!date1 || !date2) return null
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diff = Math.abs(d2.getTime() - d1.getTime())
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30.44)
    const years = Math.floor(days / 365.25)
    return { days, weeks, months, years }
  }

  const calculateAddDays = () => {
    if (!addDate || !addDays) return ""
    const date = new Date(addDate)
    date.setDate(date.getDate() + Number(addDays))
    return date.toISOString().split("T")[0]
  }

  const diff = calculateDifference()
  const resultDate = calculateAddDays()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Date Calculator</h1>
        <p className="text-muted-foreground">Calculate date differences and add/subtract days</p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="difference">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="difference">Date Difference</TabsTrigger>
            <TabsTrigger value="add">Add/Subtract Days</TabsTrigger>
          </TabsList>

          <TabsContent value="difference" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date1">Start Date</Label>
                <Input id="date1" type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date2">End Date</Label>
                <Input id="date2" type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
              </div>
            </div>

            {diff && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{diff.days}</div>
                  <div className="text-sm text-muted-foreground mt-1">Days</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{diff.weeks}</div>
                  <div className="text-sm text-muted-foreground mt-1">Weeks</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{diff.months}</div>
                  <div className="text-sm text-muted-foreground mt-1">Months</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{diff.years}</div>
                  <div className="text-sm text-muted-foreground mt-1">Years</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="addDate">Start Date</Label>
                <Input id="addDate" type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addDays">Days to Add/Subtract</Label>
                <Input
                  id="addDays"
                  type="number"
                  placeholder="Enter days (negative to subtract)"
                  value={addDays}
                  onChange={(e) => setAddDays(e.target.value)}
                />
              </div>
            </div>

            {resultDate && (
              <div className="pt-4 border-t">
                <Label>Result Date</Label>
                <div className="text-3xl font-bold text-primary mt-2">{new Date(resultDate).toLocaleDateString()}</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
