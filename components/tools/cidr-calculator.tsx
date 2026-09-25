"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Field, Message, Panel, Stat, ValueRow } from "@/components/tool-kit"

const toIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".")
const toBin = (n: number) => [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, "0")).join(".")

function parseIp(s: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s.trim())
  if (!m) return null
  const o = m.slice(1).map(Number)
  if (o.some((x) => x > 255)) return null
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0
}

function ipClass(n: number) {
  const first = n >>> 24
  if (n >>> 0 === 0) return "Unspecified"
  if (first === 10 || (first === 172 && ((n >>> 16) & 255) >= 16 && ((n >>> 16) & 255) <= 31) || (first === 192 && ((n >>> 16) & 255) === 168))
    return "Private (RFC 1918)"
  if (first === 127) return "Loopback"
  if (first === 169 && ((n >>> 16) & 255) === 254) return "Link-local"
  if (first === 100 && ((n >>> 16) & 255) >= 64 && ((n >>> 16) & 255) <= 127) return "Carrier-grade NAT"
  if (first >= 224 && first <= 239) return "Multicast"
  if (first >= 240) return "Reserved"
  return "Public"
}

export default function CidrCalculator() {
  const [ipText, setIpText] = React.useState("192.168.1.10")
  const [prefix, setPrefix] = React.useState(24)

  // Accept "10.0.0.0/8" typed straight into the address field
  const onIp = (v: string) => {
    const m = /^\s*([\d.]+)\s*\/\s*(\d{1,2})\s*$/.exec(v)
    if (m && Number(m[2]) <= 32) {
      setIpText(m[1])
      setPrefix(Number(m[2]))
    } else setIpText(v)
  }

  const ip = parseIp(ipText)
  const r = React.useMemo(() => {
    if (ip === null) return null
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
    const network = (ip & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0
    const total = 2 ** (32 - prefix)
    const usable = prefix >= 31 ? total : total - 2
    const first = prefix >= 31 ? network : network + 1
    const last = prefix >= 31 ? broadcast : broadcast - 1
    return { mask, wildcard: ~mask >>> 0, network, broadcast, total, usable, first, last }
  }, [ip, prefix])

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <Panel title="Network" className="h-fit">
        <div className="space-y-5">
          <Field label="IP address" htmlFor="ip" hint="You can also type CIDR notation, like 10.0.0.0/16.">
            <Input id="ip" value={ipText} onChange={(e) => onIp(e.target.value)} className="h-11 font-mono text-base" aria-invalid={ip === null || undefined} />
          </Field>
          <Field label={`Prefix length: /${prefix}`}>
            <Slider value={[prefix]} min={0} max={32} step={1} onValueChange={(v) => setPrefix(v[0])} aria-label="Prefix length" />
          </Field>
          {ip === null && <Message>Enter an IPv4 address like 192.168.1.10.</Message>}
          {r && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 font-mono text-lg font-semibold text-primary">
              {toIp(r.network)}/{prefix}
            </div>
          )}
        </div>
      </Panel>

      {r && (
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Usable hosts" value={r.usable.toLocaleString()} emphasis />
            <Stat label="Total addresses" value={r.total.toLocaleString()} />
            <Stat label="Address type" value={<span className="text-base">{ipClass(ip!)}</span>} />
          </div>
          <Panel title="Details" bodyClassName="py-1">
            <ValueRow label="Network" value={toIp(r.network)} />
            <ValueRow label="Broadcast" value={prefix >= 31 ? "—" : toIp(r.broadcast)} />
            <ValueRow label="First host" value={toIp(r.first)} />
            <ValueRow label="Last host" value={toIp(r.last)} />
            <ValueRow label="Host range" value={`${toIp(r.first)} – ${toIp(r.last)}`} />
            <ValueRow label="Netmask" value={toIp(r.mask)} />
            <ValueRow label="Wildcard" value={toIp(r.wildcard)} />
            <ValueRow label="CIDR" value={`${toIp(r.network)}/${prefix}`} />
          </Panel>
          <Panel title="Binary" bodyClassName="py-1">
            <ValueRow label="Address" value={toBin(ip!)} />
            <ValueRow label="Netmask" value={toBin(r.mask)} />
            <ValueRow label="Network" value={toBin(r.network)} />
          </Panel>
        </div>
      )}
    </div>
  )
}
