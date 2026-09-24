"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Copy, Check } from "lucide-react"

export default function BarcodePage() {
  const [text, setText] = useState("")
  const [format, setFormat] = useState("code128")
  const [copied, setCopied] = useState(false)

  const barcodeUrl = text
    ? `https://bwipjs-api.metafloor.com/?bcid=${format}&text=${encodeURIComponent(text)}&scale=3&includetext`
    : ""

  const handleDownload = () => {
    if (!barcodeUrl) return
    const link = document.createElement("a")
    link.href = barcodeUrl
    link.download = `barcode-${format}.png`
    link.click()
  }

  const handleCopy = async () => {
    if (!barcodeUrl) return
    await navigator.clipboard.writeText(barcodeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Barcode Generator</h1>
        <p className="text-muted-foreground">Generate various types of barcodes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Barcode Data</Label>
              <Input
                id="text"
                placeholder="Enter text or numbers..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="format">Barcode Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code128">Code 128</SelectItem>
                  <SelectItem value="code39">Code 39</SelectItem>
                  <SelectItem value="ean13">EAN-13</SelectItem>
                  <SelectItem value="ean8">EAN-8</SelectItem>
                  <SelectItem value="upca">UPC-A</SelectItem>
                  <SelectItem value="upce">UPC-E</SelectItem>
                  <SelectItem value="itf14">ITF-14</SelectItem>
                  <SelectItem value="datamatrix">Data Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDownload} disabled={!text} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleCopy} disabled={!text} variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-center min-h-[300px]">
            {barcodeUrl ? (
              <img src={barcodeUrl || "/placeholder.svg"} alt="Barcode" className="max-w-full" />
            ) : (
              <p className="text-muted-foreground">Enter data to generate barcode</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Barcode Formats</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <strong>Code 128:</strong> High-density, alphanumeric
          </div>
          <div>
            <strong>Code 39:</strong> Alphanumeric, widely used
          </div>
          <div>
            <strong>EAN-13:</strong> European Article Number (13 digits)
          </div>
          <div>
            <strong>UPC-A:</strong> Universal Product Code (12 digits)
          </div>
        </div>
      </Card>
    </div>
  )
}
