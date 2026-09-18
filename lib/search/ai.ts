import { zodTextFormat } from "openai/helpers/zod"
import { z } from "zod"

import { getOpenAI, OPENAI_MODEL } from "@/lib/ai/openai"

import type { HotelCandidate } from "./types"

const candidatesSchema = z.object({
  results: z.array(
    z.object({
      name: z.string(),
      city: z.string().nullable(),
      region: z.string().nullable(),
      country: z.string().nullable(),
      countryCode: z.string().nullable().describe("ISO 3166-1 alpha-2, uppercase"),
      website: z.string().nullable().describe("Official website URL, https"),
      description: z.string().nullable().describe("One elegant sentence, in French, about what makes this place special"),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
    })
  ),
})

/**
 * Recherche IA : OpenAI Responses API + outil web_search.
 * Retourne des candidats structurés (nom, ville, pays, site officiel…).
 */
export async function searchWithAI(query: string, limit = 6): Promise<HotelCandidate[]> {
  const client = getOpenAI()
  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    tools: [{ type: "web_search", search_context_size: "low" }],
    instructions: [
      "You are a concierge for a private collection of refined, high-end hotels and homes.",
      `Given a free-text query (possibly misspelled or partial), find up to ${limit} matching luxury hotels, boutique hotels or exceptional houses.`,
      "Prefer the exact property the user most likely means. Always return the official website (not booking platforms).",
      "Include approximate coordinates when you are confident. Descriptions must be in French.",
      "Return an empty list if nothing plausible is found.",
    ].join(" "),
    input: query,
    text: { format: zodTextFormat(candidatesSchema, "hotel_candidates") },
  })
  const parsed = response.output_parsed
  if (!parsed) return []
  return parsed.results.slice(0, limit).map((r, i) => ({
    id: `ai-${i}-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: r.name,
    city: r.city,
    region: r.region,
    country: r.country,
    countryCode: r.countryCode ? r.countryCode.toUpperCase().slice(0, 2) : null,
    address: null,
    latitude: r.latitude,
    longitude: r.longitude,
    website: r.website && /^https?:\/\//.test(r.website) ? r.website : null,
    description: r.description,
    provider: "ai" as const,
  }))
}
