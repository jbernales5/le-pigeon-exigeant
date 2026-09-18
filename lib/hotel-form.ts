import { z } from "zod"

import { hotelDraftSchema } from "@/lib/hotel-draft"

export const photoInputSchema = z.discriminatedUnion("kind", [
  // Remote candidate detected on the hotel page; will be downloaded & normalized.
  z.object({ kind: z.literal("remote"), url: z.string().url(), alt: z.string().nullable().optional() }),
  // Already stored (uploaded through /api/upload or existing photo when editing).
  z.object({
    kind: z.literal("stored"),
    id: z.string().optional(),
    url: z.string().min(1),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    alt: z.string().nullable().optional(),
    sourceUrl: z.string().nullable().optional(),
  }),
])

export const hotelFormSchema = hotelDraftSchema.extend({
  sourceUrl: z.string().url().nullable(),
  pricePerNight: z.number().min(0).max(1_000_000).nullable(),
  currency: z.string().length(3).default("EUR"),
  stayedAt: z.string().regex(/^\d{4}-\d{2}$/).nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  personalNote: z.string().max(2000).nullable(),
  photos: z.array(photoInputSchema).max(24),
})

export type HotelFormInput = z.input<typeof hotelFormSchema>
export type PhotoInput = z.infer<typeof photoInputSchema>

export type ActionResult =
  | { ok: true; slug: string; warnings: string[] }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AED", "THB", "IDR", "MXN", "AUD", "CAD", "MAD", "ZAR"] as const
