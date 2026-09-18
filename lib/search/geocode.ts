const UA = "LePigeonExigeant/0.1 (private curated hotel collection; contact: bonjour@lepigeonexigeant.fr)"

export type GeocodeResult = {
  latitude: number
  longitude: number
  displayName: string
  city?: string | null
  country?: string | null
  countryCode?: string | null
}

/** Free geocoding via Nominatim (OpenStreetMap). Rate-limited: 1 req/s, used sparingly. */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("limit", "1")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("accept-language", "fr")
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name: string
      address?: Record<string, string>
    }>
    const hit = data[0]
    if (!hit) return null
    const a = hit.address ?? {}
    return {
      latitude: parseFloat(hit.lat),
      longitude: parseFloat(hit.lon),
      displayName: hit.display_name,
      city: a.city || a.town || a.village || a.municipality || a.county || null,
      country: a.country || null,
      countryCode: a.country_code ? a.country_code.toUpperCase() : null,
    }
  } catch {
    return null
  }
}
