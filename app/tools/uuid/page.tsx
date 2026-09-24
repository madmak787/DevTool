"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, RefreshCw } from "lucide-react"

export default function UUIDPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID())
    setUuids(newUuids)
  }

  const handleCopy = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">UUID Generator</h1>
        <p className="text-muted-foreground">Generate universally unique identifiers (v4)</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Number of UUIDs</Label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1)))}
              min={1}
              max={100}
            />
          </div>

          <Button onClick={handleGenerate} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate UUID{count > 1 ? "s" : ""}
          </Button>

          {uuids.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Generated UUIDs</Label>
                {uuids.length > 1 && (
                  <Button size="sm" variant="outline" onClick={handleCopyAll}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={uuid} readOnly className="font-mono" />
                    <Button size="icon" variant="outline" onClick={() => handleCopy(uuid)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
