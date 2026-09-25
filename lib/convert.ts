import YAML from "yaml"

export type InputFormat = "auto" | "json" | "yaml" | "csv"
export type OutputFormat = "json" | "yaml" | "csv" | "xml" | "php" | "print_r" | "var_dump" | "sql" | "typescript"

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

const isObj = (v: unknown): v is Record<string, Json> => !!v && typeof v === "object" && !Array.isArray(v)

/* ---------- CSV ---------- */

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ""
  const counts = [",", ";", "\t", "|"].map((d) => [d, firstLine.split(d).length - 1] as const)
  counts.sort((a, b) => b[1] - a[1])
  return counts[0][1] > 0 ? counts[0][0] : ","
}

/** RFC 4180 parser: quoted fields, escaped quotes ("") and newlines inside quotes */
export function parseCsvRows(text: string, delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
    } else if (c === '"' && field === "") quoted = true
    else if (c === delimiter) {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (quoted) throw new Error("CSV has an unclosed quote")
  if (field !== "" || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""))
}

function inferScalar(s: string): Json {
  if (s === "") return ""
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(s) && Number.isFinite(Number(s))) return Number(s)
  if (s === "true" || s === "false") return s === "true"
  if (s === "null") return null
  return s
}

export function parseCsv(text: string): Json {
  const rows = parseCsvRows(text)
  if (rows.length === 0) return []
  const [header, ...body] = rows
  const keys = header.map((h, i) => h.trim() || `column_${i + 1}`)
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, inferScalar(r[i] ?? "")])))
}

function csvField(v: Json, delimiter: string) {
  const s = v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)
  return s.includes(delimiter) || /["\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(data: Json, delimiter = ","): string {
  const rows = Array.isArray(data) ? data : [data]
  if (rows.length === 0) return ""
  if (rows.every(isObj)) {
    const keys: string[] = []
    for (const r of rows as Record<string, Json>[]) for (const k of Object.keys(r)) if (!keys.includes(k)) keys.push(k)
    const lines = [keys.map((k) => csvField(k, delimiter)).join(delimiter)]
    for (const r of rows as Record<string, Json>[]) lines.push(keys.map((k) => csvField(r[k] ?? null, delimiter)).join(delimiter))
    return lines.join("\n")
  }
  return rows.map((r) => (Array.isArray(r) ? r : [r]).map((v) => csvField(v, delimiter)).join(delimiter)).join("\n")
}

/* ---------- XML ---------- */

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")

function xmlName(key: string) {
  let n = key.replace(/[^A-Za-z0-9_.-]/g, "_")
  if (!/^[A-Za-z_]/.test(n) || /^xml/i.test(n)) n = `_${n}`
  return n
}

export function toXml(data: Json, root = "root"): string {
  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>']
  const walk = (value: Json, name: string, depth: number) => {
    const pad = "  ".repeat(depth)
    const tag = xmlName(name)
    if (Array.isArray(value)) {
      lines.push(`${pad}<${tag}>`)
      for (const item of value) walk(item, "item", depth + 1)
      lines.push(`${pad}</${tag}>`)
    } else if (isObj(value)) {
      const entries = Object.entries(value)
      if (entries.length === 0) return lines.push(`${pad}<${tag}/>`)
      lines.push(`${pad}<${tag}>`)
      for (const [k, v] of entries) walk(v, k, depth + 1)
      lines.push(`${pad}</${tag}>`)
    } else if (value === null) lines.push(`${pad}<${tag}/>`)
    else lines.push(`${pad}<${tag}>${xmlEscape(String(value))}</${tag}>`)
  }
  walk(data, root, 0)
  return lines.join("\n")
}

/* ---------- PHP ---------- */

const phpString = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`
const phpKey = (k: string) => (/^(0|[1-9]\d*)$/.test(k) ? k : phpString(k))

export function toPhp(data: Json, indent = 0): string {
  const pad = "    ".repeat(indent)
  if (data === null) return "null"
  if (typeof data === "boolean") return data ? "true" : "false"
  if (typeof data === "number") return String(data)
  if (typeof data === "string") return phpString(data)
  const entries: [string | null, Json][] = Array.isArray(data) ? data.map((v) => [null, v]) : Object.entries(data)
  if (entries.length === 0) return "[]"
  const inner = entries
    .map(([k, v]) => `${pad}    ${k === null ? "" : `${phpKey(k)} => `}${toPhp(v, indent + 1)},`)
    .join("\n")
  return `[\n${inner}\n${pad}]`
}

function phpScalar(v: Json) {
  if (v === null) return ""
  if (typeof v === "boolean") return v ? "1" : ""
  return String(v)
}

/** Matches PHP's print_r() of json_decode($json, true) */
export function toPrintR(data: Json, pad = ""): string {
  if (data === null || typeof data !== "object") return phpScalar(data)
  const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v] as const) : Object.entries(data)
  let s = `Array\n${pad}(\n`
  for (const [k, v] of entries) {
    s += `${pad}    [${k}] => ${v !== null && typeof v === "object" ? toPrintR(v, pad + "        ") + "\n" : phpScalar(v)}\n`
  }
  return s + `${pad})\n`
}

/** Matches PHP's var_dump() of json_decode($json, true) */
export function toVarDump(data: Json, pad = ""): string {
  if (data === null) return "NULL"
  if (typeof data === "boolean") return `bool(${data})`
  if (typeof data === "number") return Number.isInteger(data) ? `int(${data})` : `float(${data})`
  if (typeof data === "string") return `string(${new TextEncoder().encode(data).length}) "${data}"`
  const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v] as const) : Object.entries(data)
  let s = `array(${entries.length}) {\n`
  for (const [k, v] of entries) {
    const key = /^(0|-?[1-9]\d*)$/.test(k) ? k : `"${k}"`
    s += `${pad}  [${key}]=>\n${pad}  ${toVarDump(v, pad + "  ")}\n`
  }
  return s + `${pad}}`
}

/* ---------- SQL ---------- */

const sqlIdent = (s: string) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s) ? s : `"${s.replace(/"/g, '""')}"`)

