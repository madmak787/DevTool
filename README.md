# DevTools

45 developer tools in one place by [Mohd Amir Khan](https://khanamir.me). Everything runs in the browser: there is no backend, and pasted text, files and images never leave the page.

Live: **https://tool.khanamir.me/devtools**

## Tools

Categories and the tools inside them are ordered by popularity (`POPULARITY` in `lib/tools.ts`); the home page also shows the top 8.

- **Code & Data:** JSON Formatter (errors with line and column), Diff Checker (word-level, split or unified), Regex Tester, JWT Decoder (with HMAC verification), Minify & Beautify (terser, csso, js-beautify), SQL Formatter, Markdown Preview, Data Converter (JSON/YAML/CSV → YAML, CSV, XML, TypeScript, PHP, SQL), XML Formatter, String Escaper
- **Images & Design:** QR Code (text, Wi-Fi, email, phone; PNG/SVG), Image Converter (batch, resize, quality), Color Converter (HEX/RGB/HSL/OKLCH, contrast, shades), Barcode (Code 128, EAN, UPC, Data Matrix…), Favicon Generator (.ico + PNGs + manifest as a zip), Gradient, Box Shadow, CSS Unit Converter, Aspect Ratio
- **Security:** Password Generator (Web Crypto, passphrases, strength), UUID v4/v7, Hash Generator (MD5, SHA-1/256/384/512, HMAC, files), Bcrypt
- **Encoding:** Base64 (Unicode, URL-safe, files), URL Encoder (with URL breakdown), HTML Entities, Number Base (BigInt), Text to Binary
- **Text:** Word Counter, Case Converter, Lorem Ipsum, Remove Duplicate Lines, Find & Replace, Text Sorter, Slug Generator, Text Reverser
- **Time & Math:** Percentage, Unit Converter, Age, Timestamp (any time zone), Date Calculator (business days)
- **Web & DevOps:** Cron Expression Parser, HTTP Status Codes, Subnet (CIDR) Calculator, Chmod Calculator

App features: search with ⌘K or `/`, favorites and recently used tools (saved in local storage), light/dark/system theme, and a mobile layout.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Locally the app runs at `/`; the `/devtools` base path is only applied in CI.

Production build (static export to `out/`):

```bash
NEXT_PUBLIC_APP_URL=https://tool.khanamir.me/devtools npm run build
```

`postbuild` writes `out/.htaccess` (404 page, caching, compression) for Hostinger.

## Code map

- `lib/tools.ts`: the tool registry (names, descriptions, icons, keywords, categories) and the popularity order. Adding a tool means adding an entry here and a component in `components/tools/`, registered in `components/tools/index.tsx`.
- `app/[slug]/page.tsx`: one statically generated page per tool, with its own metadata. Each tool is its own code-split chunk, so heavy libraries only load on their page.
- `components/app-shell.tsx`, `command-menu.tsx`, `home-view.tsx`, `tool-frame.tsx`: layout, search, home page and the tool header.
- `components/tool-kit.tsx`: shared panels, editors, copy/download buttons and controls used by every tool.
- `lib/convert.ts`, `lib/color.ts`, `lib/dates.ts`, `lib/text.ts`: conversion, color, calendar and text helpers.

## Deploy

GitHub Actions on `main` / `master` / `production` builds the static site with `NEXT_PUBLIC_APP_URL=https://tool.khanamir.me/devtools` and uploads `out/` over FTPS to `/public_html/tool/devtools/` (served as https://tool.khanamir.me/devtools). The `FTP_SERVER`, `FTP_USERNAME` and `FTP_PASSWORD` repository secrets come from `~/.config/deploy/hostinger-ftp.env`:

```bash
gh secret set -f ~/.config/deploy/hostinger-ftp.env -R madmak787/DevTool
```

You can also run the workflow by hand from the Actions tab (**Build & Deploy DevTools**).

`public/module_info.json` and `public/thumbnail.png` describe the tool for the catalog on tool.khanamir.me.
