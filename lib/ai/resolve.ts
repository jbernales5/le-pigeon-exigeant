import { emptyDraft, type ExtractionResult, type HotelDraft } from "@/lib/hotel-draft"
import type { HotelCandidate } from "@/lib/search/types"
import { lookupOsmWebsite } from "@/lib/search/osm"

import { extractHotelFromUrl } from "./extract"
import { findOfficialWebsite } from "./find-website"
import { isOpenAIEnabled } from "./openai"

export type ResolveResult = ExtractionResult & {
  /** Where the website came from, for the UI. */
  websiteSource: "candidate" | "osm" | "ai" | null
}

function candidateToDraft(c: HotelCandidate): HotelDraft {
  return {
    ...emptyDraft,
    name: c.name,
    city: c.city ?? "",
    region: c.region ?? null,
    country: c.country ?? "",
    countryCode: c.countryCode,
    address: c.address ?? null,
    latitude: c.latitude,
    longitude: c.longitude,
    website: c.website,
    description: c.description && c.description !== "hotel" ? c.description : null,
  }
}

/**
 * From a search candidate (any provider), find the official website (candidate → OSM tag → AI web search),
 * then run the full extraction and merge the precise geo data from the search provider.
 */
export async function resolveCandidate(candidate: HotelCandidate): Promise<ResolveResult> {
  const base = candidateToDraft(candidate)
  const warnings: string[] = []

  let website = candidate.website
  let websiteSource: ResolveResult["websiteSource"] = website ? "candidate" : null
  if (!website && candidate.osmId) {
    website = await lookupOsmWebsite(candidate.osmId)
    if (website) websiteSource = "osm"
  }
  if (!website && isOpenAIEnabled()) {
    try {
      website = await findOfficialWebsite(candidate.name, candidate.city, candidate.country)
      if (website) websiteSource = "ai"
    } catch (err) {
      warnings.push(`Recherche du site officiel impossible (${(err as Error).message}).`)
    }
  }

  if (!website) {
    warnings.push("Site officiel introuvable : la fiche est pré-remplie depuis la recherche. Ajoutez le lien et vos photos.")
    return { draft: base, images: [], sourceUrl: "", mode: "heuristic", warnings, websiteSource: null }
  }

  try {
    const result = await extractHotelFromUrl(website)
    return {
      ...result,
      warnings: [...warnings, ...result.warnings],
      websiteSource,
      draft: {
        ...result.draft,
        name: result.draft.name || base.name,
        latitude: base.latitude ?? result.draft.latitude,
        longitude: base.longitude ?? result.draft.longitude,
        city: base.city || result.draft.city,
        region: result.draft.region ?? base.region,
        country: base.country || result.draft.country,
        countryCode: base.countryCode ?? result.draft.countryCode,
        address: result.draft.address ?? base.address,
        website: result.draft.website ?? website,
      },
    }
  } catch (err) {
    warnings.push(`Site officiel illisible (${(err as Error).message}). Fiche pré-remplie depuis la recherche.`)
    return { draft: { ...base, website }, images: [], sourceUrl: website, mode: "heuristic", warnings, websiteSource }
  }
}
