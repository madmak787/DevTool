"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

function Loading() {
  return <div className="h-80 animate-pulse rounded-xl border bg-muted/40" aria-label="Loading tool" />
}

// Each tool is its own chunk, so heavy libraries (terser, bwip-js, qrcode…) only load on their page
const load = (importer: () => Promise<{ default: ComponentType }>) => dynamic(importer, { loading: Loading })

const REGISTRY: Record<string, ComponentType> = {
  "json-formatter": load(() => import("./json-formatter")),
  minify: load(() => import("./minify")),
  "text-converter": load(() => import("./data-converter")),
  "diff-checker": load(() => import("./diff-checker")),
  "regex-tester": load(() => import("./regex-tester")),
  "jwt-decoder": load(() => import("./jwt-decoder")),
  "word-counter": load(() => import("./word-counter")),
  "case-converter": load(() => import("./case-converter")),
  "find-replace": load(() => import("./find-replace")),
  "text-sorter": load(() => import("./text-sorter")),
  "remove-duplicates": load(() => import("./remove-duplicates")),
  "text-reverser": load(() => import("./text-reverser")),
  "lorem-ipsum": load(() => import("./lorem-ipsum")),
  base64: load(() => import("./base64")),
  "url-encoder": load(() => import("./url-encoder")),
  "html-encoder": load(() => import("./html-encoder")),
  "number-base": load(() => import("./number-base")),
  hash: load(() => import("./hash")),
  "password-generator": load(() => import("./password-generator")),
  uuid: load(() => import("./uuid")),
  "color-picker": load(() => import("./color-picker")),
  gradient: load(() => import("./gradient")),
  "image-converter": load(() => import("./image-converter")),
  "qr-code": load(() => import("./qr-code")),
  barcode: load(() => import("./barcode")),
  timestamp: load(() => import("./timestamp")),
  "date-calculator": load(() => import("./date-calculator")),
  "age-calculator": load(() => import("./age-calculator")),
  percentage: load(() => import("./percentage")),
  "unit-converter": load(() => import("./unit-converter")),
  "sql-formatter": load(() => import("./sql-formatter")),
  "xml-formatter": load(() => import("./xml-formatter")),
  "markdown-preview": load(() => import("./markdown-preview")),
  "string-escaper": load(() => import("./string-escaper")),
  "slug-generator": load(() => import("./slug-generator")),
  "text-binary": load(() => import("./text-binary")),
  "bcrypt": load(() => import("./bcrypt")),
  "cron-parser": load(() => import("./cron-parser")),
  "chmod-calculator": load(() => import("./chmod-calculator")),
  "cidr-calculator": load(() => import("./cidr-calculator")),
  "http-status": load(() => import("./http-status")),
  "box-shadow": load(() => import("./box-shadow")),
  "favicon-generator": load(() => import("./favicon-generator")),
  "css-units": load(() => import("./css-units")),
  "aspect-ratio": load(() => import("./aspect-ratio")),
}

export function ToolRenderer({ slug }: { slug: string }) {
  const Tool = REGISTRY[slug]
  return Tool ? <Tool /> : null
}
