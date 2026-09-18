import { isOpenAIEnabled } from "@/lib/ai/openai"

import { searchWithAI } from "./ai"
import { isGooglePlacesEnabled, searchGooglePlaces } from "./google"
import { searchPhoton } from "./photon"
import type { SearchProvider, SearchResponse } from "./types"

export type { HotelCandidate, SearchProvider, SearchResponse } from "./types"

export function availableProviders(): Array<{ id: SearchProvider; label: string; hint: string; enabled: boolean }> {
  return [
    {
      id: "photon",
      label: "OpenStreetMap",
      hint: "Recherche floue gratuite et sobre. Rapide, coordonnées précises, puis extraction du site officiel.",
      enabled: true,
    },
    {
      id: "ai",
      label: "Recherche IA",
      hint: "OpenAI + recherche web : comprend les fautes, trouve le site officiel. À réserver aux cas difficiles.",
      enabled: isOpenAIEnabled(),
    },
    {
      id: "google",
      label: "Google Places",
      hint: "Base Google la plus complète. Nécessite une clé API.",
      enabled: isGooglePlacesEnabled(),
    },
  ]
}

export async function searchHotels(query: string, provider: SearchProvider): Promise<SearchResponse> {
  switch (provider) {
    case "ai":
      return { provider, results: await searchWithAI(query) }
    case "google":
      return { provider, results: await searchGooglePlaces(query) }
    case "photon":
    default:
      return { provider: "photon", results: await searchPhoton(query) }
  }
}
