// Calendar math on whole days. Dates are kept as UTC midnight so daylight-saving shifts never add or lose a day.

export const DAY = 86_400_000

export function parseYMD(s: string): number | null {
  const m = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3])
  const d = new Date(t)
  return d.getUTCDate() === +m[3] ? t : null
}

export function toYMD(t: number) {
  return new Date(t).toISOString().slice(0, 10)
}

export function todayUTC() {
  const d = new Date()
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()

/** Add months, clamping to the end of shorter months (Jan 31 + 1 month = Feb 28/29) */
export function addMonths(t: number, months: number) {
  const d = new Date(t)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + months
  const ty = y + Math.floor(m / 12)
  const tm = ((m % 12) + 12) % 12
  return Date.UTC(ty, tm, Math.min(d.getUTCDate(), daysInMonth(ty, tm)))
}

/** Calendar difference a → b (a <= b) as years, months and days */
export function diffYMD(a: number, b: number) {
  const A = new Date(a)
  const B = new Date(b)
  let years = B.getUTCFullYear() - A.getUTCFullYear()
  let months = B.getUTCMonth() - A.getUTCMonth()
  let days = B.getUTCDate() - A.getUTCDate()
  if (days < 0) {
    months--
    // Borrow the length of the month before b's month
    days += daysInMonth(B.getUTCFullYear(), B.getUTCMonth() - 1)
  }
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months, days }
}

export function isWeekend(t: number) {
  const w = new Date(t).getUTCDay()
  return w === 0 || w === 6
}

/** Weekdays in [a, b), or [a, b] when inclusive */
export function businessDaysBetween(a: number, b: number, inclusive: boolean) {
  const end = inclusive ? b + DAY : b
  const total = Math.round((end - a) / DAY)
  const weeks = Math.floor(total / 7)
  let count = weeks * 5
  for (let t = a + weeks * 7 * DAY; t < end; t += DAY) if (!isWeekend(t)) count++
  return count
}

export function addBusinessDays(t: number, n: number) {
  const step = n < 0 ? -1 : 1
  let left = Math.abs(n)
  while (left > 0) {
    t += step * DAY
    if (!isWeekend(t)) left--
  }
  return t
}

export function formatLong(t: number) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(t)
}

export function plural(n: number, word: string) {
  return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`
}

export function ymdText({ years, months, days }: { years: number; months: number; days: number }) {
  const parts = [years && plural(years, "year"), months && plural(months, "month"), (days || (!years && !months)) && plural(days, "day")].filter(Boolean)
  return parts.join(", ")
}
