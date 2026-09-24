"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState("")

  const calculateAge = () => {
    if (!birthDate) return null

    const birth = new Date(birthDate)
    const today = new Date()

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = years * 12 + months
    const totalHours = totalDays * 24

    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1)
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      daysToNextBirthday,
    }
  }

  const age = calculateAge()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Age Calculator</h1>
        <p className="text-muted-foreground">Calculate your exact age and time lived</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate">Date of Birth</Label>
            <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>

          {age && (
            <div className="pt-6 border-t space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Age</h3>
                <div className="text-4xl font-bold text-primary">
                  {age.years} years, {age.months} months, {age.days} days
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Detailed Breakdown</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{age.totalMonths}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Months</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{age.totalWeeks}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Weeks</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{age.totalDays}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Days</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{age.totalHours.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Hours</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Next Birthday In</div>
                <div className="text-2xl font-bold text-primary mt-1">{age.daysToNextBirthday} days</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
