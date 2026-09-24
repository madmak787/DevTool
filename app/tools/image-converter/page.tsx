"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download } from "lucide-react"

export default function ImageConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState("png")
  const [previewUrl, setPreviewUrl] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleConvert = () => {
    if (!selectedFile) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `converted.${outputFormat}`
            link.click()
            URL.revokeObjectURL(url)
          }
        },
        `image/${outputFormat}`,
        0.95,
      )
    }

    img.src = previewUrl
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Image Converter</h1>
        <p className="text-muted-foreground">Convert images between different formats</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="file">Upload Image</Label>
            <div className="mt-2">
              <label
                htmlFor="file"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, GIF</p>
                </div>
                <input id="file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {previewUrl && (
            <div>
              <Label>Preview</Label>
              <div className="mt-2 border rounded-lg p-4 flex items-center justify-center bg-muted/50">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="format">Output Format</Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConvert} disabled={!selectedFile} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Convert & Download
          </Button>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Supported Formats</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>PNG:</strong> Lossless compression, supports transparency
          </p>
          <p>
            <strong>JPEG:</strong> Lossy compression, smaller file sizes, no transparency
          </p>
          <p>
            <strong>WebP:</strong> Modern format, excellent compression, supports transparency
          </p>
        </div>
      </Card>
    </div>
  )
}
