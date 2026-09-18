import { NextResponse } from "next/server"

import { readLocalUpload } from "@/lib/storage"

// Serves photos stored on the local filesystem (development / self-hosted).
// In production on Vercel, photos live in Vercel Blob and never hit this route.
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const file = await readLocalUpload(path.join("/"))
  if (!file) return new NextResponse("Not found", { status: 404 })
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "content-type": "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
