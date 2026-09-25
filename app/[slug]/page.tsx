import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolFrame } from "@/components/tool-frame"
import { ToolRenderer } from "@/components/tools"
import { TOOLS, TOOLS_BY_SLUG } from "@/lib/tools"

export const dynamicParams = false

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tool = TOOLS_BY_SLUG[(await params).slug]
  if (!tool) return {}
  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `./${tool.slug}/` },
    openGraph: { title: `${tool.name} · DevTools`, description: tool.description, url: `./${tool.slug}/` },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!TOOLS_BY_SLUG[slug]) notFound()
  return (
    <ToolFrame slug={slug}>
      <ToolRenderer slug={slug} />
    </ToolFrame>
  )
}
