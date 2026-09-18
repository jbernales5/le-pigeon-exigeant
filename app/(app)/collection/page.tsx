import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Hotel01Icon } from "@hugeicons/core-free-icons"

import { DestinationFilters } from "@/components/hotels/destination-filters"
import { HotelCard } from "@/components/hotels/hotel-card"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { getDestinations, getStats, listHotels } from "@/lib/hotels"

export const metadata: Metadata = { title: "Collection" }

type Search = { country?: string; city?: string; q?: string }

export default async function CollectionPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams
  const [hotels, destinations, stats] = await Promise.all([listHotels(filters), getDestinations(), getStats()])
  const filtered = Boolean(filters.country || filters.city || filters.q)

  return (
    <main className="page flex flex-col gap-8 py-8 sm:gap-12 sm:py-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="eyebrow">La collection</span>
          <h1 className="mt-3 text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
            {stats.hotels} adresse{stats.hotels > 1 ? "s" : ""}, {stats.countries} pays,{" "}
            <span className="italic text-primary">zéro algorithme.</span>
          </h1>
        </div>
        <dl className="flex gap-8 text-sm sm:gap-10">
          <div>
            <dt className="eyebrow">Villes</dt>
            <dd className="mt-1 font-heading text-2xl sm:text-3xl">{stats.cities}</dd>
          </div>
          <div>
            <dt className="eyebrow">Pigeons</dt>
            <dd className="mt-1 font-heading text-2xl sm:text-3xl">{stats.members}</dd>
          </div>
        </dl>
      </header>

      <Suspense>
        <DestinationFilters destinations={destinations} total={stats.hotels} />
      </Suspense>

      {hotels.length === 0 ? (
        <Empty className="border border-dashed py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Hotel01Icon} strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-3xl">{filtered ? "Rien par ici." : "La volière est encore vide."}</EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Aucune adresse ne correspond à ces filtres. Élargissez la recherche, ou soyez le premier à recommander cette destination."
                : "Le premier pigeon à parler ouvre le bal : collez le lien de l'hôtel, l'agent prépare la fiche, vous confessez la note."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/add" />}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              Ajouter une adresse
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <section className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          {hotels.map((h, i) => (
            <Reveal key={h.id} delay={(i % 4) * 70}>
              <HotelCard hotel={h} priority={i < 4} />
            </Reveal>
          ))}
        </section>
      )}
    </main>
  )
}
