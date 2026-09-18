import type { Metadata } from "next"

import { HotelMap } from "@/components/hotels/hotel-map"
import { getStats, listHotelsForMap } from "@/lib/hotels"

export const metadata: Metadata = { title: "Carte du monde" }

export default async function MapPage() {
  const [hotels, stats] = await Promise.all([listHotelsForMap(), getStats()])
  return (
    <main className="flex h-[calc(100svh-3.5rem-3.5rem)] flex-col md:h-[calc(100svh-4rem)]">
      <div className="page flex items-end justify-between gap-6 py-4 sm:py-6">
        <div>
          <span className="eyebrow">Carte du monde</span>
          <h1 className="mt-1 text-3xl leading-none sm:text-4xl">
            {stats.hotels} adresse{stats.hotels > 1 ? "s" : ""} dans {stats.countries} pays
          </h1>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground sm:block">
          Faites tourner le globe, cliquez sur une photo. Chaque point est un pigeon qui a très bien dormi.
        </p>
      </div>
      <HotelMap hotels={hotels} className="flex-1" globe />
    </main>
  )
}
