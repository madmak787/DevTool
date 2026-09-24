import { ToolsGrid } from "@/components/tools-grid"

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 text-balance">Free Online Tools</h1>
        <p className="text-muted-foreground text-lg">All-in-one toolkit for developers and content creators</p>
      </div>
      <ToolsGrid />
    </div>
  )
}
