import type { HotelCandidate } from "./types"

export function isGooglePlacesEnabled() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY)
}

type Place = {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  websiteUri?: string
  editorialSummary?: { text: string }
  addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>
}

/** Google Places API (New) — Text Search restricted to lodging. Requires GOOGLE_PLACES_API_KEY. */
export async function searchGooglePlaces(query: string, limit = 8): Promise<HotelCandidate[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY manquante")
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": key,
      "x-goog-fieldmask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.editorialSummary,places.addressComponents",
    },
    body: JSON.stringify({ textQuery: query, includedType: "lodging", languageCode: "fr", pageSize: limit }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Google Places a répondu ${res.status}`)
  const data = (await res.json()) as { places?: Place[] }
  return (data.places ?? []).map((p) => {
    const comp = (type: string) => p.addressComponents?.find((c) => c.types.includes(type))
    return {
      id: `google-${p.id}`,
      name: p.displayName?.text ?? "Sans nom",
      city: comp("locality")?.longText || comp("postal_town")?.longText || comp("administrative_area_level_2")?.longText || null,
      region: comp("administrative_area_level_1")?.longText || null,
      country: comp("country")?.longText || null,
      countryCode: comp("country")?.shortText || null,
      address: p.formattedAddress || null,
      latitude: p.location?.latitude ?? null,
      longitude: p.location?.longitude ?? null,
      website: p.websiteUri || null,
      description: p.editorialSummary?.text || null,
      provider: "google" as const,
    }
  })
}
