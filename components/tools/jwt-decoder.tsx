"use client"

import * as React from "react"
import { Eraser, FileInput, ShieldCheck, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CodeArea, CopyButton, Message, Panel } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

// {"alg":"HS256","typ":"JWT"} . {"sub":"1234567890","name":"Ada Lovelace","admin":true,"iat":1735689600,"exp":4102444800} signed with "your-256-bit-secret"
const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6NDEwMjQ0NDgwMH0.PLACEHOLDER"

function b64urlToBytes(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")
  const bin = atob(b64)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

function bytesToB64url(bytes: ArrayBuffer) {
  let bin = ""
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodePart(part: string) {
  const text = new TextDecoder().decode(b64urlToBytes(part))
  return JSON.parse(text) as Record<string, unknown>
}

async function hmacSign(alg: string, secret: string, data: string) {
  const hash = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" }[alg]
  if (!hash) return null
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash }, false, ["sign"])
  return bytesToB64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)))
}

function relative(seconds: number) {
  const diff = seconds * 1000 - Date.now()
  const abs = Math.abs(diff)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 864e5],
    ["month", 30 * 864e5],
    ["day", 864e5],
    ["hour", 36e5],
    ["minute", 6e4],
    ["second", 1e3],
  ]
  const [unit, ms] = units.find(([, ms]) => abs >= ms) ?? ["second", 1e3]
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(diff / ms), unit)
}

const TIME_CLAIMS: Record<string, string> = { iat: "Issued at", nbf: "Not before", exp: "Expires" }
const CLAIM_NAMES: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  jti: "JWT ID",
  ...TIME_CLAIMS,
}

export default function JwtDecoder() {
  const [token, setToken] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [verified, setVerified] = React.useState<null | boolean>(null)
  const [sample, setSample] = React.useState("")

  // Build a correctly signed sample once, so "Verify" works on it with the documented secret
  React.useEffect(() => {
    const [h, p] = SAMPLE.split(".")
    hmacSign("HS256", "your-256-bit-secret", `${h}.${p}`).then((sig) => setSample(`${h}.${p}.${sig}`))
  }, [])

  const decoded = React.useMemo(() => {
    const t = token.trim().replace(/^Bearer\s+/i, "")
    if (!t) return null
    const parts = t.split(".")
    if (parts.length !== 3) return { error: `A JWT has 3 parts separated by dots; this has ${parts.length}.` }
    try {
      return { header: decodePart(parts[0]), payload: decodePart(parts[1]), parts, error: "" }
    } catch {
      return { error: "This doesn’t look like a JWT: the header or payload isn’t Base64URL-encoded JSON." }
    }
  }, [token])

  React.useEffect(() => setVerified(null), [token, secret])

  const alg = decoded && "header" in decoded ? String(decoded.header?.alg ?? "") : ""
  const payload = decoded && "payload" in decoded ? decoded.payload! : null
  const now = Date.now() / 1000
  const exp = typeof payload?.exp === "number" ? payload.exp : null
  const nbf = typeof payload?.nbf === "number" ? payload.nbf : null
  const status = !payload ? null : exp !== null && exp < now ? "expired" : nbf !== null && nbf > now ? "not-yet" : "active"

  const verify = async () => {
    if (!decoded || !("parts" in decoded) || !decoded.parts) return
    const [h, p, s] = decoded.parts
    const sig = await hmacSign(alg, secret, `${h}.${p}`)
    setVerified(sig === s)
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Encoded token"
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setToken(sample)} disabled={!sample}>
              <FileInput /> Sample
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setToken("")} disabled={!token}>
              <Eraser /> Clear
            </Button>
          </>
        }
      >
        <CodeArea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT (eyJhbGciOi…), with or without “Bearer ”"
          className="h-28 resize-y break-all"
          invalid={!!decoded?.error}
          aria-label="JWT"
        />
        {decoded && "parts" in decoded && decoded.parts && (
          <p className="mt-3 font-mono text-[13px] leading-relaxed break-all">
            <span className="text-rose-600 dark:text-rose-400">{decoded.parts[0]}</span>.
            <span className="text-violet-600 dark:text-violet-400">{decoded.parts[1]}</span>.
            <span className="text-sky-600 dark:text-sky-400">{decoded.parts[2]}</span>
          </p>
        )}
        {decoded?.error && <Message className="mt-3">{decoded.error}</Message>}
      </Panel>

      {payload && decoded && "header" in decoded && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {alg && <Badge variant="secondary" className="font-mono">{alg}</Badge>}
            {status === "expired" && <Badge variant="destructive">Expired {relative(exp!)}</Badge>}
            {status === "not-yet" && <Badge className="bg-warning text-black">Not valid until {relative(nbf!)}</Badge>}
            {status === "active" && (
              <Badge className="bg-success/15 text-success">{exp ? `Valid, expires ${relative(exp)}` : "No expiry"}</Badge>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title={<span className="text-rose-600 dark:text-rose-400">Header</span>} actions={<CopyButton value={JSON.stringify(decoded.header, null, 2)} iconOnly />}>
              <pre className="scroll-thin overflow-auto font-mono text-[13px] leading-relaxed">{JSON.stringify(decoded.header, null, 2)}</pre>
            </Panel>
            <Panel title={<span className="text-violet-600 dark:text-violet-400">Payload</span>} actions={<CopyButton value={JSON.stringify(payload, null, 2)} iconOnly />}>
              <pre className="scroll-thin max-h-96 overflow-auto font-mono text-[13px] leading-relaxed">{JSON.stringify(payload, null, 2)}</pre>
            </Panel>
          </div>

          <Panel title="Claims" bodyClassName="p-0">
            <table className="w-full text-left text-[13px]">
              <tbody>
                {Object.entries(payload).map(([k, v]) => (
                  <tr key={k} className="border-b last:border-b-0">
                    <td className="w-32 px-4 py-2 align-top font-mono text-primary">{k}</td>
                    <td className="w-32 py-2 align-top text-muted-foreground">{CLAIM_NAMES[k] ?? ""}</td>
                    <td className="px-4 py-2 break-all">
                      {TIME_CLAIMS[k] && typeof v === "number" ? (
                        <>
                          {new Date(v * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "long" })}
                          <span className="ml-2 text-muted-foreground">({relative(v)})</span>
                        </>
                      ) : (
                        <span className="font-mono">{typeof v === "string" ? v : JSON.stringify(v)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title={<span className="text-sky-600 dark:text-sky-400">Verify signature</span>}>
            {alg.startsWith("HS") ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Shared secret (the sample uses your-256-bit-secret)"
                  className="font-mono sm:max-w-md"
                  aria-label="Secret"
                />
                <Button onClick={verify} disabled={!secret}>
                  Verify
                </Button>
                {verified !== null && (
                  <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", verified ? "text-success" : "text-destructive")}>
                    {verified ? <ShieldCheck className="size-4" /> : <ShieldX className="size-4" />}
                    {verified ? "Signature verified" : "Invalid signature"}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {alg === "none"
                  ? "This token is unsigned (alg: none). Never accept it for authentication."
                  : `${alg || "This"} tokens are signed with a private key; verify them on your server with the issuer’s public key.`}
              </p>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
