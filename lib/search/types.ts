export type SearchProvider = "ai" | "photon" | "google"

export type HotelCandidate = {
  id: string
  name: string
  city: string | null
  region?: string | null
  country: string | null
  countryCode: string | null
  address?: string | null
  latitude: number | null
  longitude: number | null
  website: string | null
  description?: string | null
  /** OpenStreetMap id (e.g. "N9548012517"), when known. Lets us look up the website tag for free. */
  osmId?: string | null
  /** Where this candidate came from. */
  provider: SearchProvider
}

export type SearchResponse = {
  provider: SearchProvider
  results: HotelCandidate[]
  note?: string
}
