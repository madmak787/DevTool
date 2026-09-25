"use client"

import * as React from "react"
import { Eraser, FileInput, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CodeArea,
  CopyButton,
  DownloadButton,
  EDITOR_HEIGHT,
  Message,
  OptionSwitch,
  Panel,
  Segmented,
  byteLength,
  formatBytes,
} from "@/components/tool-kit"

type Lang = "js" | "css" | "html" | "json"
type Mode = "minify" | "beautify"

const SAMPLES: Record<Lang, string> = {
  js: `// Greets everyone on the list
function greet(people, greeting = "Hello") {
  const url = "https://example.com/api"; // not a comment inside a string
  return people.map((person) => {
    return \`\${greeting}, \${person.name}!\`;
  });
}

console.log(greet([{ name: "Ada" }, { name: "Linus" }]));
`,
  css: `/* Card component */
.card {
  display: flex;
  padding: 16px 24px;
  margin: 0px;
  color: #ffffff;
  background: url("img/bg.png") no-repeat;
}

.card:hover > .title,
.card:focus-within > .title {
  color: #336699;
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Page metadata -->
    <title>Hello</title>
    <style>
      body { margin: 0; font-family: system-ui; }
    </style>
  </head>
  <body>
    <h1>Hello,   <em>world</em>!</h1>
    <pre>  keep   this
    spacing</pre>
    <script>
      const answer = 40 + 2;
      console.log("The answer is", answer);
    </script>
  </body>
</html>
`,
  json: `{"name":"DevTools","tags":["json","minify"],"nested":{"ok":true,"count":3}}`,
}

const FILES: Record<Lang, [string, string]> = {
  js: ["script.min.js", "text/javascript"],
  css: ["styles.min.css", "text/css"],
  html: ["index.min.html", "text/html"],
  json: ["data.min.json", "application/json"],
}

async function minifyJs(code: string, mangle: boolean) {
  const { minify } = await import("terser")
  const out = await minify(code, { mangle, compress: true, format: { comments: false } })
  return out.code ?? ""
}

async function minifyCss(code: string) {
  const { minify } = await import("csso")
  return minify(code).css
}

const BLOCK_TAGS =
  "html|head|body|title|meta|link|script|style|div|p|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|th|td|section|article|aside|header|footer|nav|main|form|fieldset|legend|h[1-6]|hr|br|blockquote|figure|figcaption|pre|option|select|noscript|template|!doctype"

async function minifyHtml(html: string) {
  const kept: string[] = []
  const keep = (s: string) => `\u0000${kept.push(s) - 1}\u0000`

  let out = html
  // Minify inline scripts and styles, and protect whitespace-sensitive blocks
  const scripts = [...out.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  for (const m of scripts) {
    const attrs = m[1]
    const isJs = !/type\s*=\s*["']?(?!text\/javascript|module|application\/javascript)[^"'\s>]+/i.test(attrs)
    let body = m[2]
    if (isJs && body.trim()) {
      try {
        body = await minifyJs(body, true)
      } catch {
        // leave invalid scripts as they are
      }
    }
    out = out.replace(m[0], () => keep(`<script${attrs}>${body}</script>`))
  }
  const styles = [...out.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi)]
  for (const m of styles) {
    let body = m[2]
    try {
      body = await minifyCss(body)
    } catch {
      // keep original
    }
    out = out.replace(m[0], () => keep(`<style${m[1]}>${body}</style>`))
  }
  out = out.replace(/<(pre|textarea)\b[\s\S]*?<\/\1>/gi, (m) => keep(m))
  // Comments, except IE conditional comments
  out = out.replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
  out = out.replace(/\s+/g, " ")
  // Whitespace next to block-level tags never renders
  const block = new RegExp(`\\s*(</?(?:${BLOCK_TAGS})\\b[^>]*>)\\s*`, "gi")
  out = out.replace(block, "$1")
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[Number(i)])
  return out.trim()
}

async function run(lang: Lang, mode: Mode, code: string, opts: { indent: number; mangle: boolean }) {
  if (lang === "json") {
    const data = JSON.parse(code)
    return mode === "minify" ? JSON.stringify(data) : JSON.stringify(data, null, opts.indent)
  }
  if (mode === "minify") {
    if (lang === "js") return minifyJs(code, opts.mangle)
    if (lang === "css") return minifyCss(code)
    return minifyHtml(code)
  }
  const beautify = (await import("js-beautify")).default
  const common = { indent_size: opts.indent, end_with_newline: true, preserve_newlines: true, max_preserve_newlines: 2 }
  if (lang === "js") return beautify.js(code, common)
  if (lang === "css") return beautify.css(code, common)
  return beautify.html(code, { ...common, indent_inner_html: true, extra_liners: [] })
}

