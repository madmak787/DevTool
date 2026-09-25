import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AppShell } from "@/components/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TOOLS } from "@/lib/tools"
import { asset } from "@/lib/utils"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tool.khanamir.me/devtools"
const TITLE = "DevTools — Free Online Developer Tools"
const DESCRIPTION =
  `${TOOLS.length} fast, private developer tools in one place: JSON formatter, diff checker, regex tester, Base64, hashes, JWT decoder, QR codes, color converter and more. Everything runs in your browser.`

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL.endsWith("/") ? APP_URL : `${APP_URL}/`),
  title: { default: TITLE, template: "%s · DevTools" },
  description: DESCRIPTION,
  applicationName: "DevTools",
  authors: [{ name: "Mohd Amir Khan", url: "https://khanamir.me" }],
  keywords: ["developer tools", "json formatter", "diff checker", "regex tester", "base64", "hash generator", "online tools"],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "DevTools",
    url: "./",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: asset("/thumbnail.png"), width: 1200, height: 630, alt: "DevTools" }],
  },
  twitter: { card: "summary_large_image", images: [asset("/thumbnail.png")] },
  icons: {
    icon: [{ url: asset("/icon.svg"), type: "image/svg+xml" }],
    apple: asset("/apple-icon.png"),
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#16171d" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" closeButton={false} duration={1800} />
        </ThemeProvider>
      </body>
    </html>
  )
}
