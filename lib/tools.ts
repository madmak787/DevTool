import type { LucideIcon } from "lucide-react"
import {
  Cake,
  ArrowDownAZ,
  Barcode,
  Binary,
  Braces,
  CalendarDays,
  CaseSensitive,
  Clock,
  Code,
  Eraser,
  FileCode,
  FileJson,
  Fingerprint,
  GitCompare,
  Hash,
  ImageIcon,
  KeyRound,
  Link2,
  Lock,
  Palette,
  Percent,
  PilcrowRight,
  QrCode,
  Regex,
  Repeat,
  Ruler,
  ScanText,
  Shapes,
  TextSearch,
  Undo2,
  Database,
  FileCode2,
  FileText,
  Quote,
  Link,
  Binary as BinaryIcon,
  ShieldCheck,
  Timer,
  FolderLock,
  Network,
  ServerCrash,
  SquareDashed,
  AppWindow,
  Scaling,
  RectangleHorizontal,
} from "lucide-react"

export type CategoryId = "text" | "code" | "encode" | "security" | "web" | "design" | "calc"

const CATEGORY_LIST: { id: CategoryId; name: string }[] = [
  { id: "code", name: "Code & Data" },
  { id: "text", name: "Text" },
  { id: "encode", name: "Encoding" },
  { id: "security", name: "Security" },
  { id: "web", name: "Web & DevOps" },
  { id: "design", name: "Images & Design" },
  { id: "calc", name: "Time & Math" },
]

export type Tool = {
  slug: string
  name: string
  /** Short line for cards and the command palette */
  summary: string
  /** One or two sentences shown under the tool title and used for SEO */
  description: string
  category: CategoryId
  icon: LucideIcon
  keywords: string[]
}

