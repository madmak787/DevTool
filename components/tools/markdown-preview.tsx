"use client"

import * as React from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeArea, CopyButton, DownloadButton, Panel, Segmented } from "@/components/tool-kit"
import { words } from "@/lib/text"

const SAMPLE = `# Project title

A short description with **bold**, *italic*, \`inline code\` and a [link](https://tool.khanamir.me).

## Features

- [x] Live preview
- [x] GitHub-flavored Markdown
- [ ] Your next idea

| Tool | Category | Status |
| --- | --- | :---: |
| JSON Formatter | Code | ✅ |
| Diff Checker | Code | ✅ |

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

> Tip: everything runs in your browser.

---

1. First
2. Second
`

export default function MarkdownPreview() {
  const [input, setInput] = React.useState(SAMPLE)
  const [view, setView] = React.useState<"preview" | "html">("preview")
  const [html, setHtml] = React.useState("")
  const [count, setCount] = React.useState(0)

  // DOMPurify needs the DOM, so render after mount; untrusted HTML in the Markdown is sanitized
  React.useEffect(() => {
    const raw = marked.parse(input, { gfm: true, breaks: false, async: false }) as string
    setHtml(DOMPurify.sanitize(raw))
    setCount(words(input).length)
  }, [input])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="Markdown"
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)}>
              <FileInput /> Sample
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
              <Eraser /> Clear
            </Button>
          </>
        }
        footer={<span>{count.toLocaleString()} words · about {Math.max(1, Math.round(count / 238))} min read</span>}
      >
        <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="# Write Markdown here" className="h-[45vh] min-h-72 resize-none lg:h-[calc(100dvh-20rem)]" aria-label="Markdown" />
      </Panel>
      <Panel
        title={<Segmented size="sm" ariaLabel="View" value={view} onChange={setView} options={[{ value: "preview", label: "Preview" }, { value: "html", label: "HTML" }]} />}
        actions={
          <>
            <CopyButton value={html} label="Copy HTML" />
            <DownloadButton content={`<!doctype html>\n<meta charset="utf-8">\n${html}`} filename="document.html" mime="text/html" iconOnly />
          </>
        }
      >
        {view === "preview" ? (
          <article
            className="markdown-body scroll-thin h-[45vh] min-h-72 overflow-auto lg:h-[calc(100dvh-20rem)]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <CodeArea readOnly value={html} className="h-[45vh] min-h-72 resize-none lg:h-[calc(100dvh-20rem)]" aria-label="HTML output" />
        )}
      </Panel>
    </div>
  )
}
