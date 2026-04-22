const FIELD_RANGES: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 6],
]

function parseField(raw: string, [min, max]: [number, number]): Set<number> {
  const out = new Set<number>()
  for (const chunk of raw.split(',')) {
    const [rangePart, stepPart] = chunk.split('/')
    const step = stepPart ? parseInt(stepPart, 10) : 1
    let lo = min
    let hi = max
    if (rangePart !== '*') {
      if (rangePart.includes('-')) {
        const [a, b] = rangePart.split('-').map(n => parseInt(n, 10))
        lo = a; hi = b
      } else {
        lo = hi = parseInt(rangePart, 10)
      }
    }
    for (let v = lo; v <= hi; v += step) out.add(v)
  }
  return out
}

export function cronMatches(expr: string, date: Date): boolean {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false

  try {
    const sets = parts.map((p, i) => parseField(p, FIELD_RANGES[i]))
    const [minSet, hourSet, domSet, monSet, dowSet] = sets
    const utcMinute = date.getUTCMinutes()
    const utcHour = date.getUTCHours()
    const utcDom = date.getUTCDate()
    const utcMon = date.getUTCMonth() + 1
    const utcDow = date.getUTCDay()

    if (!minSet.has(utcMinute)) return false
    if (!hourSet.has(utcHour)) return false
    if (!monSet.has(utcMon)) return false

    const domRestricted = parts[2] !== '*'
    const dowRestricted = parts[4] !== '*'
    if (domRestricted && dowRestricted) {
      return domSet.has(utcDom) || dowSet.has(utcDow)
    }
    return domSet.has(utcDom) && dowSet.has(utcDow)
  } catch {
    return false
  }
}

export function isDue(expr: string, now: Date, lastRunAt: string | null | undefined): boolean {
  if (!cronMatches(expr, now)) return false
  if (!lastRunAt) return true
  const last = new Date(lastRunAt)
  return (now.getTime() - last.getTime()) >= 55_000
}
