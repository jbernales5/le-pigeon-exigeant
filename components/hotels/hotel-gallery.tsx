"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

import { FadeImage } from "@/components/motion/fade-image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Photo = { id: string; url: string; alt: string | null; width: number | null; height: number | null }

export function HotelGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  const show = (i: number) => {
    setIndex(i)
    setOpen(true)
  }
  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex((i) => (i + 1) % photos.length)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (photos.length === 0) return null
  const [cover, ...rest] = photos
  const side = rest.slice(0, 4)

  return (
    <>
      <div className={cn("grid gap-1.5 sm:gap-2", side.length ? "md:grid-cols-[3fr_2fr]" : "")}>
        <button type="button" onClick={() => show(0)} className="group relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:h-[520px]">
          <FadeImage src={cover.url} alt={cover.alt ?? name} fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.02]" />
        </button>
        {side.length > 0 && (
          <div className={cn("grid gap-1.5 sm:gap-2", side.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {side.map((p, i) => (
              <button key={p.id} type="button" onClick={() => show(i + 1)} className="group relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto">
                <FadeImage src={p.url} alt={p.alt ?? name} fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover transition-[opacity,transform] duration-700 group-hover:scale-[1.03]" />
                {i === side.length - 1 && rest.length > side.length && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold tracking-[0.2em] text-white uppercase">
                    +{rest.length - side.length} photos
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="h-svh max-h-svh w-svw max-w-none! border-0 bg-black/95 p-0 sm:max-w-none">
          <DialogTitle className="sr-only">{name} — photos</DialogTitle>
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6 sm:py-4">
              <span className="eyebrow text-white/70">
                {index + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="p-2 hover:text-primary">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-5" />
              </button>
            </div>
            <div className="relative flex-1">
              <Image key={photos[index].id} src={photos[index].url} alt={photos[index].alt ?? name} fill sizes="100vw" className="object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={prev} aria-label="Précédente" className="absolute top-1/2 left-2 -translate-y-1/2 border border-white/30 p-2.5 text-white hover:bg-white hover:text-black sm:left-4 sm:p-3">
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                  </button>
                  <button type="button" onClick={next} aria-label="Suivante" className="absolute top-1/2 right-2 -translate-y-1/2 border border-white/30 p-2.5 text-white hover:bg-white hover:text-black sm:right-4 sm:p-3">
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 sm:py-4">
              {photos.map((p, i) => (
                <button key={p.id} type="button" onClick={() => setIndex(i)} className={cn("relative h-14 w-20 shrink-0 overflow-hidden border-2 transition-colors", i === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}>
                  <Image src={p.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
