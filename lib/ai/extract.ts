import { zodTextFormat } from "openai/helpers/zod"
import { z } from "zod"

import { emptyDraft, hotelDraftSchema, type ExtractionResult, type HotelDraft } from "@/lib/hotel-draft"
import { geocode } from "@/lib/search/geocode"

import { getOpenAI, isOpenAIEnabled, OPENAI_MODEL } from "./openai"
import { scrapePage, type ScrapedPage } from "./scrape"

// Structured-output schema (OpenAI requires every field to be required; nullable is fine).
const aiSchema = z.object({
  name: z.string().describe("Official property name, without marketing suffixes"),
  tagline: z.string().nullable().describe("Very short elegant tagline in French, max 12 words"),
  description: z
    .string()
    .nullable()
    .describe("2-4 refined sentences in French describing the property, its style and setting. No prices, no marketing fluff."),
  city: z.string().describe("City or locality"),
  region: z.string().nullable().describe("Region / state / island"),
  country: z.string().describe("Country name in French"),
  countryCode: z.string().nullable().describe("ISO 3166-1 alpha-2, uppercase"),
  address: z.string().nullable().describe("Street address if present"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  website: z.string().nullable().describe("Official website, https"),
  highlights: z.array(z.string()).describe("3-6 short highlights in French (e.g. 'Vue sur la lagune', 'Spa troglodyte')"),
  amenities: z.array(z.string()).describe("Up to 12 amenities in French (Piscine, Spa, Plage privée…)"),
})

function findJsonLdHotel(page: ScrapedPage) {
  const lodgingTypes = /Hotel|LodgingBusiness|Resort|BedAndBreakfast|Hostel|Motel|VacationRental|Accommodation|Place|LocalBusiness/i
  for (const node of page.jsonLd) {
    if (!node || typeof node !== "object") continue
    const o = node as Record<string, unknown>
    const type = Array.isArray(o["@type"]) ? o["@type"].join(",") : String(o["@type"] ?? "")
    if (lodgingTypes.test(type)) return o
  }
  return null
}

/** Fallback used when no OpenAI key is configured: meta tags + JSON-LD + hostname. */
function heuristicDraft(page: ScrapedPage): HotelDraft {
  const ld = findJsonLdHotel(page)
  const addr = (ld?.address ?? {}) as Record<string, unknown>
  const geo = (ld?.geo ?? {}) as Record<string, unknown>
  const host = new URL(page.finalUrl).hostname.replace(/^www\./, "")
  const name = String(ld?.name ?? page.siteName ?? page.title.split(/[|–-]/)[0] ?? host).trim()
  return {
    ...emptyDraft,
    name: name || host,
    tagline: null,
    description: String(ld?.description ?? page.description ?? "").trim() || null,
    city: String(addr.addressLocality ?? "").trim(),
    region: String(addr.addressRegion ?? "").trim() || null,
    country: String(addr.addressCountry ?? "").trim(),
    countryCode: typeof addr.addressCountry === "string" && addr.addressCountry.length === 2 ? addr.addressCountry.toUpperCase() : null,
    address: [addr.streetAddress, addr.postalCode].filter(Boolean).join(", ") || null,
    latitude: geo.latitude ? Number(geo.latitude) : null,
    longitude: geo.longitude ? Number(geo.longitude) : null,
    website: `${new URL(page.finalUrl).origin}/`,
  }
}

async function aiDraft(page: ScrapedPage): Promise<HotelDraft> {
  const client = getOpenAI()
  const ld = findJsonLdHotel(page)
  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    instructions: [
      "You extract structured information about a hotel / luxury accommodation from the content of its web page.",
      "Be factual: only use what the page states or what you know with confidence about this exact property.",
      "Write tagline, description, highlights and amenities in elegant French. Country name in French.",
      "If the page is a booking platform listing, still describe the property itself and set website to the official site if it is mentioned, otherwise null.",
    ].join(" "),
    input: [
      `URL: ${page.finalUrl}`,
      page.siteName ? `Site name: ${page.siteName}` : "",
      ld ? `JSON-LD:\n${JSON.stringify(ld).slice(0, 4000)}` : "",
      `PAGE CONTENT:\n${page.text}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    text: { format: zodTextFormat(aiSchema, "hotel_extraction") },
  })
  const parsed = response.output_parsed
  if (!parsed) throw new Error("L'IA n'a pas renvoyé de résultat structuré")
  const draft: HotelDraft = {
    ...parsed,
    countryCode: parsed.countryCode ? parsed.countryCode.toUpperCase().slice(0, 2) : null,
    website: parsed.website && /^https?:\/\//.test(parsed.website) ? parsed.website : `${new URL(page.finalUrl).origin}/`,
    highlights: parsed.highlights.slice(0, 8),
    amenities: parsed.amenities.slice(0, 20),
  }
  return draft
}

/**
 * Full pipeline: scrape the page → structure with OpenAI (or heuristics) → geocode if needed.
 */
export async function extractHotelFromUrl(inputUrl: string): Promise<ExtractionResult> {
  const warnings: string[] = []
  const page = await scrapePage(inputUrl)

  let draft: HotelDraft
  let mode: ExtractionResult["mode"]
  if (isOpenAIEnabled()) {
    try {
      draft = await aiDraft(page)
      mode = "ai"
    } catch (err) {
      warnings.push(`Extraction IA indisponible (${(err as Error).message}). Repli sur les métadonnées de la page.`)
      draft = heuristicDraft(page)
      mode = "heuristic"
    }
  } else {
    warnings.push("Aucune clé OpenAI configurée : extraction basée sur les métadonnées de la page uniquement.")
    draft = heuristicDraft(page)
    mode = "heuristic"
  }

  if ((draft.latitude == null || draft.longitude == null) && (draft.name || draft.city)) {
    const geo = await geocode([draft.name, draft.address, draft.city, draft.country].filter(Boolean).join(", "))
      ?? (draft.city ? await geocode([draft.city, draft.country].filter(Boolean).join(", ")) : null)
    if (geo) {
      draft.latitude = geo.latitude
      draft.longitude = geo.longitude
      if (!draft.city && geo.city) draft.city = geo.city
      if (!draft.country && geo.country) draft.country = geo.country
      if (!draft.countryCode && geo.countryCode) draft.countryCode = geo.countryCode
    } else {
      warnings.push("Localisation introuvable automatiquement : renseignez la ville ou les coordonnées.")
    }
  }

  // Validate loosely: keep what we have but coerce invalid values to null/empty.
  const safe = hotelDraftSchema.safeParse(draft)
  const finalDraft = safe.success ? safe.data : { ...emptyDraft, ...draft, website: draft.website && /^https?:\/\//.test(draft.website) ? draft.website : null }

  if (page.images.length === 0) warnings.push("Aucune photo exploitable détectée sur cette page. Vous pourrez en ajouter manuellement.")

  return { draft: finalDraft, images: page.images, sourceUrl: page.finalUrl, mode, warnings }
}
