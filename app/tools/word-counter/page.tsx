"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function WordCounterPage() {
  const [text, setText] = useState("")

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split("\n").length,
    sentences: text.split(/[.!?]+/).filter((s) => s.trim()).length,
    paragraphs: text.split(/\n\n+/).filter((p) => p.trim()).length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Word Counter</h1>
        <p className="text-muted-foreground">Count words, characters, sentences, and more</p>
      </div>

      <Card className="p-6 mb-6">
        <Textarea
          placeholder="Start typing or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px]"
        />
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">{stats.words}</div>
          <div className="text-sm text-muted-foreground">Words</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">{stats.characters}</div>
          <div className="text-sm text-muted-foreground">Characters</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">{stats.charactersNoSpaces}</div>
          <div className="text-sm text-muted-foreground">Characters (no spaces)</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">{stats.sentences}</div>
          <div className="text-sm text-muted-foreground">Sentences</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">{stats.paragraphs}</div>
          <div className="text-sm text-muted-foreground">Paragraphs</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">{stats.lines}</div>
          <div className="text-sm text-muted-foreground">Lines</div>
        </Card>
      </div>
    </div>
  )
}
