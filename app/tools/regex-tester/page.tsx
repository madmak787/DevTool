"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("")
  const [testString, setTestString] = useState("")
  const [flags, setFlags] = useState({ g: true, i: false, m: false })
  const [matches, setMatches] = useState<RegExpMatchArray | null>(null)
  const [error, setError] = useState("")

  const handleTest = () => {
    try {
      setError("")
      const flagString = Object.entries(flags)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join("")
      const regex = new RegExp(pattern, flagString)
      const result = testString.match(regex)
      setMatches(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid regex pattern")
      setMatches(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Regex Tester</h1>
        <p className="text-muted-foreground">Test and debug regular expressions</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Regular Expression</Label>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Flags</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flag-g"
                  checked={flags.g}
                  onCheckedChange={(checked) => setFlags({ ...flags, g: checked as boolean })}
                />
                <label htmlFor="flag-g" className="text-sm cursor-pointer">
                  Global (g)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flag-i"
                  checked={flags.i}
                  onCheckedChange={(checked) => setFlags({ ...flags, i: checked as boolean })}
                />
                <label htmlFor="flag-i" className="text-sm cursor-pointer">
                  Case Insensitive (i)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flag-m"
                  checked={flags.m}
                  onCheckedChange={(checked) => setFlags({ ...flags, m: checked as boolean })}
                />
                <label htmlFor="flag-m" className="text-sm cursor-pointer">
                  Multiline (m)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Test String</Label>
            <Textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              className="min-h-[200px] font-mono"
            />
          </div>

          <Button onClick={handleTest} className="w-full">
            Test Regex
          </Button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {matches && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Matches ({matches.length})</Label>
                <Badge variant="secondary">{matches.length} found</Badge>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {matches.map((match, index) => (
                  <div key={index} className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Match {index + 1}</span>
                    </div>
                    <code className="text-sm">{match}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matches !== null && matches.length === 0 && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">No matches found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
