import { z } from "zod"

/** Shape produced by the AI extraction and edited by the user before saving. */
export const hotelDraftSchema = z.object({
  name: z.string().min(1).max(160),
  tagline: z.string().max(200).nullable(),
  description: z.string().max(4000).nullable(),
  city: z.string().min(1).max(120),
  region: z.string().max(120).nullable(),
  country: z.string().min(1).max(120),
  countryCode: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .nullable(),
  address: z.string().max(300).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  website: z.string().url().nullable(),
  highlights: z.array(z.string().max(120)).max(8),
  amenities: z.array(z.string().max(60)).max(20),
})

export type HotelDraft = z.infer<typeof hotelDraftSchema>

export type CandidateImage = {
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type ExtractionResult = {
  draft: HotelDraft
  images: CandidateImage[]
  sourceUrl: string
  /** How the draft was produced: "ai" (OpenAI) or "heuristic" (no API key). */
  mode: "ai" | "heuristic"
  warnings: string[]
}

export const emptyDraft: HotelDraft = {
  name: "",
  tagline: null,
  description: null,
  city: "",
  region: null,
  country: "",
  countryCode: null,
  address: null,
  latitude: null,
  longitude: null,
  website: null,
  highlights: [],
  amenities: [],
}
