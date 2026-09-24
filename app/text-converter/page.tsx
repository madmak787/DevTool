import { TextConverter } from "@/components/text-converter"

export default function TextConverterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Text Converter</h1>
        <p className="text-muted-foreground">Convert text between JSON, Array, PHP formats and more</p>
      </div>
      <TextConverter />
    </div>
  )
}
