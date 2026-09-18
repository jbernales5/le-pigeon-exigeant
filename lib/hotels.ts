import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { hotelPhotos, hotels, user } from "@/lib/db/schema"

export type HotelWithMeta = typeof hotels.$inferSelect & {
  photos: (typeof hotelPhotos.$inferSelect)[]
  createdBy: Pick<typeof user.$inferSelect, "id" | "name" | "image">
}

export type HotelFilters = {
  country?: string
  city?: string
  q?: string
}

export async function listHotels(filters: HotelFilters = {}): Promise<HotelWithMeta[]> {
  const conditions = []
  if (filters.country) conditions.push(eq(hotels.country, filters.country))
  if (filters.city) conditions.push(eq(hotels.city, filters.city))
  if (filters.q) {
    const like = `%${filters.q}%`
    conditions.push(or(ilike(hotels.name, like), ilike(hotels.city, like), ilike(hotels.country, like), ilike(hotels.region, like)))
  }
  return db.query.hotels.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(hotels.createdAt)],
    with: {
      photos: { orderBy: [asc(hotelPhotos.position)] },
      createdBy: { columns: { id: true, name: true, image: true } },
    },
  })
}

export async function getHotelBySlug(slug: string): Promise<HotelWithMeta | undefined> {
  return db.query.hotels.findFirst({
    where: eq(hotels.slug, slug),
    with: {
      photos: { orderBy: [asc(hotelPhotos.position)] },
      createdBy: { columns: { id: true, name: true, image: true } },
    },
  })
}

/** Countries → cities with counts, for the filter bar and the landing stats. */
export async function getDestinations() {
  const rows = await db
    .select({
      country: hotels.country,
      countryCode: hotels.countryCode,
      city: hotels.city,
      count: sql<number>`count(*)::int`,
    })
    .from(hotels)
    .groupBy(hotels.country, hotels.countryCode, hotels.city)
    .orderBy(asc(hotels.country), asc(hotels.city))

  const byCountry = new Map<string, { country: string; countryCode: string | null; count: number; cities: { city: string; count: number }[] }>()
  for (const r of rows) {
    const entry = byCountry.get(r.country) ?? { country: r.country, countryCode: r.countryCode, count: 0, cities: [] }
    entry.count += r.count
    entry.cities.push({ city: r.city, count: r.count })
    byCountry.set(r.country, entry)
  }
  return [...byCountry.values()]
}

export async function getStats() {
  const [row] = await db
    .select({
      hotels: sql<number>`count(*)::int`,
      countries: sql<number>`count(distinct ${hotels.country})::int`,
      cities: sql<number>`count(distinct ${hotels.city})::int`,
      members: sql<number>`(select count(*) from "user")::int`,
    })
    .from(hotels)
  return row ?? { hotels: 0, countries: 0, cities: 0, members: 0 }
}

export async function listHotelsForMap() {
  return db.query.hotels.findMany({
    where: and(sql`${hotels.latitude} is not null`, sql`${hotels.longitude} is not null`),
    columns: { id: true, slug: true, name: true, city: true, country: true, latitude: true, longitude: true, pricePerNight: true, currency: true },
    with: { photos: { orderBy: [asc(hotelPhotos.position)], limit: 1 } },
  })
}
