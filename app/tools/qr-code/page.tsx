"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Copy, Check } from "lucide-react"

export default function QRCodePage() {
  const [text, setText] = useState("")
  const [size, setSize] = useState(256)
  const [copied, setCopied] = useState(false)

  const qrCodeUrl = text
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
    : ""

  const handleDownload = () => {
    if (!qrCodeUrl) return
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = "qrcode.png"
    link.click()
  }

  const handleCopy = async () => {
    if (!qrCodeUrl) return
    await navigator.clipboard.writeText(qrCodeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Generate QR codes from text, URLs, or any data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text or URL</Label>
              <Textarea
                id="text"
                placeholder="Enter text, URL, or any data..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="size">Size (pixels)</Label>
              <Input
                id="size"
                type="number"
                min="128"
                max="1024"
                step="64"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="mt-2"
              />
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
            {qrCodeUrl ? (
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="max-w-full" />
            ) : (
              <p className="text-muted-foreground">Enter text to generate QR code</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">About QR Codes</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>QR codes can store various types of data including URLs, text, contact information, and more.</p>
          <p>Common uses: Website links, WiFi credentials, contact cards, payment information, and product tracking.</p>
          <p>This tool uses a free API service to generate QR codes client-side without storing your data.</p>
        </div>
      </Card>
    </div>
  )
}
