"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { CopyButton, Field, OptionSwitch, Panel, Segmented } from "@/components/tool-kit"
import { randomInt, shuffle } from "@/lib/text"
import { cn } from "@/lib/utils"

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
}
const AMBIGUOUS = /[Il1O0o|`'"]/g

const WORDS = [
  ...new Set(
    "able acid aged also area army away baby back ball band bank base bath bear beat bell belt best bird blow blue boat body bone book boot born boss both bowl bulk burn bush busy cake calm came camp card care cart case cash cast cell chat chip city clay clip club coal coat code cold come cook cool cope copy cord core corn cost crew crop dark data date dawn days dead deal dear debt deep deny desk dial diet disk dock does done door dose down draw drew drop drum dual duck dust duty each earn ease east easy edge else even ever exit face fact fair fall farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish five flag flat flew flow folk food foot form fort four free from fuel full fund gain game gate gave gear gift girl give glad goal goes gold golf gone good gray grew grow gulf hair half hall hand hang hard harm hate have head hear heat held hell help here hero high hill hint hold hole holy home hope horn host hour huge hung hunt idea inch iron item jazz join joke jump jury just keen keep kept kick kind king knee knew know lack lady laid lake land lane last late lead leaf lean left lend less life lift like line link list live load loan lock logo long look loop lord lose loss lost loud love luck made mail main make male mall many mark mask mass meal mean meat meet menu mere mild mile milk mill mind mine miss mode mood moon more most move much must name navy near neck need news next nice nine none nose note okay once only onto open oral over pace pack page paid pain pair palm park part pass past path peak pick pile pine pink pipe plan play plot plus poem poet pole pool poor port pose post pour pull pure push quiz race rail rain rank rare rate read real rear rely rent rest rice rich ride ring rise risk road rock role roll roof room root rope rose rule rush safe sage sail salt same sand save seat seed seek seem seen self sell send ship shoe shop shot show shut sick side sign silk site size skin slip slow snow soft soil sold sole some song soon sort soul spot star stay step stop such suit sure swim tail take tale talk tall tank tape task team tech tell tend term test text than that them then they thin this tide tile time tiny told tone took tool tour town tree trip true tube tune turn twin type unit upon used user vast very view vote wage wait wake walk wall want warm wash wave weak wear week well went west what when whom wide wife wild will wind wine wing wire wise wish with wood word wore work yard yeah year your zero zone".split(" "),
  ),
]

type Mode = "password" | "passphrase"
type Opts = { length: number; upper: boolean; lower: boolean; digits: boolean; symbols: boolean; noAmbiguous: boolean; exclude: string }

function makePassword(o: Opts) {
  const strip = (s: string) => {
    let out = o.noAmbiguous ? s.replace(AMBIGUOUS, "") : s
    for (const c of o.exclude) out = out.split(c).join("")
    return out
  }
  const pools = (["upper", "lower", "digits", "symbols"] as const).filter((k) => o[k]).map((k) => strip(SETS[k])).filter(Boolean)
  if (pools.length === 0) return { value: "", bits: 0 }
  const all = pools.join("")
  // One character from each selected set, the rest from all of them, then shuffle
  const chars = pools.slice(0, o.length).map((p) => p[randomInt(p.length)])
  while (chars.length < o.length) chars.push(all[randomInt(all.length)])
  return { value: shuffle(chars).join(""), bits: o.length * Math.log2(all.length) }
}

function makePassphrase(words: number, sep: string, capitalize: boolean, number: boolean) {
  const list = Array.from({ length: words }, () => {
    const w = WORDS[randomInt(WORDS.length)]
    return capitalize ? w[0].toUpperCase() + w.slice(1) : w
  })
  if (number) list[randomInt(list.length)] += String(randomInt(10))
  return { value: list.join(sep), bits: words * Math.log2(WORDS.length) + (number ? Math.log2(10 * words) : 0) }
}

function strength(bits: number) {
  if (bits < 40) return { label: "Weak", tone: "bg-destructive", text: "text-destructive", pct: 20 }
  if (bits < 60) return { label: "Fair", tone: "bg-warning", text: "text-warning", pct: 45 }
  if (bits < 80) return { label: "Strong", tone: "bg-success", text: "text-success", pct: 70 }
  return { label: "Very strong", tone: "bg-success", text: "text-success", pct: 100 }
}

function crackTime(bits: number) {
  // Offline attack at 10 billion guesses per second, average case
  const seconds = 2 ** bits / 2 / 1e10
  const units: [string, number][] = [
    ["billion years", 3.15e16],
    ["million years", 3.15e13],
    ["thousand years", 3.15e10],
    ["years", 3.15e7],
    ["days", 86400],
    ["hours", 3600],
    ["minutes", 60],
  ]
  for (const [u, s] of units) if (seconds >= s) return `${Math.round(seconds / s).toLocaleString()} ${u}`
  return "less than a minute"
}

export default function PasswordGenerator() {
  const [mode, setMode] = React.useState<Mode>("password")
  const [opts, setOpts] = React.useState<Opts>({ length: 20, upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false, exclude: "" })
  const [words, setWords] = React.useState(5)
  const [sep, setSep] = React.useState("-")
  const [capitalize, setCapitalize] = React.useState(true)
  const [withNumber, setWithNumber] = React.useState(true)
  const [results, setResults] = React.useState<{ value: string; bits: number }[]>([])

  const generate = React.useCallback(() => {
    setResults(
      Array.from({ length: 6 }, () => (mode === "password" ? makePassword(opts) : makePassphrase(words, sep, capitalize, withNumber))),
    )
  }, [mode, opts, words, sep, capitalize, withNumber])
  React.useEffect(generate, [generate])

  const main = results[0]
  const s = strength(main?.bits ?? 0)
  const set = <K extends keyof Opts>(k: K, v: Opts[K]) => setOpts((o) => ({ ...o, [k]: v }))
  const noneSelected = mode === "password" && !opts.upper && !opts.lower && !opts.digits && !opts.symbols

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Panel>
          <div className="flex items-center gap-2">
            <output className="scroll-thin min-h-14 flex-1 overflow-x-auto rounded-lg border bg-muted/30 px-4 py-3 font-mono text-lg tracking-wide whitespace-nowrap sm:text-xl" aria-live="polite">
              {noneSelected ? <span className="font-sans text-base text-muted-foreground">Select at least one character type</span> : main?.value}
            </output>
            <Button size="icon" variant="outline" onClick={generate} aria-label="Generate new password" title="Generate again">
              <RefreshCw />
            </Button>
            <CopyButton value={main?.value ?? ""} size="default" variant="default" label="Copy" />
          </div>
          {main?.value && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-semibold", s.text)}>{s.label}</span>
                <span className="text-muted-foreground">
                  {Math.round(main.bits)} bits of entropy · about {crackTime(main.bits)} to crack
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all", s.tone)} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          )}
        </Panel>

        <Panel title="More options" bodyClassName="py-1">
          {results.slice(1).map((r, i) => (
            <div key={i} className="flex items-center gap-2 border-b py-1.5 last:border-b-0">
              <span className="min-w-0 flex-1 truncate font-mono text-sm">{r.value}</span>
              <CopyButton value={r.value} iconOnly variant="ghost" />
            </div>
          ))}
        </Panel>
      </div>

      <Panel title="Settings" className="h-fit">
        <div className="space-y-5">
          <Segmented
            ariaLabel="Type"
            value={mode}
            onChange={setMode}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "password", label: "Password" },
              { value: "passphrase", label: "Passphrase" },
            ]}
          />
          {mode === "password" ? (
            <>
              <Field label={`Length: ${opts.length}`}>
                <Slider value={[opts.length]} min={4} max={128} step={1} onValueChange={(v) => set("length", v[0])} aria-label="Length" />
              </Field>
              <div className="grid gap-3">
                <OptionSwitch id="upper" label="Uppercase (A–Z)" checked={opts.upper} onChange={(v) => set("upper", v)} />
                <OptionSwitch id="lower" label="Lowercase (a–z)" checked={opts.lower} onChange={(v) => set("lower", v)} />
                <OptionSwitch id="digits" label="Numbers (0–9)" checked={opts.digits} onChange={(v) => set("digits", v)} />
                <OptionSwitch id="symbols" label="Symbols (!@#$…)" checked={opts.symbols} onChange={(v) => set("symbols", v)} />
                <OptionSwitch id="ambiguous" label="Avoid look-alikes (I l 1 O 0)" checked={opts.noAmbiguous} onChange={(v) => set("noAmbiguous", v)} />
              </div>
              <Field label="Never use these characters" htmlFor="exclude">
                <Input id="exclude" value={opts.exclude} onChange={(e) => set("exclude", e.target.value)} placeholder="e.g. {}[]" className="font-mono" />
              </Field>
            </>
          ) : (
            <>
              <Field label={`Words: ${words}`}>
                <Slider value={[words]} min={3} max={12} step={1} onValueChange={(v) => setWords(v[0])} aria-label="Number of words" />
              </Field>
              <Field label="Separator">
                <Segmented
                  ariaLabel="Separator"
                  size="sm"
                  value={sep}
                  onChange={setSep}
                  options={[
                    { value: "-", label: "-" },
                    { value: ".", label: "." },
                    { value: "_", label: "_" },
                    { value: " ", label: "space" },
                    { value: "", label: "none" },
                  ]}
                />
              </Field>
              <div className="grid gap-3">
                <OptionSwitch id="cap" label="Capitalize words" checked={capitalize} onChange={setCapitalize} />
                <OptionSwitch id="num" label="Add a number" checked={withNumber} onChange={setWithNumber} />
              </div>
            </>
          )}
          <p className="text-xs text-muted-foreground">Generated on your device with the Web Crypto random generator. Nothing is stored or sent.</p>
        </div>
      </Panel>
    </div>
  )
}
