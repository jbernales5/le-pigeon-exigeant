import { NextResponse } from "next/server"

import { availableProviders, searchHotels, type SearchProvider } from "@/lib/search"
import { getSession } from "@/lib/session"

export const maxDuration = 60

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()
  const provider = (searchParams.get("provider") ?? "photon") as SearchProvider
  if (q.length < 2) return NextResponse.json({ provider, results: [] })

  const available = availableProviders().find((p) => p.id === provider)
  if (!available?.enabled) {
    return NextResponse.json({ error: `Le fournisseur « ${provider} » n'est pas configuré.` }, { status: 400 })
  }

  try {
    const result = await searchHotels(q, provider)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Recherche impossible" }, { status: 502 })
  }
}
