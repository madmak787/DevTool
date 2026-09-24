"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GitCompare } from "lucide-react"

type DiffLine = {
  type: "added" | "removed" | "unchanged"
  content: string
  lineNumber: number
}

export function DiffChecker() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [diff, setDiff] = useState<DiffLine[]>([])
  const [showDiff, setShowDiff] = useState(false)

  const computeDiff = () => {
    const lines1 = text1.split("\n")
    const lines2 = text2.split("\n")

    const result: DiffLine[] = []
    const maxLength = Math.max(lines1.length, lines2.length)

    // Simple line-by-line diff
    let i = 0
    let j = 0

    while (i < lines1.length || j < lines2.length) {
      const line1 = lines1[i]
      const line2 = lines2[j]

      if (i >= lines1.length) {
        // Only lines2 remaining (added)
        result.push({ type: "added", content: line2, lineNumber: j + 1 })
        j++
      } else if (j >= lines2.length) {
        // Only lines1 remaining (removed)
        result.push({ type: "removed", content: line1, lineNumber: i + 1 })
        i++
      } else if (line1 === line2) {
        // Lines match
        result.push({ type: "unchanged", content: line1, lineNumber: i + 1 })
        i++
        j++
      } else {
        // Lines differ - check if next lines match
        const nextMatch1 = lines2.indexOf(line1, j)
        const nextMatch2 = lines1.indexOf(line2, i)

        if (nextMatch1 !== -1 && (nextMatch2 === -1 || nextMatch1 - j < nextMatch2 - i)) {
          // line1 appears later in text2, so lines before it were added
          result.push({ type: "added", content: line2, lineNumber: j + 1 })
          j++
        } else if (nextMatch2 !== -1) {
          // line2 appears later in text1, so lines before it were removed
          result.push({ type: "removed", content: line1, lineNumber: i + 1 })
          i++
        } else {
          // Both lines are different
          result.push({ type: "removed", content: line1, lineNumber: i + 1 })
          result.push({ type: "added", content: line2, lineNumber: j + 1 })
          i++
          j++
        }
      }
    }

    setDiff(result)
    setShowDiff(true)
  }

  const stats = {
    added: diff.filter((d) => d.type === "added").length,
    removed: diff.filter((d) => d.type === "removed").length,
    unchanged: diff.filter((d) => d.type === "unchanged").length,
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <Label htmlFor="text1" className="mb-2 block">
            Original Text
          </Label>
          <Textarea
            id="text1"
            placeholder="Paste your original text here..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
        </Card>

        <Card className="p-6">
          <Label htmlFor="text2" className="mb-2 block">
            Modified Text
          </Label>
          <Textarea
            id="text2"
            placeholder="Paste your modified text here..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={computeDiff} size="lg">
          <GitCompare className="h-5 w-5 mr-2" />
          Find Differences
        </Button>
      </div>

      {showDiff && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Comparison Results</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500 rounded"></div>
                  <span>
                    Added: <span className="font-semibold">{stats.added}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded"></div>
                  <span>
                    Removed: <span className="font-semibold">{stats.removed}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted border border-border rounded"></div>
                  <span>
                    Unchanged: <span className="font-semibold">{stats.unchanged}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 text-sm font-mono text-muted-foreground border-b border-border">
                Line-by-line comparison
              </div>
              <div className="max-h-[600px] overflow-auto">
                {diff.map((line, index) => (
                  <div
                    key={index}
                    className={`flex font-mono text-sm border-b border-border last:border-b-0 ${
                      line.type === "added"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : line.type === "removed"
                          ? "bg-red-500/10 text-red-700 dark:text-red-400"
                          : "bg-background text-foreground"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 w-16 text-right border-r border-border ${
                        line.type === "added"
                          ? "bg-green-500/20"
                          : line.type === "removed"
                            ? "bg-red-500/20"
                            : "bg-muted"
                      }`}
                    >
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                      {line.lineNumber}
                    </div>
                    <div className="px-4 py-2 flex-1 whitespace-pre-wrap break-all">
                      {line.content || <span className="text-muted-foreground italic">(empty line)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Side-by-Side View</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-red-500/20 px-4 py-2 text-sm font-semibold border-b border-border">
                  Original (Removed Lines)
                </div>
                <div className="max-h-[400px] overflow-auto">
                  {diff
                    .filter((line) => line.type === "removed" || line.type === "unchanged")
                    .map((line, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 font-mono text-sm border-b border-border last:border-b-0 ${
                          line.type === "removed"
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : "bg-background text-foreground"
                        }`}
                      >
                        {line.content || <span className="text-muted-foreground italic">(empty line)</span>}
                      </div>
                    ))}
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-green-500/20 px-4 py-2 text-sm font-semibold border-b border-border">
                  Modified (Added Lines)
                </div>
                <div className="max-h-[400px] overflow-auto">
                  {diff
                    .filter((line) => line.type === "added" || line.type === "unchanged")
                    .map((line, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 font-mono text-sm border-b border-border last:border-b-0 ${
                          line.type === "added"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-background text-foreground"
                        }`}
                      >
                        {line.content || <span className="text-muted-foreground italic">(empty line)</span>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
