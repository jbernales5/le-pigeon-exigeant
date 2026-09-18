export function formatPrice(value: string | number | null | undefined, currency = "EUR") {
  if (value == null || value === "") return null
  const n = typeof value === "string" ? parseFloat(value) : value
  if (Number.isNaN(n)) return null
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
}

export function formatStayedAt(value: string | null | undefined) {
  if (!value) return null
  const [y, m] = value.split("-").map(Number)
  if (!y) return null
  const date = new Date(Date.UTC(y, (m || 1) - 1, 1))
  const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function flagEmoji(countryCode: string | null | undefined) {
  if (!countryCode || countryCode.length !== 2) return ""
  const cc = countryCode.toUpperCase()
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)))
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}
