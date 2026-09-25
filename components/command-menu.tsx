"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { House, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CATEGORIES, TOOLS_BY_SLUG, toolsInCategory, type Tool } from "@/lib/tools"
import { useFavorites } from "@/hooks/use-local-storage"

const CommandMenuContext = React.createContext<{ open: () => void }>({ open: () => {} })
export const useCommandMenu = () => React.useContext(CommandMenuContext)

/** True when focus is in a field where "/" should type a character */
function isTyping(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()
  const { favorites } = useFavorites()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === "/" && !isTyping(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  const item = (tool: Tool, prefix = "") => {
    const Icon = tool.icon
    return (
      <CommandItem
        key={prefix + tool.slug}
        value={`${prefix}${tool.name} ${tool.keywords.join(" ")}`}
        onSelect={() => run(() => router.push(`/${tool.slug}/`))}
      >
        <Icon className="text-muted-foreground" />
        <span>{tool.name}</span>
        <span className="ml-auto truncate pl-4 text-xs text-muted-foreground">{tool.summary}</span>
      </CommandItem>
    )
  }

  const favoriteTools = favorites.map((s) => TOOLS_BY_SLUG[s]).filter(Boolean)

  return (
    <CommandMenuContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search tools"
        description="Jump to any tool or change the theme"
        className="top-[20%] translate-y-0 sm:max-w-xl"
      >
        <CommandInput placeholder="Search tools…" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>No tools found.</CommandEmpty>
          {favoriteTools.length > 0 && (
            <CommandGroup heading="Favorites">{favoriteTools.map((t) => item(t, "fav:"))}</CommandGroup>
          )}
          {CATEGORIES.map((c) => (
            <CommandGroup key={c.id} heading={c.name}>
              {toolsInCategory(c.id).map((t) => item(t))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="General">
            <CommandItem value="home all tools" onSelect={() => run(() => router.push("/"))}>
              <House className="text-muted-foreground" /> All tools
            </CommandItem>
            <CommandItem value="theme light" onSelect={() => run(() => setTheme("light"))}>
              <Sun className="text-muted-foreground" /> Light theme
            </CommandItem>
            <CommandItem value="theme dark" onSelect={() => run(() => setTheme("dark"))}>
              <Moon className="text-muted-foreground" /> Dark theme
            </CommandItem>
            <CommandItem value="theme system" onSelect={() => run(() => setTheme("system"))}>
              <Monitor className="text-muted-foreground" /> System theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandMenuContext.Provider>
  )
}

