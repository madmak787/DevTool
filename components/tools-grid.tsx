"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  FileText,
  Code,
  GitCompare,
  ImageIcon,
  Hash,
  Lock,
  Palette,
  QrCode,
  Calendar,
  Clock,
  Ruler,
  Percent,
  Binary,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  FileJson,
  Braces,
  FileCode,
} from "lucide-react"

const toolCategories = [
  {
    name: "Text Tools",
    tools: [
      { name: "Text Converter", href: "/text-converter", icon: FileText, description: "Convert between formats" },
      { name: "Case Converter", href: "/tools/case-converter", icon: Type, description: "Change text case" },
      { name: "Word Counter", href: "/tools/word-counter", icon: AlignLeft, description: "Count words & characters" },
      { name: "Text Sorter", href: "/tools/text-sorter", icon: List, description: "Sort lines alphabetically" },
      {
        name: "Remove Duplicates",
        href: "/tools/remove-duplicates",
        icon: CheckSquare,
        description: "Remove duplicate lines",
      },
      { name: "Find & Replace", href: "/tools/find-replace", icon: FileText, description: "Find and replace text" },
      { name: "Text Reverser", href: "/tools/text-reverser", icon: FileText, description: "Reverse text or words" },
      { name: "Lorem Ipsum", href: "/tools/lorem-ipsum", icon: FileText, description: "Generate placeholder text" },
    ],
  },
  {
    name: "Code Tools",
    tools: [
      { name: "Minify/Beautify", href: "/minify", icon: Code, description: "Format & compress code" },
      { name: "Diff Checker", href: "/diff-checker", icon: GitCompare, description: "Compare text differences" },
      { name: "JSON Formatter", href: "/tools/json-formatter", icon: FileJson, description: "Format & validate JSON" },
      { name: "Base64 Encode/Decode", href: "/tools/base64", icon: Binary, description: "Encode/decode Base64" },
      { name: "URL Encoder/Decoder", href: "/tools/url-encoder", icon: Braces, description: "Encode/decode URLs" },
      { name: "HTML Encoder/Decoder", href: "/tools/html-encoder", icon: FileCode, description: "Encode/decode HTML" },
      { name: "Regex Tester", href: "/tools/regex-tester", icon: Code, description: "Test regular expressions" },
      { name: "Color Picker", href: "/tools/color-picker", icon: Palette, description: "Pick & convert colors" },
    ],
  },
  {
    name: "Hash & Crypto",
    tools: [
      { name: "MD5 Generator", href: "/tools/md5", icon: Hash, description: "Generate MD5 hash" },
      { name: "SHA Generator", href: "/tools/sha", icon: Hash, description: "Generate SHA hash" },
      {
        name: "Password Generator",
        href: "/tools/password-generator",
        icon: Lock,
        description: "Generate secure passwords",
      },
      { name: "UUID Generator", href: "/tools/uuid", icon: Hash, description: "Generate UUIDs" },
    ],
  },
  {
    name: "Converters",
    tools: [
      {
        name: "Image Converter",
        href: "/tools/image-converter",
        icon: ImageIcon,
        description: "Convert image formats",
      },
      { name: "Unit Converter", href: "/tools/unit-converter", icon: Ruler, description: "Convert units" },
      { name: "Number Base Converter", href: "/tools/number-base", icon: Binary, description: "Convert number bases" },
      { name: "Timestamp Converter", href: "/tools/timestamp", icon: Clock, description: "Convert timestamps" },
    ],
  },
  {
    name: "Generators",
    tools: [
      { name: "QR Code Generator", href: "/tools/qr-code", icon: QrCode, description: "Generate QR codes" },
      { name: "Barcode Generator", href: "/tools/barcode", icon: QrCode, description: "Generate barcodes" },
      { name: "Gradient Generator", href: "/tools/gradient", icon: Palette, description: "Create CSS gradients" },
    ],
  },
  {
    name: "Calculators",
    tools: [
      { name: "Percentage Calculator", href: "/tools/percentage", icon: Percent, description: "Calculate percentages" },
      {
        name: "Date Calculator",
        href: "/tools/date-calculator",
        icon: Calendar,
        description: "Calculate date differences",
      },
      { name: "Age Calculator", href: "/tools/age-calculator", icon: Calendar, description: "Calculate age" },
    ],
  },
]

export function ToolsGrid() {
  return (
    <div className="space-y-12">
      {toolCategories.map((category) => (
        <div key={category.name}>
          <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link key={tool.name} href={tool.href}>
                  <Card className="p-6 hover:bg-accent transition-colors cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 text-balance">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground text-pretty">{tool.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
