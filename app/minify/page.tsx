import { MinifyTools } from "@/components/minify-tools"

export default function MinifyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Minify & Beautify</h1>
        <p className="text-muted-foreground">Compress or format your CSS, JavaScript, HTML, and JSON</p>
      </div>
      <MinifyTools />
    </div>
  )
}
