"use client"

import * as React from "react"
import QRCode from "qrcode"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CodeArea, Field, Message, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"
import { downloadDataUrl, downloadText } from "@/lib/download"

type Kind = "text" | "wifi" | "email" | "phone"
type Level = "L" | "M" | "Q" | "H"

const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1")

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent" aria-label={`${label} picker`} />
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </Field>
  )
}

export default function QrCodeTool() {
  const [kind, setKind] = React.useState<Kind>("text")
  const [text, setText] = React.useState("https://tool.khanamir.me")
  const [wifi, setWifi] = React.useState({ ssid: "", password: "", security: "WPA", hidden: false })
  const [email, setEmail] = React.useState({ to: "", subject: "", body: "" })
  const [phone, setPhone] = React.useState({ number: "", sms: false, message: "" })
  const [level, setLevel] = React.useState<Level>("M")
  const [size, setSize] = React.useState(512)
  const [margin, setMargin] = React.useState(2)
  const [fg, setFg] = React.useState("#111827")
  const [bg, setBg] = React.useState("#ffffff")
  const [svg, setSvg] = React.useState("")
  const [error, setError] = React.useState("")

  const payload = React.useMemo(() => {
    switch (kind) {
      case "text":
        return text
      case "wifi":
        if (!wifi.ssid) return ""
        return `WIFI:T:${wifi.security === "nopass" ? "nopass" : wifi.security};S:${wifiEscape(wifi.ssid)};${wifi.security !== "nopass" ? `P:${wifiEscape(wifi.password)};` : ""}${wifi.hidden ? "H:true;" : ""};`
      case "email": {
        if (!email.to) return ""
        const q = new URLSearchParams()
        if (email.subject) q.set("subject", email.subject)
        if (email.body) q.set("body", email.body)
        const qs = q.toString().replace(/\+/g, "%20")
        return `mailto:${email.to}${qs ? `?${qs}` : ""}`
      }
      case "phone":
        if (!phone.number) return ""
        return phone.sms ? `SMSTO:${phone.number}:${phone.message}` : `tel:${phone.number.replace(/[^\d+]/g, "")}`
    }
  }, [kind, text, wifi, email, phone])

  const opts = React.useMemo(() => ({ errorCorrectionLevel: level, margin, color: { dark: fg, light: bg } }), [level, margin, fg, bg])

  React.useEffect(() => {
    if (!payload) {
      setSvg("")
      setError("")
      return
    }
    let cancelled = false
    QRCode.toString(payload, { ...opts, type: "svg" })
      .then((s) => {
        if (cancelled) return
        setSvg(s)
        setError("")
      })
      .catch((e: Error) => {
        if (cancelled) return
        setSvg("")
        setError(/too big|amount of data/i.test(e.message) ? "Too much data for a QR code. Shorten the text or lower the error correction." : e.message)
      })
    return () => {
      cancelled = true
    }
  }, [payload, opts])

  const downloadPng = async () => downloadDataUrl(await QRCode.toDataURL(payload, { ...opts, width: size }), "qr-code.png")

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Panel title="Content">
          <div className="space-y-4">
            <Segmented
              ariaLabel="QR type"
              value={kind}
              onChange={setKind}
              options={[
                { value: "text", label: "Text / URL" },
                { value: "wifi", label: "Wi-Fi" },
                { value: "email", label: "Email" },
                { value: "phone", label: "Phone / SMS" },
              ]}
            />
            {kind === "text" && (
              <CodeArea mono={false} value={text} onChange={(e) => setText(e.target.value)} placeholder="A link or any text" className="h-32 resize-y text-sm" aria-label="QR text" />
            )}
            {kind === "wifi" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Network name (SSID)" htmlFor="ssid">
                  <Input id="ssid" value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} />
                </Field>
                <Field label="Security">
                  <Select value={wifi.security} onValueChange={(v) => setWifi({ ...wifi, security: v })}>
                    <SelectTrigger className="w-full" aria-label="Security">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">None (open)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {wifi.security !== "nopass" && (
                  <Field label="Password" htmlFor="wpass">
                    <Input id="wpass" value={wifi.password} onChange={(e) => setWifi({ ...wifi, password: e.target.value })} />
                  </Field>
                )}
                <div className="flex items-end pb-2">
                  <OptionSwitch id="hidden" label="Hidden network" checked={wifi.hidden} onChange={(v) => setWifi({ ...wifi, hidden: v })} />
                </div>
              </div>
            )}
            {kind === "email" && (
              <div className="grid gap-3">
                <Field label="To" htmlFor="to">
                  <Input id="to" type="email" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} placeholder="name@example.com" />
                </Field>
                <Field label="Subject" htmlFor="subject">
                  <Input id="subject" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />
                </Field>
                <Field label="Message" htmlFor="body">
                  <CodeArea mono={false} id="body" value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} className="h-24 min-h-0 resize-y text-sm" />
                </Field>
              </div>
            )}
            {kind === "phone" && (
              <div className="grid gap-3">
                <Field label="Phone number" htmlFor="tel">
                  <Input id="tel" type="tel" value={phone.number} onChange={(e) => setPhone({ ...phone, number: e.target.value })} placeholder="+91 98765 43210" />
                </Field>
                <OptionSwitch id="sms" label="Open a text message instead of calling" checked={phone.sms} onChange={(v) => setPhone({ ...phone, sms: v })} />
                {phone.sms && (
                  <Field label="Message" htmlFor="sms-body">
                    <Input id="sms-body" value={phone.message} onChange={(e) => setPhone({ ...phone, message: e.target.value })} />
                  </Field>
                )}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Style">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField id="fg" label="Foreground" value={fg} onChange={setFg} />
            <ColorField id="bg" label="Background" value={bg} onChange={setBg} />
            <Field label="Error correction" hint="Higher levels survive damage or a logo on top, but make the code denser.">
              <Segmented
                ariaLabel="Error correction"
                size="sm"
                value={level}
                onChange={setLevel}
                options={[
                  { value: "L", label: "L 7%" },
                  { value: "M", label: "M 15%" },
                  { value: "Q", label: "Q 25%" },
                  { value: "H", label: "H 30%" },
                ]}
              />
            </Field>
            <Field label={`Quiet zone: ${margin} modules`}>
              <Slider value={[margin]} min={0} max={8} step={1} onValueChange={(v) => setMargin(v[0])} aria-label="Margin" />
            </Field>
          </div>
        </Panel>
      </div>

      <Panel title="Preview" className="h-fit lg:sticky lg:top-20">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
          {svg ? (
            <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label="QR code" />
          ) : (
            <p className="px-6 text-center text-sm text-muted-foreground">{error ? "" : "Fill in the content to create a QR code"}</p>
          )}
        </div>
        {error && <Message className="mt-3">{error}</Message>}
        <div className="mt-4 space-y-3">
          <Field label={`PNG size: ${size}×${size}px`}>
            <Slider value={[size]} min={128} max={2048} step={64} onValueChange={(v) => setSize(v[0])} aria-label="PNG size" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={downloadPng} disabled={!svg}>
              <Download /> PNG
            </Button>
            <Button variant="outline" onClick={() => downloadText(svg, "qr-code.svg", "image/svg+xml")} disabled={!svg}>
              <Download /> SVG
            </Button>
          </div>
          {payload && kind !== "text" && <p className="font-mono text-[11px] break-all text-muted-foreground">{payload}</p>}
        </div>
      </Panel>
    </div>
  )
}
