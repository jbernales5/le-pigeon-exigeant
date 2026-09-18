import { NextResponse } from "next/server"

import { getSession } from "@/lib/session"
import { storeImageBuffer } from "@/lib/storage"

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 })
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Image trop lourde (25 Mo max)" }, { status: 400 })

  const stored = await storeImageBuffer(Buffer.from(await file.arrayBuffer()), {
    folder: `uploads/${session.user.id}`,
    minEdge: 480,
  })
  if (!stored) return NextResponse.json({ error: "Image trop petite ou illisible" }, { status: 422 })
  return NextResponse.json(stored)
}
