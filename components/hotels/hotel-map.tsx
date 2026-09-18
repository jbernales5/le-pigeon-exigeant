"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre"

import "maplibre-gl/dist/maplibre-gl.css"

import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export type MapHotel = {
  id: string
  slug: string
  name: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  pricePerNight: string | null
  currency: string
  photos: { url: string; alt: string | null }[]
}

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
}

type Props = {
  hotels: MapHotel[]
  className?: string
  /** Single-hotel mode: locks the view on that hotel. */
  focus?: { latitude: number; longitude: number; zoom?: number }
  interactive?: boolean
  /** Render the world as a globe (portrait-friendly, and simply more beautiful). */
  globe?: boolean
}

export function HotelMap({ hotels, className, focus, interactive = true, globe = false }: Props) {
  const { resolvedTheme } = useTheme()
  const mapRef = React.useRef<MapRef>(null)
  const [selected, setSelected] = React.useState<MapHotel | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const points = hotels.filter((h) => h.latitude != null && h.longitude != null)

  const bounds = React.useMemo(() => {
    if (points.length < 2) return null
    const lats = points.map((p) => p.latitude!)
    const lngs = points.map((p) => p.longitude!)
    return [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ] as [[number, number], [number, number]]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initialViewState = React.useMemo(() => {
    if (focus) return { latitude: focus.latitude, longitude: focus.longitude, zoom: focus.zoom ?? 12 }
    if (points.length === 0) return { latitude: 30, longitude: 10, zoom: 1.4 }
    if (points.length === 1) return { latitude: points[0].latitude!, longitude: points[0].longitude!, zoom: 5 }
    // Centre of the collection; the real framing happens in onLoad (fitBounds / globe).
    const [[w, s], [e, n]] = bounds!
    return { latitude: (s + n) / 2, longitude: (w + e) / 2, zoom: 1 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLoad = React.useCallback(
    (e: { target: import("maplibre-gl").Map }) => {
      const map = e.target
      setLoaded(true)
      if (globe) {
        map.setProjection({ type: "globe" })
        // On a globe the whole world fits even in portrait: frame the collection loosely.
        if (bounds) map.fitBounds(bounds, { padding: 60, maxZoom: 4, duration: 0 })
        else if (!focus && points.length <= 1) map.jumpTo({ zoom: 1 })
        return
      }
      if (bounds && !focus) {
        map.fitBounds(bounds, { padding: window.innerWidth < 640 ? 32 : 80, maxZoom: 6, duration: 0 })
      }
    },
    [globe, bounds, focus, points.length]
  )

  return (
    <div
      data-loaded={loaded}
      className={cn(
        "relative overflow-hidden bg-muted transition-opacity duration-1000 data-[loaded=false]:opacity-0 [&_.maplibregl-canvas]:outline-none",
        className
      )}
    >
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={resolvedTheme === "dark" ? STYLES.dark : STYLES.light}
        attributionControl={{ compact: true }}
        interactive={interactive}
        style={{ width: "100%", height: "100%" }}
        onClick={() => setSelected(null)}
        onLoad={onLoad}
      >
        {interactive && <NavigationControl position="top-right" showCompass={false} />}
        {points.map((h) => {
          const cover = h.photos[0]
          const isSelected = selected?.id === h.id
          return (
            <Marker
              key={h.id}
              latitude={h.latitude!}
              longitude={h.longitude!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setSelected(h)
                mapRef.current?.easeTo({ center: [h.longitude!, h.latitude!], duration: 600 })
              }}
            >
              <button
                type="button"
                aria-label={h.name}
                className={cn(
                  "group relative block cursor-pointer transition-transform duration-300 hover:z-10 hover:scale-110",
                  isSelected && "z-10 scale-110"
                )}
              >
                <span
                  className={cn(
                    "block size-11 overflow-hidden rounded-full border-2 bg-background shadow-lg shadow-black/25 transition-colors",
                    isSelected ? "border-primary" : "border-background"
                  )}
                >
                  {cover ? (
                    <Image src={cover.url} alt="" width={44} height={44} className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center bg-primary text-[0.55rem] font-semibold text-primary-foreground">
                      {h.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className={cn("mx-auto block h-2 w-px", isSelected ? "bg-primary" : "bg-background")} />
              </button>
            </Marker>
          )
        })}

        {selected && interactive && (
          <Popup
            latitude={selected.latitude!}
            longitude={selected.longitude!}
            anchor="bottom"
            offset={[0, -60] as [number, number]}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setSelected(null)}
            maxWidth="280px"
          >
            <Link href={`/hotels/${selected.slug}`} className="group block w-64 overflow-hidden border border-border bg-background text-foreground shadow-xl">
              {selected.photos[0] && (
                <span className="relative block aspect-[3/2] w-full overflow-hidden">
                  <Image src={selected.photos[0].url} alt="" fill sizes="260px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </span>
              )}
              <span className="block p-3">
                <span className="eyebrow block">
                  {selected.city} · {selected.country}
                </span>
                <span className="font-heading mt-1 block text-lg leading-tight group-hover:text-primary">{selected.name}</span>
                {formatPrice(selected.pricePerNight, selected.currency) && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatPrice(selected.pricePerNight, selected.currency)} la nuit
                  </span>
                )}
              </span>
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  )
}
