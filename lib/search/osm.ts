const UA = "LePigeonExigeant/0.1 (private curated hotel collection; contact: bonjour@lepigeonexigeant.fr)"

/** Free lookup of the `website` tag of an OSM object via Nominatim (extratags). */
export async function lookupOsmWebsite(osmId: string): Promise<string | null> {
  if (!/^[NWR]\d+$/.test(osmId)) return null
  const url = new URL("https://nominatim.openstreetmap.org/lookup")
  url.searchParams.set("osm_ids", osmId)
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("extratags", "1")
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ extratags?: Record<string, string> }>
    const tags = data[0]?.extratags ?? {}
    const raw = tags.website || tags["contact:website"] || tags.url || null
    if (!raw) return null
    const site = raw.split(";")[0].trim()
    return /^https?:\/\//i.test(site) ? site : `https://${site}`
  } catch {
    return null
  }
}
