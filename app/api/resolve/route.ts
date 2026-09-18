import { NextResponse } from "next/server"
import { z } from "zod"

import { resolveCandidate } from "@/lib/ai/resolve"
import { getSession } from "@/lib/session"

export const maxDuration = 90

const candidateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  city: z.string().nullable(),
  region: z.string().nullable().optional(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable().optional(),
  osmId: z.string().nullable().optional(),
  provider: z.enum(["ai", "photon", "google"]),
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const parsed = candidateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Candidat invalide" }, { status: 400 })
  try {
    return NextResponse.json(await resolveCandidate(parsed.data))
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Résolution impossible" }, { status: 422 })
  }
}
