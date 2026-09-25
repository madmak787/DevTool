"use client"

import { useCallback, useEffect, useState } from "react"

const EVENT = "devtools:storage"

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/**
 * State persisted to localStorage and shared by every component using the same key.
 * Starts from `fallback` on the server and the first client render, so hydration always matches.
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback)

  useEffect(() => {
    setValue(read(key, fallback))
    const sync = (e: Event) => {
      const k = e instanceof StorageEvent ? e.key : (e as CustomEvent<string>).detail
      if (k === key) setValue(read(key, fallback))
    }
    window.addEventListener("storage", sync)
    window.addEventListener(EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(EVENT, sync)
    }
    // fallback is intentionally not a dependency: callers pass literals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(v))
        } catch {
          // Storage full or disabled: keep the in-memory value
        }
        queueMicrotask(() => window.dispatchEvent(new CustomEvent(EVENT, { detail: key })))
        return v
      })
    },
    [key],
  )

  return [value, update] as const
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("devtools:favorites", [])
  const toggle = useCallback(
    (slug: string) =>
      setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])),
    [setFavorites],
  )
  return { favorites, toggle, isFavorite: (slug: string) => favorites.includes(slug) }
}

export function useRecent() {
  const [recent, setRecent] = useLocalStorage<string[]>("devtools:recent", [])
  const push = useCallback(
    (slug: string) => setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 6)),
    [setRecent],
  )
  return { recent, push }
}