async function gzipSize(text: string) {
  if (typeof CompressionStream === "undefined" || !text) return null
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))
  return (await new Response(stream).arrayBuffer()).byteLength
}

export default function Minify() {
  const [lang, setLang] = React.useState<Lang>("js")
  const [mode, setMode] = React.useState<Mode>("minify")
  const [inputs, setInputs] = React.useState<Record<Lang, string>>({ js: "", css: "", html: "", json: "" })
  const [indent, setIndent] = React.useState<"2" | "4">("2")
  const [mangle, setMangle] = React.useState(true)
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [gz, setGz] = React.useState<number | null>(null)

  const input = inputs[lang]
  const setInput = (v: string) => setInputs((p) => ({ ...p, [lang]: v }))

  React.useEffect(() => {
    if (!input.trim()) {
      setOutput("")
      setError("")
      setGz(null)
      return
    }
    let cancelled = false
    setBusy(true)
    const t = setTimeout(async () => {
      try {
        const out = await run(lang, mode, input, { indent: Number(indent), mangle })
        if (cancelled) return
        setOutput(out)
        setError("")
        setGz(mode === "minify" ? await gzipSize(out) : null)
      } catch (e) {
        if (cancelled) return
        const err = e as { message?: string; line?: number; col?: number }
        setError(err.line ? `${err.message} (line ${err.line}, column ${(err.col ?? 0) + 1})` : String(err.message ?? e))
        setOutput("")
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [input, lang, mode, indent, mangle])

  const inBytes = byteLength(input)
  const outBytes = byteLength(output)
  const saved = inBytes ? Math.round(((inBytes - outBytes) / inBytes) * 100) : 0
  const [file, mime] = FILES[lang]
  const filename = mode === "minify" ? file : file.replace(".min", "")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          ariaLabel="Language"
          value={lang}
          onChange={setLang}
          options={[
            { value: "js", label: "JavaScript" },
            { value: "css", label: "CSS" },
            { value: "html", label: "HTML" },
            { value: "json", label: "JSON" },
          ]}
        />
        <Segmented
          ariaLabel="Action"
          value={mode}
          onChange={setMode}
          options={[
            { value: "minify", label: "Minify" },
            { value: "beautify", label: "Beautify" },
          ]}
        />
        {mode === "beautify" && (
          <Segmented
            ariaLabel="Indentation"
            size="sm"
            value={indent}
            onChange={setIndent}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
            ]}
          />
        )}
        {mode === "minify" && lang === "js" && (
          <OptionSwitch id="mangle" label="Shorten variable names" checked={mangle} onChange={setMangle} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Input"
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLES[lang])}>
                <FileInput /> Sample
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
                <Eraser /> Clear
              </Button>
            </>
          }
          footer={<span>{formatBytes(inBytes)}</span>}
        >
          <CodeArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste ${lang === "js" ? "JavaScript" : lang.toUpperCase()} here`}
            invalid={!!error}
            className={EDITOR_HEIGHT}
            aria-label="Code input"
          />
        </Panel>

        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              Output {busy && <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />}
            </span>
          }
          actions={
            <>
              <CopyButton value={output} />
              <DownloadButton content={output} filename={filename} mime={mime} iconOnly />
            </>
          }
          footer={
            output ? (
              <>
                <span>{formatBytes(outBytes)}</span>
                {mode === "minify" && inBytes > 0 && (
                  <span className={saved > 0 ? "font-medium text-success" : ""}>
                    {saved > 0 ? `${saved}% smaller` : "No size saved"}
                  </span>
                )}
                {gz !== null && <span>{formatBytes(gz)} gzipped</span>}
              </>
            ) : (
              <span>Output updates as you type</span>
            )
          }
        >
          {error ? (
            <div className={EDITOR_HEIGHT}>
              <Message>
                <p className="font-medium">Couldn’t parse the input</p>
                <p className="mt-0.5 break-words">{error}</p>
              </Message>
            </div>
          ) : (
            <CodeArea readOnly value={output} placeholder="Result appears here" className={EDITOR_HEIGHT} aria-label="Result" />
          )}
        </Panel>
      </div>
    </div>
  )
}
