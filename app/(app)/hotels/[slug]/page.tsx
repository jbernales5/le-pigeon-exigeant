import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, Calendar03Icon, Edit02Icon, Location01Icon, StarIcon, Wallet01Icon } from "@hugeicons/core-free-icons"

import { HotelGallery } from "@/components/hotels/hotel-gallery"
import { HotelMap } from "@/components/hotels/hotel-map"
import { Reveal } from "@/components/motion/reveal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { flagEmoji, formatPrice, formatStayedAt, initials } from "@/lib/format"
import { getHotelBySlug } from "@/lib/hotels"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)
  if (!hotel) return { title: "Adresse introuvable" }
  return {
    title: hotel.name,
    description: hotel.tagline ?? hotel.description ?? undefined,
    openGraph: { images: hotel.photos[0] ? [hotel.photos[0].url] : [] },
  }
}

export default async function HotelPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const [hotel, session] = await Promise.all([getHotelBySlug(slug), getSession()])
  if (!hotel) notFound()
  const isOwner = session?.user.id === hotel.createdById
  const price = formatPrice(hotel.pricePerNight, hotel.currency)
  const stayed = formatStayedAt(hotel.stayedAt)
  const hasCoords = hotel.latitude != null && hotel.longitude != null

  return (
    <main className="page flex flex-col gap-8 py-6 sm:gap-12 sm:py-10">
      <nav className="flex items-center justify-between">
        <Link href="/collection" className="eyebrow hover:text-foreground">
          ← Collection
        </Link>
        {isOwner && (
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/hotels/${hotel.slug}/edit`} />}>
            <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} data-icon="inline-start" />
            Modifier
          </Button>
        )}
      </nav>

      <header className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">
            {flagEmoji(hotel.countryCode)} {hotel.city}
            {hotel.region ? ` · ${hotel.region}` : ""} · {hotel.country}
          </p>
          <h1 className="mt-3 text-4xl leading-[1.02] sm:text-6xl lg:text-7xl">{hotel.name}</h1>
          {hotel.tagline && <p className="mt-3 max-w-2xl text-base text-muted-foreground italic sm:mt-4 sm:text-lg">{hotel.tagline}</p>}
        </div>
        <div className="flex items-center gap-3 md:justify-end">
          <Avatar className="size-10 border border-border">
            {hotel.createdBy.image ? <AvatarImage src={hotel.createdBy.image} alt={hotel.createdBy.name} /> : null}
            <AvatarFallback className="bg-secondary text-xs font-semibold">{initials(hotel.createdBy.name)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="eyebrow">Plumé et ravi</p>
            <p className="font-medium">{hotel.createdBy.name}</p>
          </div>
        </div>
      </header>

      <HotelGallery photos={hotel.photos} name={hotel.name} />

      <section className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
        <article className="flex flex-col gap-10">
          {hotel.description && (
            <Reveal className="max-w-2xl">
              <h2 className="eyebrow mb-4 font-sans">L&apos;adresse</h2>
              <p className="text-base leading-relaxed whitespace-pre-line sm:text-lg">{hotel.description}</p>
            </Reveal>
          )}

          {hotel.personalNote && (
            <Reveal delay={80} className="max-w-2xl border-l-2 border-primary pl-5 sm:pl-6">
              <h2 className="eyebrow mb-3 font-sans">Le mot de {hotel.createdBy.name}</h2>
              <p className="font-heading text-xl leading-snug whitespace-pre-line sm:text-2xl">{hotel.personalNote}</p>
            </Reveal>
          )}

          {hotel.highlights.length > 0 && (
            <Reveal delay={120}>
              <h2 className="eyebrow mb-4 font-sans">Ce qui fait la différence</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {hotel.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 border-t border-border pt-3 text-sm">
                    <span className="mt-1 size-1.5 shrink-0 bg-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {hotel.amenities.length > 0 && (
            <Reveal delay={160}>
              <h2 className="eyebrow mb-4 font-sans">Prestations</h2>
              <ul className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <li key={a} className="border border-border px-3 py-1 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </article>

        <Reveal delay={120} className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <dl className="divide-y divide-border border-y border-border">
            <div className="flex items-center justify-between py-4">
              <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} className="size-4" />
                Le prix du pigeon / nuit
              </dt>
              <dd className="font-heading text-2xl">{price ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
                Séjour
              </dt>
              <dd className="text-sm">{stayed ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-4" />
                Coup de cœur
              </dt>
              <dd className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <HugeiconsIcon
                    key={n}
                    icon={StarIcon}
                    strokeWidth={1.5}
                    className={cn("size-4", hotel.rating && n <= hotel.rating ? "fill-primary text-primary" : "text-border")}
                  />
                ))}
              </dd>
            </div>
            {hotel.address && (
              <div className="flex items-start justify-between gap-4 py-4">
                <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                  <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="size-4" />
                  Adresse
                </dt>
                <dd className="text-right text-sm">{hotel.address}</dd>
              </div>
            )}
          </dl>

          {hasCoords && (
            <HotelMap
              hotels={[{ ...hotel, photos: hotel.photos.slice(0, 1) }]}
              focus={{ latitude: hotel.latitude!, longitude: hotel.longitude!, zoom: 11 }}
              interactive={false}
              className="aspect-[4/3]"
            />
          )}

          {hotel.website && (
            <Button variant="outline" className="w-full justify-between" nativeButton={false} render={<a href={hotel.website} target="_blank" rel="noopener noreferrer" />}>
              Site officiel
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} data-icon="inline-end" />
            </Button>
          )}
          {hotel.sourceUrl && hotel.sourceUrl !== hotel.website && (
            <a href={hotel.sourceUrl} target="_blank" rel="noopener noreferrer" className="truncate text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
              Source : {new URL(hotel.sourceUrl).hostname.replace(/^www\./, "")}
            </a>
          )}
        </Reveal>
      </section>
    </main>
  )
}
