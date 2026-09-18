import { NextResponse } from "next/server"
import { z } from "zod"

import { extractHotelFromUrl } from "@/lib/ai/extract"
import { getSession } from "@/lib/session"

export const maxDuration = 60

const bodySchema = z.object({ url: z.string().url() })

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = bodySchema.safeParse(await req.json().catch(() => null))
  if (!body.success) return NextResponse.json({ error: "URL invalide" }, { status: 400 })

  try {
    const result = await extractHotelFromUrl(body.data.url)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Extraction impossible" }, { status: 422 })
  }
}