function sqlValue(v: Json) {
  if (v === null || v === undefined) return "NULL"
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE"
  if (typeof v === "number") return String(v)
  const s = typeof v === "string" ? v : JSON.stringify(v)
  return `'${s.replace(/'/g, "''")}'`
}

export function toSql(data: Json, table = "my_table"): string {
  const rows = Array.isArray(data) ? data : [data]
  if (!rows.length || !rows.every(isObj)) {
    throw new Error("SQL output needs an object or an array of objects (one per row)")
  }
  const cols: string[] = []
  for (const r of rows as Record<string, Json>[]) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k)
  const values = (rows as Record<string, Json>[]).map((r) => `  (${cols.map((c) => sqlValue(r[c] ?? null)).join(", ")})`)
  return `INSERT INTO ${sqlIdent(table || "my_table")} (${cols.map(sqlIdent).join(", ")})\nVALUES\n${values.join(",\n")};`
}

/* ---------- TypeScript ---------- */

const pascal = (s: string) =>
  (s.replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase()) ||
    "Item").replace(/^(\d)/, "_$1")

export function toTypeScript(data: Json, rootName = "Root"): string {
  const interfaces = new Map<string, string>()

  const typeOf = (value: Json, name: string): string => {
    if (value === null) return "null"
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]"
      if (value.every(isObj)) {
        // Merge every object in the array into one interface; keys missing from some items are optional
        const merged: Record<string, Json[]> = {}
        for (const item of value as Record<string, Json>[]) for (const [k, v] of Object.entries(item)) (merged[k] ??= []).push(v)
        const itemName = pascal(name.replace(/s$/, "")) || "Item"
        emit(itemName, merged, value.length)
        return `${itemName}[]`
      }
      const types = [...new Set(value.map((v) => typeOf(v, name)))]
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`
    }
    if (isObj(value)) {
      const n = pascal(name)
      emit(n, Object.fromEntries(Object.entries(value).map(([k, v]) => [k, [v]])), 1)
      return n
    }
    return typeof value
  }

  const emit = (name: string, fields: Record<string, Json[]>, total: number) => {
    if (interfaces.has(name)) return
    interfaces.set(name, "")
    const body = Object.entries(fields)
      .map(([k, vals]) => {
        const types = [...new Set(vals.map((v) => typeOf(v, k)))]
        const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)
        return `  ${key}${vals.length < total ? "?" : ""}: ${types.join(" | ")}`
      })
      .join("\n")
    interfaces.set(name, `export interface ${name} {\n${body}\n}`)
  }

  const top = typeOf(data, rootName)
  const out = [...interfaces.values()].reverse()
  if (!isObj(data)) out.push(`export type ${pascal(rootName)} = ${top}`)
  return out.join("\n\n")
}

/* ---------- Entry point ---------- */

export function parseInput(text: string, format: InputFormat): { data: Json; detected: Exclude<InputFormat, "auto"> } {
  if (format === "json") return { data: JSON.parse(text), detected: "json" }
  if (format === "yaml") return { data: YAML.parse(text) as Json, detected: "yaml" }
  if (format === "csv") return { data: parseCsv(text), detected: "csv" }

  const t = text.trim()
  if (/^[[{"]/.test(t) || /^(-?\d|true$|false$|null$)/.test(t)) {
    try {
      return { data: JSON.parse(t), detected: "json" }
    } catch {
      // fall through
    }
  }
  const firstLine = t.split(/\r?\n/, 1)[0]
  const looksCsv = /[,;\t|]/.test(firstLine) && !/:\s/.test(firstLine) && t.includes("\n")
  if (looksCsv) return { data: parseCsv(text), detected: "csv" }
  const data = YAML.parse(text) as Json
  if (typeof data === "string" && t.includes("\n")) {
    // Plain lines of text: treat them as a list
    return { data: t.split(/\r?\n/).filter((l) => l.trim()), detected: "yaml" }
  }
  return { data, detected: "yaml" }
}

export function convert(data: Json, to: OutputFormat, opts: { table: string; root: string }): string {
  switch (to) {
    case "json":
      return JSON.stringify(data, null, 2)
    case "yaml":
      return YAML.stringify(data, { lineWidth: 0 }).trimEnd()
    case "csv":
      return toCsv(data)
    case "xml":
      return toXml(data, opts.root || "root")
    case "php":
      return `<?php\n\n$data = ${toPhp(data)};\n`
    case "print_r":
      return toPrintR(data)
    case "var_dump":
      return toVarDump(data)
    case "sql":
      return toSql(data, opts.table)
    case "typescript":
      return toTypeScript(data, opts.root ? pascal(opts.root) : "Root")
  }
}
