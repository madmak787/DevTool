"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Star, X } from "lucide-react"
import { useFavorites, useRecent } from "@/hooks/use-local-storage"
import { CATEGORIES, POPULAR_TOOLS, TOOLS, TOOLS_BY_SLUG, matchTool, type Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

function ToolCard({ tool, favorite, onToggleFavorite }: { tool: Tool; favorite: boolean; onToggleFavorite: () => void }) {
  const Icon = tool.icon
  return (
    <div className="group relative flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 pr-6">
        <h3 className="text-sm font-semibold">
          <Link href={`/${tool.slug}/`} className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/50">
            {tool.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{tool.summary}</p>
      </div>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        title={favorite ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "absolute top-3 right-3 z-10 rounded-md p-1 text-muted-foreground/60 opacity-0 transition hover:text-warning focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
          favorite && "text-warning opacity-100",
        )}
      >
        <Star className={cn("size-4", favorite && "fill-current")} />
      </button>
    </div>
  )
}

export function HomeView() {
  const [query, setQuery] = React.useState("")
  const { isFavorite, toggle } = useFavorites()
  const { recent } = useRecent()
  const recentTools = recent.map((s) => TOOLS_BY_SLUG[s]).filter(Boolean)
  const results = TOOLS.filter((t) => matchTool(t, query))
  const filtering = query.trim().length > 0

  const grid = (tools: Tool[]) => (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {tools.map((t) => (
        <ToolCard key={t.slug} tool={t} favorite={isFavorite(t.slug)} onToggleFavorite={() => toggle(t.slug)} />
      ))}
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Developer tools that stay in your browser</h1>
        <p className="mt-2 text-[15px] text-muted-foreground text-pretty">
          {TOOLS.length} quick utilities for formatting, converting, encoding and generating. No sign-up, no uploads: your data never leaves this page.
        </p>
      </div>

      <div className="relative mt-6 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          placeholder="What do you need? Try “json”, “base64” or “color”"
          aria-label="Search tools"
          className="h-11 w-full rounded-xl border bg-card pr-10 pl-10 text-[15px] shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
        />
        {filtering && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {filtering ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {results.length} {results.length === 1 ? "tool" : "tools"} found
          </h2>
          {results.length > 0 ? grid(results) : <p className="py-10 text-sm text-muted-foreground">Nothing matches “{query}”.</p>}
        </section>
      ) : (
        <>
          {recentTools.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Recently used</h2>
              <div className="flex flex-wrap gap-2">
                {recentTools.map((t) => {
                  const Icon = t.icon
                  return (
                    <Link
                      key={t.slug}
                      href={`/${t.slug}/`}
                      className="inline-flex h-8 items-center gap-2 rounded-full border bg-card px-3 text-[13px] font-medium shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Icon className="size-3.5 text-primary" />
                      {t.name}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
          <section className="mt-8" aria-labelledby="cat-popular">
            <h2 id="cat-popular" className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Most popular
            </h2>
            {grid(POPULAR_TOOLS)}
          </section>
          {CATEGORIES.map((c) => (
            <section key={c.id} className="mt-10" aria-labelledby={`cat-${c.id}`}>
              <h2 id={`cat-${c.id}`} className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {c.name}
              </h2>
              {grid(TOOLS.filter((t) => t.category === c.id))}
            </section>
          ))}
        </>
      )}
    </div>
  )
}
