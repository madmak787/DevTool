import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-6xl font-semibold tracking-tight text-primary">404</p>
      <div>
        <h1 className="text-lg font-semibold">This tool doesn’t exist</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">The page may have moved. Every tool is listed on the home page.</p>
      </div>
      <Link href="/" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Browse all tools
      </Link>
    </div>
  )
}
