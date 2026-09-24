"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check } from "lucide-react"

export default function GradientPage() {
  const [color1, setColor1] = useState("#667eea")
  const [color2, setColor2] = useState("#764ba2")
  const [direction, setDirection] = useState("to right")
  const [copied, setCopied] = useState(false)

  const gradientCSS = `background: linear-gradient(${direction}, ${color1}, ${color2});`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gradientCSS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const presetGradients = [
    { name: "Purple Dream", colors: ["#667eea", "#764ba2"] },
    { name: "Sunset", colors: ["#ff6b6b", "#feca57"] },
    { name: "Ocean", colors: ["#2e86de", "#54a0ff"] },
    { name: "Forest", colors: ["#26de81", "#20bf6b"] },
    { name: "Fire", colors: ["#fc5c65", "#fd9644"] },
    { name: "Ice", colors: ["#45aaf2", "#4b7bec"] },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Gradient Generator</h1>
        <p className="text-muted-foreground">Create beautiful CSS gradients</p>
      </div>

      <Card className="p-6 mb-6">
        <div
          className="w-full h-64 rounded-lg mb-6"
          style={{ background: `linear-gradient(${direction}, ${color1}, ${color2})` }}
        />

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="color1">Color 1</Label>
              <div className="flex gap-2">
                <Input
                  id="color1"
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-20 h-10"
                />
                <Input value={color1} onChange={(e) => setColor1(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color2">Color 2</Label>
              <div className="flex gap-2">
                <Input
                  id="color2"
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-20 h-10"
                />
                <Input value={color2} onChange={(e) => setColor2(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to right">To Right</SelectItem>
                <SelectItem value="to left">To Left</SelectItem>
                <SelectItem value="to bottom">To Bottom</SelectItem>
                <SelectItem value="to top">To Top</SelectItem>
                <SelectItem value="to bottom right">To Bottom Right</SelectItem>
                <SelectItem value="to bottom left">To Bottom Left</SelectItem>
                <SelectItem value="to top right">To Top Right</SelectItem>
                <SelectItem value="to top left">To Top Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CSS Code</Label>
            <div className="flex gap-2">
              <Input value={gradientCSS} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Preset Gradients</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {presetGradients.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setColor1(preset.colors[0])
                setColor2(preset.colors[1])
              }}
              className="p-4 rounded-lg text-white font-medium hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(to right, ${preset.colors[0]}, ${preset.colors[1]})` }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
