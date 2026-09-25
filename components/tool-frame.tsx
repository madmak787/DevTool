"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites, useRecent } from "@/hooks/use-local-storage"
import { TOOLS_BY_SLUG } from "@/lib/tools"
import { cn } from "@/lib/utils"

/** Title bar shared by every tool page; also records the tool as recently used */
export function ToolFrame({ slug, children }: { slug: string; children: React.ReactNode }) {
  const tool = TOOLS_BY_SLUG[slug]
  const { isFavorite, toggle } = useFavorites()
  const { push } = useRecent()
  const Icon = tool.icon
  const fav = isFavorite(slug)

  React.useEffect(() => {
    push(slug)
  }, [slug, push])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 flex items-start gap-3.5">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{tool.name}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground text-pretty">{tool.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggle(slug)}
          aria-pressed={fav}
          className="shrink-0"
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn(fav && "fill-warning text-warning")} />
          <span className="hidden sm:inline">{fav ? "Favorited" : "Favorite"}</span>
        </Button>
      </div>
      {children}
    </div>
  )
}
