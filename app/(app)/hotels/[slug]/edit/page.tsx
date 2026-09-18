import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { EditHotelForm } from "@/components/add/edit-hotel-form"
import { getHotelBySlug } from "@/lib/hotels"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Modifier" }

export default async function EditHotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [hotel, session] = await Promise.all([getHotelBySlug(slug), requireSession()])
  if (!hotel) notFound()
  if (hotel.createdById !== session.user.id) redirect(`/hotels/${slug}`)

  return (
    <main className="page flex flex-col gap-8 py-8 sm:gap-12 sm:py-12">
      <header className="flex flex-col gap-3">
        <Link href={`/hotels/${hotel.slug}`} className="eyebrow hover:text-foreground">
          ← {hotel.name}
        </Link>
        <h1 className="text-4xl leading-[1.02] sm:text-5xl">Modifier l&apos;adresse</h1>
      </header>
      <EditHotelForm
        hotelId={hotel.id}
        initial={{
          name: hotel.name,
          tagline: hotel.tagline,
          description: hotel.description,
          city: hotel.city,
          region: hotel.region,
          country: hotel.country,
          countryCode: hotel.countryCode,
          address: hotel.address,
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          website: hotel.website,
          highlights: hotel.highlights,
          amenities: hotel.amenities,
          sourceUrl: hotel.sourceUrl,
          pricePerNight: hotel.pricePerNight != null ? Number(hotel.pricePerNight) : null,
          currency: hotel.currency,
          stayedAt: hotel.stayedAt,
          rating: hotel.rating,
          personalNote: hotel.personalNote,
          photos: hotel.photos.map((p) => ({ kind: "stored" as const, id: p.id, url: p.url, width: p.width, height: p.height, alt: p.alt, sourceUrl: p.sourceUrl })),
        }}
      />
    </main>
  )
}
