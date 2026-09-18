import type { HotelCandidate } from "./types"

type PhotonFeature = {
  geometry: { coordinates: [number, number] }
  properties: {
    osm_id: number
    osm_type: string
    name?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    countrycode?: string
    street?: string
    housenumber?: string
    postcode?: string
    osm_key?: string
    osm_value?: string
    type?: string
  }
}

/**
 * Photon (komoot) — recherche floue gratuite basée sur OpenStreetMap, sans clé API.
 * On restreint aux hébergements touristiques (hotel, guest_house, resort, chalet…).
 */
async function photonRequest(query: string, limit: number, lang: "fr" | "en") {
  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", query)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("lang", lang)
  for (const tag of ["tourism:hotel", "tourism:guest_house", "tourism:resort", "tourism:chalet", "tourism:apartment"]) {
    url.searchParams.append("osm_tag", tag)
  }
  const res = await fetch(url, {
    headers: { "user-agent": "LePigeonExigeant/0.1 (private curated hotel collection)" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Photon a répondu ${res.status}`)
  return ((await res.json()) as { features: PhotonFeature[] }).features
}

const NON_LATIN = /[^\u0000-\u024F\u1E00-\u1EFF\s\p{P}\p{N}]/u

export async function searchPhoton(query: string, limit = 8): Promise<HotelCandidate[]> {
  const features = await photonRequest(query, limit, "fr")
  // OSM stores the local name (e.g. アマン東京). When it is not Latin, try the English name for readability.
  if (features.some((f) => f.properties.name && NON_LATIN.test(f.properties.name))) {
    try {
      const english = await photonRequest(query, limit, "en")
      const byId = new Map(english.map((f) => [f.properties.osm_id, f.properties.name]))
      for (const f of features) {
        const en = byId.get(f.properties.osm_id)
        if (f.properties.name && NON_LATIN.test(f.properties.name) && en && !NON_LATIN.test(en)) f.properties.name = en
      }
    } catch {
      /* keep local names */
    }
  }
  return features
    .filter((f) => f.properties.name)
    .map((f) => {
      const p = f.properties
      const address = [p.housenumber, p.street].filter(Boolean).join(" ") || null
      return {
        id: `photon-${p.osm_type}-${p.osm_id}`,
        name: p.name!,
        city: p.city || p.town || p.village || null,
        region: p.state || null,
        country: p.country || null,
        countryCode: p.countrycode ? p.countrycode.toUpperCase() : null,
        address: [address, p.postcode].filter(Boolean).join(", ") || null,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        website: null,
        description: p.osm_value ? p.osm_value.replace(/_/g, " ") : null,
        osmId: `${p.osm_type}${p.osm_id}`,
        provider: "photon" as const,
      }
    })
}
