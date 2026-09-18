"use server"

import { and, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { db } from "@/lib/db"
import { hotelPhotos, hotels } from "@/lib/db/schema"
import { hotelFormSchema, type ActionResult, type HotelFormInput, type PhotoInput } from "@/lib/hotel-form"
import { requireSession } from "@/lib/session"
import { toSlug } from "@/lib/slug"
import { storeImageFromUrl, type StoredImage } from "@/lib/storage"

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base
  for (let i = 2; i < 50; i++) {
    const existing = await db.query.hotels.findFirst({ where: eq(hotels.slug, slug), columns: { id: true } })
    if (!existing || existing.id === excludeId) return slug
    slug = `${base}-${i}`
  }
  return `${base}-${nanoid(4).toLowerCase()}`
}

/** Download remote candidates in parallel (bounded), keep stored ones as is. Preserves order. */
async function resolvePhotos(photos: PhotoInput[], folder: string, referer: string | null) {
  const warnings: string[] = []
  const results = await Promise.all(
    photos.map(async (p): Promise<(StoredImage & { alt?: string | null; id?: string }) | null> => {
      if (p.kind === "stored") {
        return { id: p.id, url: p.url, width: p.width ?? 0, height: p.height ?? 0, alt: p.alt, sourceUrl: p.sourceUrl ?? undefined }
      }
      const stored = await storeImageFromUrl(p.url, { folder, referer: referer ?? undefined })
      if (!stored) warnings.push(`Photo ignorée (inaccessible ou trop petite) : ${p.url.slice(0, 80)}`)
      return stored ? { ...stored, alt: p.alt } : null
    })
  )
  return { photos: results.filter((r): r is NonNullable<typeof r> => r !== null), warnings }
}

export async function createHotel(input: HotelFormInput): Promise<ActionResult> {
  const session = await requireSession()
  const parsed = hotelFormSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Certains champs sont invalides.", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> }
  }
  const data = parsed.data
  if (data.photos.length === 0) return { ok: false, error: "Ajoutez au moins une photo : c'est ce qui fait la collection." }

  const id = nanoid(12)
  const slug = await uniqueSlug(toSlug(data.name, data.city))
  const { photos, warnings } = await resolvePhotos(data.photos, `hotels/${id}`, data.sourceUrl)
  if (photos.length === 0) return { ok: false, error: "Aucune des photos sélectionnées n'a pu être récupérée. Essayez d'en téléverser une." }

  await db.transaction(async (tx) => {
    await tx.insert(hotels).values({
      id,
      slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      city: data.city,
      region: data.region,
      country: data.country,
      countryCode: data.countryCode,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      website: data.website,
      sourceUrl: data.sourceUrl,
      pricePerNight: data.pricePerNight != null ? data.pricePerNight.toFixed(2) : null,
      currency: data.currency.toUpperCase(),
      stayedAt: data.stayedAt,
      rating: data.rating,
      highlights: data.highlights,
      amenities: data.amenities,
      personalNote: data.personalNote,
      createdById: session.user.id,
    })
    await tx.insert(hotelPhotos).values(
      photos.map((p, position) => ({
        id: nanoid(12),
        hotelId: id,
        url: p.url,
        alt: p.alt ?? data.name,
        width: p.width || null,
        height: p.height || null,
        position,
        sourceUrl: p.sourceUrl ?? null,
      }))
    )
  })

  revalidatePath("/collection")
  revalidatePath("/map")
  return { ok: true, slug, warnings }
}

export async function updateHotel(hotelId: string, input: HotelFormInput): Promise<ActionResult> {
  const session = await requireSession()
  const existing = await db.query.hotels.findFirst({ where: eq(hotels.id, hotelId), with: { photos: true } })
  if (!existing) return { ok: false, error: "Adresse introuvable." }
  if (existing.createdById !== session.user.id) return { ok: false, error: "Seul l'auteur peut modifier cette adresse." }

  const parsed = hotelFormSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Certains champs sont invalides.", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> }
  }
  const data = parsed.data
  if (data.photos.length === 0) return { ok: false, error: "Conservez au moins une photo." }

  const slug =
    existing.name === data.name && existing.city === data.city ? existing.slug : await uniqueSlug(toSlug(data.name, data.city), hotelId)
  const { photos, warnings } = await resolvePhotos(data.photos, `hotels/${hotelId}`, data.sourceUrl)
  if (photos.length === 0) return { ok: false, error: "Aucune photo valide." }

  await db.transaction(async (tx) => {
    await tx
      .update(hotels)
      .set({
        slug,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        city: data.city,
        region: data.region,
        country: data.country,
        countryCode: data.countryCode,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        website: data.website,
        sourceUrl: data.sourceUrl,
        pricePerNight: data.pricePerNight != null ? data.pricePerNight.toFixed(2) : null,
        currency: data.currency.toUpperCase(),
        stayedAt: data.stayedAt,
        rating: data.rating,
        highlights: data.highlights,
        amenities: data.amenities,
        personalNote: data.personalNote,
      })
      .where(eq(hotels.id, hotelId))
    await tx.delete(hotelPhotos).where(eq(hotelPhotos.hotelId, hotelId))
    await tx.insert(hotelPhotos).values(
      photos.map((p, position) => ({
        id: p.id ?? nanoid(12),
        hotelId,
        url: p.url,
        alt: p.alt ?? data.name,
        width: p.width || null,
        height: p.height || null,
        position,
        sourceUrl: p.sourceUrl ?? null,
      }))
    )
  })

  revalidatePath("/collection")
  revalidatePath("/map")
  revalidatePath(`/hotels/${existing.slug}`)
  revalidatePath(`/hotels/${slug}`)
  return { ok: true, slug, warnings }
}

export async function deleteHotel(hotelId: string) {
  const session = await requireSession()
  const deleted = await db
    .delete(hotels)
    .where(and(eq(hotels.id, hotelId), eq(hotels.createdById, session.user.id)))
    .returning({ id: hotels.id })
  if (deleted.length === 0) throw new Error("Suppression refusée")
  revalidatePath("/collection")
  revalidatePath("/map")
  redirect("/collection")
}
