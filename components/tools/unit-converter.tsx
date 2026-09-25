"use client"

import * as React from "react"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton, Panel } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

type Unit = { id: string; name: string; symbol: string; factor?: number; toBase?: (v: number) => number; fromBase?: (v: number) => number }
type Category = { id: string; name: string; units: Unit[]; from: string; to: string }

// Each factor is the unit's size in the category's base unit (metre, kilogram, litre, m², m/s, second, byte, pascal, joule)
const CATEGORIES: Category[] = [
  {
    id: "length", name: "Length", from: "m", to: "ft",
    units: [
      { id: "mm", name: "Millimetre", symbol: "mm", factor: 0.001 },
      { id: "cm", name: "Centimetre", symbol: "cm", factor: 0.01 },
      { id: "m", name: "Metre", symbol: "m", factor: 1 },
      { id: "km", name: "Kilometre", symbol: "km", factor: 1000 },
      { id: "in", name: "Inch", symbol: "in", factor: 0.0254 },
      { id: "ft", name: "Foot", symbol: "ft", factor: 0.3048 },
      { id: "yd", name: "Yard", symbol: "yd", factor: 0.9144 },
      { id: "mi", name: "Mile", symbol: "mi", factor: 1609.344 },
      { id: "nmi", name: "Nautical mile", symbol: "nmi", factor: 1852 },
    ],
  },
  {
    id: "mass", name: "Weight", from: "kg", to: "lb",
    units: [
      { id: "mg", name: "Milligram", symbol: "mg", factor: 1e-6 },
      { id: "g", name: "Gram", symbol: "g", factor: 0.001 },
      { id: "kg", name: "Kilogram", symbol: "kg", factor: 1 },
      { id: "t", name: "Tonne", symbol: "t", factor: 1000 },
      { id: "oz", name: "Ounce", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", name: "Pound", symbol: "lb", factor: 0.45359237 },
      { id: "st", name: "Stone", symbol: "st", factor: 6.35029318 },
      { id: "ton", name: "US ton", symbol: "ton", factor: 907.18474 },
    ],
  },
  {
    id: "temperature", name: "Temperature", from: "c", to: "f",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", name: "Fahrenheit", symbol: "°F", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: "k", name: "Kelvin", symbol: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      { id: "r", name: "Rankine", symbol: "°R", toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => ((v + 273.15) * 9) / 5 },
    ],
  },
  {
    id: "volume", name: "Volume", from: "l", to: "gal",
    units: [
      { id: "ml", name: "Millilitre", symbol: "ml", factor: 0.001 },
      { id: "l", name: "Litre", symbol: "l", factor: 1 },
      { id: "m3", name: "Cubic metre", symbol: "m³", factor: 1000 },
      { id: "tsp", name: "Teaspoon (US)", symbol: "tsp", factor: 0.00492892159375 },
      { id: "tbsp", name: "Tablespoon (US)", symbol: "tbsp", factor: 0.01478676478125 },
      { id: "floz", name: "Fluid ounce (US)", symbol: "fl oz", factor: 0.0295735295625 },
      { id: "cup", name: "Cup (US)", symbol: "cup", factor: 0.2365882365 },
      { id: "pt", name: "Pint (US)", symbol: "pt", factor: 0.473176473 },
      { id: "qt", name: "Quart (US)", symbol: "qt", factor: 0.946352946 },
      { id: "gal", name: "Gallon (US)", symbol: "gal", factor: 3.785411784 },
      { id: "impgal", name: "Gallon (UK)", symbol: "imp gal", factor: 4.54609 },
    ],
  },
  {
    id: "area", name: "Area", from: "m2", to: "ft2",
    units: [
      { id: "cm2", name: "Square centimetre", symbol: "cm²", factor: 1e-4 },
      { id: "m2", name: "Square metre", symbol: "m²", factor: 1 },
      { id: "ha", name: "Hectare", symbol: "ha", factor: 1e4 },
      { id: "km2", name: "Square kilometre", symbol: "km²", factor: 1e6 },
      { id: "in2", name: "Square inch", symbol: "in²", factor: 0.00064516 },
      { id: "ft2", name: "Square foot", symbol: "ft²", factor: 0.09290304 },
      { id: "yd2", name: "Square yard", symbol: "yd²", factor: 0.83612736 },
      { id: "ac", name: "Acre", symbol: "ac", factor: 4046.8564224 },
      { id: "mi2", name: "Square mile", symbol: "mi²", factor: 2589988.110336 },
    ],
  },
  {
    id: "speed", name: "Speed", from: "kmh", to: "mph",
    units: [
      { id: "ms", name: "Metres per second", symbol: "m/s", factor: 1 },
      { id: "kmh", name: "Kilometres per hour", symbol: "km/h", factor: 1 / 3.6 },
      { id: "mph", name: "Miles per hour", symbol: "mph", factor: 0.44704 },
      { id: "fts", name: "Feet per second", symbol: "ft/s", factor: 0.3048 },
      { id: "kn", name: "Knot", symbol: "kn", factor: 1852 / 3600 },
    ],
  },
  {
    id: "time", name: "Time", from: "h", to: "min",
    units: [
      { id: "ms", name: "Millisecond", symbol: "ms", factor: 0.001 },
      { id: "s", name: "Second", symbol: "s", factor: 1 },
      { id: "min", name: "Minute", symbol: "min", factor: 60 },
      { id: "h", name: "Hour", symbol: "h", factor: 3600 },
      { id: "d", name: "Day", symbol: "d", factor: 86400 },
      { id: "wk", name: "Week", symbol: "wk", factor: 604800 },
      { id: "mo", name: "Month (average)", symbol: "mo", factor: 2629746 },
      { id: "yr", name: "Year (365.2425 days)", symbol: "yr", factor: 31556952 },
    ],
  },
  {
    id: "data", name: "Data", from: "GB", to: "MiB",
    units: [
      { id: "bit", name: "Bit", symbol: "bit", factor: 0.125 },
      { id: "B", name: "Byte", symbol: "B", factor: 1 },
      { id: "KB", name: "Kilobyte", symbol: "kB", factor: 1e3 },
      { id: "MB", name: "Megabyte", symbol: "MB", factor: 1e6 },
      { id: "GB", name: "Gigabyte", symbol: "GB", factor: 1e9 },
      { id: "TB", name: "Terabyte", symbol: "TB", factor: 1e12 },
      { id: "KiB", name: "Kibibyte", symbol: "KiB", factor: 1024 },
      { id: "MiB", name: "Mebibyte", symbol: "MiB", factor: 1024 ** 2 },
      { id: "GiB", name: "Gibibyte", symbol: "GiB", factor: 1024 ** 3 },
      { id: "TiB", name: "Tebibyte", symbol: "TiB", factor: 1024 ** 4 },
    ],
  },
  {
    id: "pressure", name: "Pressure", from: "bar", to: "psi",
    units: [
      { id: "pa", name: "Pascal", symbol: "Pa", factor: 1 },
      { id: "kpa", name: "Kilopascal", symbol: "kPa", factor: 1000 },
      { id: "bar", name: "Bar", symbol: "bar", factor: 1e5 },
      { id: "atm", name: "Atmosphere", symbol: "atm", factor: 101325 },
      { id: "psi", name: "Pound per square inch", symbol: "psi", factor: 6894.757293168 },
      { id: "mmhg", name: "Millimetre of mercury", symbol: "mmHg", factor: 133.322387415 },
    ],
  },
  {
    id: "energy", name: "Energy", from: "kcal", to: "kj",
    units: [
      { id: "j", name: "Joule", symbol: "J", factor: 1 },
      { id: "kj", name: "Kilojoule", symbol: "kJ", factor: 1000 },
      { id: "cal", name: "Calorie", symbol: "cal", factor: 4.184 },
      { id: "kcal", name: "Kilocalorie", symbol: "kcal", factor: 4184 },
      { id: "wh", name: "Watt-hour", symbol: "Wh", factor: 3600 },
      { id: "kwh", name: "Kilowatt-hour", symbol: "kWh", factor: 3.6e6 },
      { id: "btu", name: "BTU", symbol: "BTU", factor: 1055.05585262 },
    ],
  },
]

