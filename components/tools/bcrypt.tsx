"use client"

import * as React from "react"
import bcrypt from "bcryptjs"
import { LoaderCircle, ShieldCheck, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { CopyButton, Field, Message, Panel } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

export default function BcryptTool() {
  const [password, setPassword] = React.useState("")
  const [cost, setCost] = React.useState(10)
  const [hash, setHash] = React.useState("")
  const [hashing, setHashing] = React.useState(false)
  const [took, setTook] = React.useState<number | null>(null)

  const [checkPw, setCheckPw] = React.useState("")
  const [checkHash, setCheckHash] = React.useState("")
  const [verdict, setVerdict] = React.useState<null | boolean>(null)
  const [checking, setChecking] = React.useState(false)

  const bytes = new TextEncoder().encode(password).length

  const generate = async () => {
    setHashing(true)
    const t0 = performance.now()
    // bcryptjs is async and yields to the event loop, so the page stays responsive at high costs
    const h = await bcrypt.hash(password, cost)
    setTook(Math.round(performance.now() - t0))
    setHash(h)
    setHashing(false)
  }

  const validHash = /^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(checkHash.trim())
  React.useEffect(() => setVerdict(null), [checkPw, checkHash])

  const verify = async () => {
    setChecking(true)
    setVerdict(await bcrypt.compare(checkPw, checkHash.trim()))
    setChecking(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Hash a password">
        <div className="space-y-4">
          <Field label="Password" htmlFor="pw" hint={bytes > 72 ? undefined : "bcrypt only uses the first 72 bytes of a password."}>
            <Input id="pw" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" autoComplete="off" />
          </Field>
          {bytes > 72 && <Message tone="warning">This password is {bytes} bytes; bcrypt ignores everything after byte 72.</Message>}
          <Field label={`Cost factor: ${cost} (${(2 ** cost).toLocaleString()} rounds)`} hint="10–12 is typical. Each step doubles the time to hash and to crack.">
            <Slider value={[cost]} min={4} max={15} step={1} onValueChange={(v) => setCost(v[0])} aria-label="Cost factor" />
          </Field>
          <Button onClick={generate} disabled={hashing} className="w-full">
            {hashing && <LoaderCircle className="animate-spin" />} {hashing ? "Hashing…" : "Generate hash"}
          </Button>
          {hash && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <code className="min-w-0 flex-1 font-mono text-[13px] break-all">{hash}</code>
                <CopyButton value={hash} iconOnly variant="ghost" />
              </div>
              {took !== null && <p className="mt-2 text-xs text-muted-foreground">Took {took.toLocaleString()} ms. A new random salt is used every time.</p>}
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Check a password against a hash">
        <div className="space-y-4">
          <Field label="Password" htmlFor="cpw">
            <Input id="cpw" value={checkPw} onChange={(e) => setCheckPw(e.target.value)} className="font-mono" autoComplete="off" />
          </Field>
          <Field label="Bcrypt hash" htmlFor="chash" hint="Starts with $2a$, $2b$ or $2y$">
            <Input id="chash" value={checkHash} onChange={(e) => setCheckHash(e.target.value)} placeholder="$2b$10$…" className="font-mono" aria-invalid={(!!checkHash && !validHash) || undefined} />
          </Field>
          {checkHash && !validHash && <Message>That doesn’t look like a bcrypt hash (60 characters, starting with $2).</Message>}
          <Button onClick={verify} disabled={!validHash || checking} variant="outline" className="w-full">
            {checking && <LoaderCircle className="animate-spin" />} Check
          </Button>
          {verdict !== null && (
            <div className={cn("flex items-center gap-2 rounded-lg border px-4 py-3 font-medium", verdict ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/8 text-destructive")}>
              {verdict ? <ShieldCheck className="size-5" /> : <ShieldX className="size-5" />}
              {verdict ? "Match: this password produces the hash." : "No match."}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
