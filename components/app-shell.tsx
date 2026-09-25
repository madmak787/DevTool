"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, LayoutGrid, Menu, Search, Star, X } from "lucide-react"
import { Brand } from "@/components/brand"
import { CommandMenuProvider, useCommandMenu } from "@/components/command-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useFavorites } from "@/hooks/use-local-storage"
import { CATEGORIES, TOOLS, TOOLS_BY_SLUG, categoryName, matchTool, type Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

function currentSlug(pathname: string | null) {
  return (pathname ?? "/").replace(/^\/+|\/+$/g, "")
}

function NavLink({ tool, active, onNavigate }: { tool: Tool; active: boolean; onNavigate?: () => void }) {
  const Icon = tool.icon
  return (
    <Link
      href={`/${tool.slug}/`}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-sidebar-accent-foreground",
          active && "text-primary group-hover:text-primary",
        )}
      />
      <span className="truncate">{tool.name}</span>
    </Link>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const slug = currentSlug(usePathname())
  const [query, setQuery] = React.useState("")
  const { favorites } = useFavorites()
  const favoriteTools = favorites.map((s) => TOOLS_BY_SLUG[s]).filter(Boolean)
  const filtering = query.trim().length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Filter tools"
            aria-label="Filter tools"
            className="h-8 w-full rounded-md border bg-background pr-7 pl-8 text-[13px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 dark:bg-input/20"
          />
          {filtering && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Tools" className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {!filtering && (
          <Link
            href="/"
            onClick={onNavigate}
            aria-current={slug === "" ? "page" : undefined}
            className={cn(
              "mb-1 flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              slug === "" && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            )}
          >
            <LayoutGrid className={cn("size-4 text-muted-foreground", slug === "" && "text-primary")} />
            All tools
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">{TOOLS.length}</span>
          </Link>
        )}

        {!filtering && favoriteTools.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <Star className="size-3 fill-current" /> Favorites
            </h3>
            {favoriteTools.map((t) => (
              <NavLink key={t.slug} tool={t} active={slug === t.slug} onNavigate={onNavigate} />
            ))}
          </div>
        )}

        {CATEGORIES.map((c) => {
          const tools = TOOLS.filter((t) => t.category === c.id && matchTool(t, query))
          if (tools.length === 0) return null
          return (
            <div key={c.id} className="mt-4">
              <h3 className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {c.name}
              </h3>
              {tools.map((t) => (
                <NavLink key={t.slug} tool={t} active={slug === t.slug} onNavigate={onNavigate} />
              ))}
            </div>
          )
        })}

        {filtering && !TOOLS.some((t) => matchTool(t, query)) && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">No tools match “{query}”.</p>
        )}
      </nav>

      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Runs in your browser. By{" "}
        <a href="https://khanamir.me" target="_blank" rel="noopener" className="font-medium text-foreground/80 hover:text-primary">
          Mohd Amir Khan
        </a>
        <span className="mx-1.5">·</span>
        <a href="https://tool.khanamir.me" className="font-medium text-foreground/80 hover:text-primary">
          More tools
        </a>
      </div>
    </div>
  )
}

function SearchButton() {
  const { open } = useCommandMenu()
  return (
    <>
      <button
        type="button"
        onClick={open}
        className="hidden h-8 w-64 items-center gap-2 rounded-md border bg-background px-2.5 text-[13px] text-muted-foreground shadow-xs transition-colors hover:border-ring/40 hover:text-foreground md:flex dark:bg-input/20"
      >
        <Search className="size-3.5" />
        Search tools…
        <Kbd className="ml-auto border bg-muted/60">⌘K</Kbd>
      </button>
      <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={open} aria-label="Search tools">
        <Search />
      </Button>
    </>
  )
}

function Header({ onMenu }: { onMenu: () => void }) {
  const slug = currentSlug(usePathname())
  const tool = TOOLS_BY_SLUG[slug]

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <Button variant="ghost" size="icon-sm" className="-ml-1.5 lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu />
      </Button>
      <Link href="/" className="lg:hidden" aria-label="DevTools home">
        <Brand />
      </Link>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Tools
        </Link>
        {tool && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="text-muted-foreground">{categoryName(tool.category)}</span>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="truncate font-medium">{tool.name}</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <SearchButton />
        <ThemeToggle />
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <CommandMenuProvider>
      <a
        href="#content"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <Link href="/" className="flex h-14 shrink-0 items-center px-5" aria-label="DevTools home">
          <Brand />
        </Link>
        <SidebarNav />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 sm:max-w-72">
          <SheetTitle className="sr-only">Tools</SheetTitle>
          <SheetDescription className="sr-only">Choose a tool</SheetDescription>
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex h-14 shrink-0 items-center px-5">
            <Brand />
          </Link>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-dvh min-w-0 flex-col lg:pl-64">
        <Header onMenu={() => setMenuOpen(true)} />
        <main id="content" className="flex-1">
          {children}
        </main>
      </div>
    </CommandMenuProvider>
  )
}
