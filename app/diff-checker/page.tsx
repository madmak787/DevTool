import { DiffChecker } from "@/components/diff-checker"

export default function DiffCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Diff Checker</h1>
        <p className="text-muted-foreground">Compare text to find differences between two files</p>
      </div>
      <DiffChecker />
    </div>
  )
}
