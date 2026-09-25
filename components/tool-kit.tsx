"use client"

import * as React from "react"
import { Check, Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { downloadText } from "@/lib/download"

/* ---------- Clipboard ---------- */

export async function copyText(text: string, what = "Copied to clipboard") {
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard API is blocked in some embedded or insecure contexts; fall back to a hidden textarea
    const el = document.createElement("textarea")
    el.value = text
    el.setAttribute("readonly", "")
    el.style.position = "fixed"
    el.style.opacity = "0"
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand("copy")
    el.remove()
    if (!ok) {
      toast.error("Couldn't copy. Select the text and press Ctrl+C.")
      return false
    }
  }
  toast.success(what)
  return true
}

export function CopyButton({
  value,
  label = "Copy",
  toastText,
  iconOnly = false,
  size = "sm",
  variant = "outline",
  className,
}: {
  value: string
  label?: string
  toastText?: string
  iconOnly?: boolean
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}) {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1500)
    return () => clearTimeout(t)
  }, [done])

  return (
    <Button
      type="button"
      size={iconOnly ? (size === "sm" ? "icon-sm" : "icon") : size}
      variant={variant}
      disabled={!value}
      className={className}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      onClick={async () => {
        if (await copyText(value, toastText)) setDone(true)
      }}
    >
      {done ? <Check className="text-success" /> : <Copy />}
      {!iconOnly && label}
    </Button>
  )
}

export function DownloadButton({
  content,
  filename,
  mime = "text/plain",
  label = "Download",
  iconOnly = false,
}: {
  content: string
  filename: string
  mime?: string
  label?: string
  iconOnly?: boolean
}) {
  return (
    <Button
      type="button"
      size={iconOnly ? "icon-sm" : "sm"}
      variant="outline"
      disabled={!content}
      aria-label={iconOnly ? `${label} ${filename}` : undefined}
      title={iconOnly ? `${label} ${filename}` : undefined}
      onClick={() => downloadText(content, filename, mime)}
    >
      <Download />
      {!iconOnly && label}
    </Button>
  )
}

/* ---------- Layout ---------- */

export function Panel({
  title,
  description,
  actions,
  footer,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-xl border bg-card shadow-xs", className)}>
      {(title || actions) && (
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-2">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs text-muted-foreground">
          {footer}
        </footer>
      )}
    </section>
  )
}

/** A monospace editor-style textarea that fills its panel */
export const CodeArea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { mono?: boolean; invalid?: boolean }
>(function CodeArea({ className, mono = true, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      aria-invalid={invalid || undefined}
      className={cn(
        "scroll-thin block min-h-56 w-full resize-y rounded-md border bg-background px-3 py-2.5 text-[13px] leading-relaxed outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 read-only:bg-muted/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/20 dark:read-only:bg-muted/30",
        mono && "font-mono",
        className,
      )}
      {...props}
    />
  )
})

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: React.ReactNode
  htmlFor?: string
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function OptionSwitch({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: React.ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "default",
  className,
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: readonly { value: T; label: React.ReactNode; title?: string }[]
  size?: "sm" | "default"
  className?: string
  ariaLabel?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex max-w-full flex-wrap gap-0.5 rounded-lg bg-muted p-0.5", className)}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md px-3 font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
              size === "sm" ? "h-7 text-xs" : "h-8 text-sm",
              active && "bg-background text-foreground shadow-sm dark:bg-card",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  className,
  emphasis,
}: {
  label: React.ReactNode
  value: React.ReactNode
  sub?: React.ReactNode
  className?: string
  emphasis?: boolean
}) {
  return (
    <div className={cn("min-w-0 rounded-lg border bg-card px-4 py-3", emphasis && "border-primary/30 bg-primary/5", className)}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 truncate font-semibold tabular-nums tracking-tight",
          emphasis ? "text-2xl text-primary" : "text-xl",
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

/** A read-only value row with a copy button, used for conversions and results */
export function ValueRow({
  label,
  value,
  mono = true,
  placeholder = "—",
}: {
  label: React.ReactNode
  value: string
  mono?: boolean
  placeholder?: string
}) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-3 border-b py-2 last:border-b-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={cn("min-w-0 truncate text-sm", mono && "font-mono", !value && "text-muted-foreground")} title={value}>
        {value || placeholder}
      </div>
      <CopyButton value={value} iconOnly variant="ghost" label={`Copy ${typeof label === "string" ? label : "value"}`} />
    </div>
  )
}

export function Message({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "success" | "info" | "warning"
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error" && "border-destructive/30 bg-destructive/8 text-destructive",
        tone === "success" && "border-success/30 bg-success/8 text-success",
        tone === "warning" && "border-warning/40 bg-warning/10 text-foreground",
        tone === "info" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function formatBytes(n: number) {
  if (!Number.isFinite(n)) return "—"
  if (n < 1024) return `${n} B`
  const units = ["KB", "MB", "GB"]
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v < 10 ? v.toFixed(2) : v.toFixed(1)} ${units[i]}`
}

/** UTF-8 byte length of a string */
export function byteLength(s: string) {
  return new TextEncoder().encode(s).length
}

/** Height for side-by-side editors: fills the viewport on desktop, a comfortable fixed height on phones */
export const EDITOR_HEIGHT = "h-[42vh] min-h-60 resize-none lg:h-[calc(100dvh-23rem)] lg:min-h-80"