const TOOL_LIST: Tool[] = [
  // Code & Data
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    summary: "Format, validate and minify JSON",
    description: "Pretty-print, validate, minify and sort JSON. Errors point to the exact line and column.",
    category: "code",
    icon: FileJson,
    keywords: ["json", "pretty", "validate", "lint", "beautify", "minify", "sort keys"],
  },
  {
    slug: "minify",
    name: "Minify & Beautify",
    summary: "Compress or format JS, CSS and HTML",
    description: "Minify or beautify JavaScript, CSS, HTML and JSON with real parsers, and see the size saved.",
    category: "code",
    icon: Code,
    keywords: ["minify", "beautify", "uglify", "terser", "css", "javascript", "html", "prettify", "compress"],
  },
  {
    slug: "text-converter",
    name: "Data Converter",
    summary: "JSON ↔ YAML, CSV, XML, PHP, SQL",
    description: "Convert JSON, YAML or CSV into JSON, YAML, CSV, XML, PHP arrays, print_r, var_dump or SQL INSERT statements.",
    category: "code",
    icon: Repeat,
    keywords: ["convert", "yaml", "csv", "xml", "php", "print_r", "var_dump", "sql", "insert", "json to csv"],
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    summary: "Compare two texts line by line",
    description: "Compare two versions of a text or file. Changed lines are highlighted down to the word, side by side or unified.",
    category: "code",
    icon: GitCompare,
    keywords: ["diff", "compare", "difference", "changes", "merge"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    summary: "Test regular expressions live",
    description: "Write a JavaScript regular expression and see every match and capture group highlighted as you type.",
    category: "code",
    icon: Regex,
    keywords: ["regex", "regexp", "regular expression", "match", "pattern", "capture group"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    summary: "Inspect JSON Web Tokens",
    description: "Decode a JWT's header and payload, with issued and expiry times shown as readable dates. Nothing leaves your browser.",
    category: "code",
    icon: KeyRound,
    keywords: ["jwt", "token", "json web token", "decode", "bearer", "oauth", "claims"],
  },

  // Text
  {
    slug: "word-counter",
    name: "Word Counter",
    summary: "Count words, characters and more",
    description: "Count words, characters, sentences, paragraphs and lines, with reading time and the most frequent words.",
    category: "text",
    icon: ScanText,
    keywords: ["word count", "character count", "letters", "reading time"],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    summary: "camelCase, snake_case, Title Case…",
    description: "Convert text to UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.",
    category: "text",
    icon: CaseSensitive,
    keywords: ["case", "uppercase", "lowercase", "camelcase", "snake_case", "kebab", "title case", "pascal"],
  },
  {
    slug: "find-replace",
    name: "Find & Replace",
    summary: "Replace text with plain text or regex",
    description: "Find and replace in text, with case sensitivity, whole words, regular expressions and $1 group references.",
    category: "text",
    icon: TextSearch,
    keywords: ["find", "replace", "search", "substitute", "regex"],
  },
  {
    slug: "text-sorter",
    name: "Text Sorter",
    summary: "Sort lines A–Z, numerically or by length",
    description: "Sort lines alphabetically, naturally (so 2 comes before 10), by length, or shuffle them.",
    category: "text",
    icon: ArrowDownAZ,
    keywords: ["sort", "lines", "alphabetical", "order", "shuffle", "natural sort"],
  },
  {
    slug: "remove-duplicates",
    name: "Remove Duplicate Lines",
    summary: "Keep only unique lines",
    description: "Remove repeated lines while keeping the original order, optionally ignoring case and surrounding spaces.",
    category: "text",
    icon: Eraser,
    keywords: ["duplicate", "unique", "dedupe", "distinct", "lines"],
  },
  {
    slug: "text-reverser",
    name: "Text Reverser",
    summary: "Reverse characters, words or lines",
    description: "Reverse text by character, word or line. Emoji and accented letters stay intact.",
    category: "text",
    icon: Undo2,
    keywords: ["reverse", "backwards", "mirror", "flip"],
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum",
    summary: "Generate placeholder text",
    description: "Generate lorem ipsum paragraphs, sentences, words or list items, as plain text or HTML.",
    category: "text",
    icon: PilcrowRight,
    keywords: ["lorem", "ipsum", "placeholder", "dummy text", "filler"],
  },

  // Encoding
  {
    slug: "base64",
    name: "Base64",
    summary: "Encode and decode Base64",
    description: "Encode text or files to Base64 and decode it back. Handles Unicode, URL-safe Base64 and data URIs.",
    category: "encode",
    icon: Binary,
    keywords: ["base64", "encode", "decode", "btoa", "atob", "data uri", "url safe"],
  },
  {
    slug: "url-encoder",
    name: "URL Encoder",
    summary: "Encode, decode and parse URLs",
    description: "Percent-encode or decode URL components, and break a URL into its parts and query parameters.",
    category: "encode",
    icon: Link2,
    keywords: ["url", "encode", "decode", "percent", "uri", "query string", "parameters"],
  },
  {
    slug: "html-encoder",
    name: "HTML Entities",
    summary: "Escape and unescape HTML",
    description: "Escape special characters as HTML entities, or turn named and numeric entities back into text.",
    category: "encode",
    icon: FileCode,
    keywords: ["html", "entities", "escape", "unescape", "encode", "decode", "&amp;"],
  },
  {
    slug: "number-base",
    name: "Number Base Converter",
    summary: "Binary, octal, decimal, hex",
    description: "Convert whole numbers of any size between binary, octal, decimal, hexadecimal and any base from 2 to 36.",
    category: "encode",
    icon: Braces,
    keywords: ["binary", "hex", "hexadecimal", "octal", "decimal", "radix", "base"],
  },

  // Security
  {
    slug: "hash",
    name: "Hash Generator",
    summary: "MD5, SHA-1, SHA-256, SHA-512",
    description: "Hash text or files with MD5, SHA-1, SHA-256, SHA-384 and SHA-512, with optional HMAC and hash comparison.",
    category: "security",
    icon: Hash,
    keywords: ["hash", "md5", "sha", "sha1", "sha256", "sha512", "checksum", "hmac"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    summary: "Strong random passwords",
    description: "Generate strong passwords with your browser's secure random generator, and see how strong each one is.",
    category: "security",
    icon: Lock,
    keywords: ["password", "generator", "random", "secure", "passphrase"],
  },
  {
    slug: "uuid",
    name: "UUID Generator",
    summary: "Random v4 and time-ordered v7 UUIDs",
    description: "Generate v4 (random) or v7 (time-ordered) UUIDs in bulk, and check whether a UUID is valid.",
    category: "security",
    icon: Fingerprint,
    keywords: ["uuid", "guid", "v4", "v7", "unique id"],
  },

  // Images & Design
  {
    slug: "color-picker",
    name: "Color Converter",
    summary: "HEX, RGB, HSL, OKLCH and contrast",
    description: "Pick or paste a color and convert it between HEX, RGB, HSL and OKLCH, with tints, shades and a WCAG contrast check.",
    category: "design",
    icon: Palette,
    keywords: ["color", "colour", "hex", "rgb", "hsl", "oklch", "contrast", "wcag", "picker"],
  },
  {
    slug: "gradient",
    name: "Gradient Generator",
    summary: "Build CSS gradients visually",
    description: "Build linear, radial and conic CSS gradients with several color stops, then copy the CSS.",
    category: "design",
    icon: Shapes,
    keywords: ["gradient", "css", "linear-gradient", "radial", "conic", "background"],
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    summary: "Convert and resize PNG, JPEG, WebP",
    description: "Convert images between PNG, JPEG and WebP, resize them and set the quality. Images never leave your device.",
    category: "design",
    icon: ImageIcon,
    keywords: ["image", "convert", "png", "jpg", "jpeg", "webp", "resize", "compress"],
  },
  {
    slug: "qr-code",
    name: "QR Code Generator",
    summary: "QR codes for links, text and Wi-Fi",
    description: "Create QR codes for links, text, Wi-Fi networks or email, with custom colors, and download them as PNG or SVG.",
    category: "design",
    icon: QrCode,
    keywords: ["qr", "qr code", "wifi", "generator", "scan"],
  },
  {
    slug: "barcode",
    name: "Barcode Generator",
    summary: "Code 128, EAN-13, UPC and more",
    description: "Generate Code 128, Code 39, EAN, UPC, ITF-14 and Data Matrix barcodes, and download them as PNG or SVG.",
    category: "design",
    icon: Barcode,
    keywords: ["barcode", "ean", "upc", "code128", "code39", "itf", "datamatrix"],
  },

  // Time & Math
  {
    slug: "timestamp",
    name: "Timestamp Converter",
    summary: "Unix time ↔ human dates",
    description: "Convert Unix timestamps in seconds or milliseconds to dates in your time zone and UTC, and back.",
    category: "calc",
    icon: Clock,
    keywords: ["unix", "timestamp", "epoch", "date", "time", "utc", "iso 8601"],
  },
  {
    slug: "date-calculator",
    name: "Date Calculator",
    summary: "Days between dates, add or subtract",
    description: "Count the exact time between two dates, including business days, or add and subtract days, weeks, months and years.",
    category: "calc",
    icon: CalendarDays,
    keywords: ["date", "difference", "days between", "add days", "business days", "calendar"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    summary: "Exact age and next birthday",
    description: "Work out an exact age in years, months and days, the total time lived and the days to the next birthday.",
    category: "calc",
    icon: Cake,
    keywords: ["age", "birthday", "born", "how old"],
  },
  {
    slug: "percentage",
    name: "Percentage Calculator",
    summary: "Percent of, change and ratio",
    description: "Work out what percent one number is of another, a percentage of a value, and the percentage change between two values.",
    category: "calc",
    icon: Percent,
    keywords: ["percent", "percentage", "change", "increase", "decrease", "ratio"],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    summary: "Length, weight, data, speed…",
    description: "Convert length, weight, temperature, volume, area, speed, time and digital storage units.",
    category: "calc",
    icon: Ruler,
    keywords: ["unit", "convert", "length", "weight", "temperature", "metric", "imperial", "bytes"],
  },
  // Added in v2.1
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    summary: "Beautify SQL for any dialect",
    description: "Format SQL queries for MySQL, PostgreSQL, SQLite, SQL Server, BigQuery and more, with keyword casing and indentation options.",
    category: "code",
    icon: Database,
    keywords: ["sql", "format", "beautify", "query", "mysql", "postgres", "pretty print"],
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    summary: "Format, validate and minify XML",
    description: "Pretty-print or minify XML and check that it is well-formed, with the error's line shown.",
    category: "code",
    icon: FileCode2,
    keywords: ["xml", "format", "beautify", "validate", "minify", "svg", "rss"],
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    summary: "Live Markdown to HTML",
    description: "Write GitHub-flavored Markdown and see it rendered live, then copy the HTML.",
    category: "code",
    icon: FileText,
    keywords: ["markdown", "md", "preview", "html", "readme", "gfm"],
  },
  {
    slug: "string-escaper",
    name: "String Escaper",
    summary: "Escape for JSON, JS, SQL, regex, CSV",
    description: "Escape or unescape text for JSON strings, JavaScript, SQL, regular expressions, CSV fields and shell arguments.",
    category: "code",
    icon: Quote,
    keywords: ["escape", "unescape", "string", "json string", "quotes", "backslash", "stringify"],
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    summary: "Turn titles into URL slugs",
    description: "Turn titles into clean URL slugs, with accents removed, stop words optional and a length limit.",
    category: "text",
    icon: Link,
    keywords: ["slug", "slugify", "url", "permalink", "seo"],
  },
  {
    slug: "text-binary",
    name: "Text to Binary",
    summary: "Text ↔ binary, hex, decimal, code points",
    description: "Convert text to binary, hexadecimal, octal, decimal bytes or Unicode code points, and back again.",
    category: "encode",
    icon: BinaryIcon,
    keywords: ["binary", "text to binary", "hex", "ascii", "unicode", "code point", "utf-8", "bytes"],
  },
  {
    slug: "bcrypt",
    name: "Bcrypt Generator",
    summary: "Hash and verify bcrypt passwords",
    description: "Hash a password with bcrypt at any cost factor, or check a password against an existing bcrypt hash.",
    category: "security",
    icon: ShieldCheck,
    keywords: ["bcrypt", "password hash", "verify", "salt", "rounds", "$2b$"],
  },
  {
    slug: "cron-parser",
    name: "Cron Expression Parser",
    summary: "Explain cron schedules in plain English",
    description: "Describe a cron expression in plain English and list its next run times, with presets for common schedules.",
    category: "web",
    icon: Timer,
    keywords: ["cron", "crontab", "schedule", "job", "expression", "every minute"],
  },
  {
    slug: "chmod-calculator",
    name: "Chmod Calculator",
    summary: "Unix permissions: 755 ↔ rwxr-xr-x",
    description: "Work out Unix file permissions with checkboxes, and convert between octal (755) and symbolic (rwxr-xr-x) notation.",
    category: "web",
    icon: FolderLock,
    keywords: ["chmod", "permissions", "unix", "linux", "755", "644", "rwx", "octal"],
  },
  {
    slug: "cidr-calculator",
    name: "Subnet Calculator",
    summary: "IPv4 CIDR ranges and netmasks",
    description: "Calculate an IPv4 subnet's network, broadcast, netmask, usable host range and host count from CIDR notation.",
    category: "web",
    icon: Network,
    keywords: ["cidr", "subnet", "ip", "ipv4", "netmask", "network", "calculator", "range"],
  },
  {
    slug: "http-status",
    name: "HTTP Status Codes",
    summary: "What every status code means",
    description: "Search every HTTP status code with a plain-English explanation of when to use it.",
    category: "web",
    icon: ServerCrash,
    keywords: ["http", "status", "code", "404", "500", "301", "response", "rest api"],
  },
  {
    slug: "box-shadow",
    name: "Box Shadow Generator",
    summary: "Layered CSS box shadows",
    description: "Design layered CSS box shadows visually, including inset shadows, and copy the CSS or Tailwind class.",
    category: "design",
    icon: SquareDashed,
    keywords: ["box shadow", "css", "shadow", "elevation", "drop shadow"],
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    summary: "All favicon sizes from one image",
    description: "Create favicon.ico, Apple touch and Android icons from one image, text or emoji, with the HTML tags to use them.",
    category: "design",
    icon: AppWindow,
    keywords: ["favicon", "icon", "ico", "apple touch icon", "pwa", "manifest"],
  },
  {
    slug: "css-units",
    name: "CSS Unit Converter",
    summary: "px ↔ rem, em, pt, vw, %",
    description: "Convert between px, rem, em, pt, vw, vh and percent using your own root font size and viewport.",
    category: "design",
    icon: Scaling,
    keywords: ["px to rem", "rem", "em", "css units", "vw", "pt", "pixels"],
  },
  {
    slug: "aspect-ratio",
    name: "Aspect Ratio Calculator",
    summary: "Resize while keeping proportions",
    description: "Find the aspect ratio of any size, or work out a missing width or height while keeping the proportions.",
    category: "design",
    icon: RectangleHorizontal,
    keywords: ["aspect ratio", "16:9", "resize", "dimensions", "width height", "ratio"],
  },
]

/**
 * Most-used first, roughly by how often people search for each tool.
 * Drives the order of tools in every list, the order of categories and the "Most popular" row.
 */
const POPULARITY = [
  "json-formatter",
  "qr-code",
  "password-generator",
  "base64",
  "word-counter",
  "image-converter",
  "diff-checker",
  "percentage",
  "unit-converter",
  "color-picker",
  "age-calculator",
  "uuid",
  "regex-tester",
  "case-converter",
  "url-encoder",
  "timestamp",
  "jwt-decoder",
  "hash",
  "lorem-ipsum",
  "minify",
  "sql-formatter",
  "markdown-preview",
  "date-calculator",
  "barcode",
  "favicon-generator",
  "cron-parser",
  "text-converter",
  "gradient",
  "box-shadow",
  "css-units",
  "aspect-ratio",
  "http-status",
  "cidr-calculator",
  "bcrypt",
  "chmod-calculator",
  "xml-formatter",
  "html-encoder",
  "number-base",
  "remove-duplicates",
  "find-replace",
  "text-sorter",
  "slug-generator",
  "text-binary",
  "string-escaper",
  "text-reverser",
]

const rank = (slug: string) => {
  const i = POPULARITY.indexOf(slug)
  return i === -1 ? POPULARITY.length : i
}

export const TOOLS: Tool[] = [...TOOL_LIST].sort((a, b) => rank(a.slug) - rank(b.slug))

/** Categories ordered by their most popular tool */
export const CATEGORIES = [...CATEGORY_LIST].sort(
  (a, b) => Math.min(...TOOLS.filter((t) => t.category === a.id).map((t) => rank(t.slug))) - Math.min(...TOOLS.filter((t) => t.category === b.id).map((t) => rank(t.slug))),
)

export const POPULAR_TOOLS = TOOLS.slice(0, 8)

export const TOOLS_BY_SLUG: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]))

export function toolsInCategory(id: CategoryId) {
  return TOOLS.filter((t) => t.category === id)
}

export function categoryName(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? ""
}

/** Case-insensitive match on name, summary and keywords; every word of the query must match */
export function matchTool(tool: Tool, query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = [tool.name, tool.summary, ...tool.keywords].join(" ").toLowerCase()
  return words.every((w) => haystack.includes(w))
}
