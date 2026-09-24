"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export default function TimestampPage() {
  const [timestamp, setTimestamp] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTimestampChange = (value: string) => {
    setTimestamp(value)
    if (value) {
      const num = Number(value)
      if (!isNaN(num)) {
        const date = new Date(num * 1000)
        setDateTime(date.toISOString().slice(0, 16))
      }
    }
  }

  const handleDateTimeChange = (value: string) => {
    setDateTime(value)
    if (value) {
      const date = new Date(value)
      setTimestamp(Math.floor(date.getTime() / 1000).toString())
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentTimestamp = Math.floor(currentTime / 1000)
  const currentDate = new Date(currentTime)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Timestamp Converter</h1>
        <p className="text-muted-foreground">Convert between Unix timestamps and human-readable dates</p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Time</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label>Unix Timestamp</Label>
              <Input value={currentTimestamp} readOnly className="mt-2" />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(currentTimestamp.toString())}
              className="mt-8"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div>
            <Label>Human Readable</Label>
            <Input value={currentDate.toString()} readOnly className="mt-2" />
          </div>
          <div>
            <Label>ISO 8601</Label>
            <Input value={currentDate.toISOString()} readOnly className="mt-2" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Convert</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="timestamp">Unix Timestamp (seconds)</Label>
            <Input
              id="timestamp"
              type="number"
              placeholder="Enter timestamp..."
              value={timestamp}
              onChange={(e) => handleTimestampChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => handleDateTimeChange(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">About Unix Timestamps</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Unix timestamp is the number of seconds since January 1, 1970 00:00:00 UTC.</p>
          <p>It is widely used in programming and databases for storing date and time information.</p>
          <p>This tool converts between Unix timestamps and human-readable date formats.</p>
        </div>
      </Card>
    </div>
  )
}