function convert(v: number, from: Unit, to: Unit) {
  const base = from.toBase ? from.toBase(v) : v * from.factor!
  return to.fromBase ? to.fromBase(base) : base / to.factor!
}

function format(n: number) {
  if (!Number.isFinite(n)) return "—"
  if (n === 0) return "0"
  const abs = Math.abs(n)
  if (abs >= 1e15 || abs < 1e-9) return n.toExponential(6).replace(/\.?0+e/, "e")
  return Number(n.toPrecision(12)).toLocaleString("en-US", { maximumFractionDigits: 10, useGrouping: true })
}

function UnitSelect({ units, value, onChange, label }: { units: Unit[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {units.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name} ({u.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function UnitConverter() {
  const [catId, setCatId] = React.useState("length")
  const cat = CATEGORIES.find((c) => c.id === catId)!
  const [from, setFrom] = React.useState(cat.from)
  const [to, setTo] = React.useState(cat.to)
  const [value, setValue] = React.useState("1")

  const pickCategory = (id: string) => {
    const c = CATEGORIES.find((x) => x.id === id)!
    setCatId(id)
    setFrom(c.from)
    setTo(c.to)
  }

  const fromUnit = cat.units.find((u) => u.id === from) ?? cat.units[0]
  const toUnit = cat.units.find((u) => u.id === to) ?? cat.units[1]
  const n = value.trim() === "" ? null : Number(value.replace(/,/g, ""))
  const valid = n !== null && Number.isFinite(n)
  const result = valid ? convert(n!, fromUnit, toUnit) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Category">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === catId}
            onClick={() => pickCategory(c.id)}
            className={cn(
              "h-8 rounded-full border px-3.5 text-sm font-medium transition-colors",
              c.id === catId ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Panel>
        <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="grid gap-2">
            <span className="text-xs font-medium text-muted-foreground">From</span>
            <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" className="h-12 font-mono text-lg" aria-label="Value" aria-invalid={(n !== null && !valid) || undefined} />
            <UnitSelect units={cat.units} value={fromUnit.id} onChange={setFrom} label="From unit" />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="mx-auto mb-12 md:mb-[3.25rem]"
            aria-label="Swap units"
            onClick={() => {
              setFrom(toUnit.id)
              setTo(fromUnit.id)
              if (result !== null) setValue(String(Number(result.toPrecision(12))))
            }}
          >
            <ArrowLeftRight />
          </Button>
          <div className="grid gap-2">
            <span className="text-xs font-medium text-muted-foreground">To</span>
            <div className="flex h-12 items-center justify-between gap-2 rounded-md border bg-primary/5 px-3">
              <span className="truncate font-mono text-lg font-semibold text-primary">{result !== null ? format(result) : "—"}</span>
              <CopyButton value={result !== null ? String(Number(result.toPrecision(12))) : ""} iconOnly variant="ghost" />
            </div>
            <UnitSelect units={cat.units} value={toUnit.id} onChange={setTo} label="To unit" />
          </div>
        </div>
        {result !== null && (
          <p className="mt-4 text-sm text-muted-foreground">
            {format(n!)} {fromUnit.symbol} = <span className="font-medium text-foreground">{format(result)} {toUnit.symbol}</span>
          </p>
        )}
      </Panel>

      {valid && (
        <Panel title={`${format(n!)} ${fromUnit.symbol} in every unit`} bodyClassName="p-0">
          <div className="grid sm:grid-cols-2">
            {cat.units.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setTo(u.id)}
                className={cn(
                  "flex items-center justify-between gap-3 border-b px-4 py-2 text-left text-sm transition-colors hover:bg-accent/50 sm:odd:border-r",
                  u.id === toUnit.id && "bg-accent/60",
                )}
              >
                <span className="text-muted-foreground">{u.name}</span>
                <span className="font-mono tabular-nums">
                  {format(convert(n!, fromUnit, u))} <span className="text-muted-foreground">{u.symbol}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
