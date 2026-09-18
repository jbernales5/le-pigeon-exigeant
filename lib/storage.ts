import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { put } from "@vercel/blob"
import { nanoid } from "nanoid"
import sharp from "sharp"

export type StoredImage = {
  url: string
  width: number
  height: number
  sourceUrl?: string
}

const LOCAL_DIR = path.join(process.cwd(), "storage", "uploads")
const MAX_EDGE = 2200
const MIN_EDGE = 640

export function isBlobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/** Resize / normalize an image buffer to WebP. Returns null if the image is too small to be worth keeping. */
export async function normalizeImage(input: Buffer, opts?: { minEdge?: number }) {
  const minEdge = opts?.minEdge ?? MIN_EDGE
  const image = sharp(input, { failOn: "none" }).rotate()
  const meta = await image.metadata()
  if (!meta.width || !meta.height) return null
  if (Math.max(meta.width, meta.height) < minEdge) return null

  const resized = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  })
  const buffer = await resized.webp({ quality: 84 }).toBuffer({ resolveWithObject: true })
  return { buffer: buffer.data, width: buffer.info.width, height: buffer.info.height }
}

async function persist(buffer: Buffer, key: string): Promise<string> {
  if (isBlobEnabled()) {
    const blob = await put(key, buffer, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      // Explicit token: otherwise the SDK prefers OIDC when VERCEL_OIDC_TOKEN + BLOB_STORE_ID are present
      // (e.g. after `vercel env pull`), which fails locally unless OIDC is enabled for "development".
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return blob.url
  }
  const target = path.join(LOCAL_DIR, key)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, buffer)
  return `/uploads/${key}`
}

/** Store an already-fetched image (used for uploads). */
export async function storeImageBuffer(
  input: Buffer,
  opts: { folder: string; minEdge?: number; sourceUrl?: string }
): Promise<StoredImage | null> {
  const normalized = await normalizeImage(input, { minEdge: opts.minEdge })
  if (!normalized) return null
  const key = `${opts.folder}/${nanoid(16)}.webp`
  const url = await persist(normalized.buffer, key)
  return { url, width: normalized.width, height: normalized.height, sourceUrl: opts.sourceUrl }
}

/** Download a remote image and store it. Returns null when unreachable / too small / not an image. */
export async function storeImageFromUrl(
  sourceUrl: string,
  opts: { folder: string; minEdge?: number; referer?: string }
): Promise<StoredImage | null> {
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        ...(opts.referer ? { referer: opts.referer } : {}),
      },
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    })
    if (!res.ok) return null
    const type = res.headers.get("content-type") ?? ""
    if (!type.startsWith("image/") && !/\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(sourceUrl)) return null
    const arrayBuffer = await res.arrayBuffer()
    if (arrayBuffer.byteLength > 25 * 1024 * 1024) return null
    return storeImageBuffer(Buffer.from(arrayBuffer), { ...opts, sourceUrl })
  } catch {
    return null
  }
}

/** Read a locally stored file (dev / self-hosted only). */
export async function readLocalUpload(key: string) {
  const safe = path.normalize(key).replace(/^(\.\.[/\\])+/, "")
  const target = path.join(LOCAL_DIR, safe)
  if (!target.startsWith(LOCAL_DIR)) return null
  try {
    return await readFile(target)
  } catch {
    return null
  }
}
