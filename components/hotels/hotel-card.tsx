import Link from "next/link"

import { FadeImage } from "@/components/motion/fade-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { flagEmoji, formatPrice, initials } from "@/lib/format"
import type { HotelWithMeta } from "@/lib/hotels"
import { cn } from "@/lib/utils"

export function HotelCard({ hotel, priority = false, className }: { hotel: HotelWithMeta; priority?: boolean; className?: string }) {
  const cover = hotel.photos[0]
  const price = formatPrice(hotel.pricePerNight, hotel.currency)
  return (
    <Link href={`/hotels/${hotel.slug}`} className={cn("group flex flex-col gap-4", className)}>
      <figure className="relative aspect-[4/5] overflow-hidden bg-muted">
        {cover ? (
          <FadeImage
            src={cover.url}
            alt={cover.alt ?? hotel.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">—</div>
        )}
        {price && (
          <span className="absolute top-2 left-2 bg-background/90 px-2 py-1 text-[0.6rem] font-semibold tracking-[0.15em] uppercase backdrop-blur sm:top-3 sm:left-3 sm:px-2.5 sm:text-[0.65rem]">
            {price} <span className="text-muted-foreground">/ nuit</span>
          </span>
        )}
        {hotel.photos.length > 1 && (
          <span className="absolute right-3 bottom-3 bg-black/50 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.2em] text-white uppercase">
            {hotel.photos.length} photos
          </span>
        )}
      </figure>
      <figcaption className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow truncate">
            {flagEmoji(hotel.countryCode)} {hotel.city} · {hotel.country}
          </p>
          <h3 className="mt-1 truncate text-xl leading-tight transition-colors group-hover:text-primary sm:text-2xl">{hotel.name}</h3>
          {hotel.tagline && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{hotel.tagline}</p>}
        </div>
        <Avatar className="hidden size-7 shrink-0 border border-border sm:flex" title={`Plumé et ravi : ${hotel.createdBy.name}`}>
          {hotel.createdBy.image ? <AvatarImage src={hotel.createdBy.image} alt={hotel.createdBy.name} /> : null}
          <AvatarFallback className="bg-secondary text-[0.6rem] font-semibold">{initials(hotel.createdBy.name)}</AvatarFallback>
        </Avatar>
      </figcaption>
    </Link>
  )
}
