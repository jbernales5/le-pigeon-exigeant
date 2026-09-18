"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { flagEmoji } from "@/lib/format"
import { cn } from "@/lib/utils"

type Destination = { country: string; countryCode: string | null; count: number; cities: { city: string; count: number }[] }

export function DestinationFilters({ destinations, total }: { destinations: Destination[]; total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const country = params.get("country")
  const city = params.get("city")
  const q = params.get("q") ?? ""
  const [query, setQuery] = React.useState(q)

  const push = React.useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v)
        else sp.delete(k)
      }
      router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false })
    },
    [params, pathname, router]
  )

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (query !== q) push({ q: query || null })
    }, 250)
    return () => clearTimeout(t)
  }, [query, q, push])

  const selected = destinations.find((d) => d.country === country)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <button
            type="button"
            onClick={() => push({ country: null, city: null })}
            className={cn(
              "text-xs font-semibold tracking-[0.2em] uppercase transition-colors",
              !country ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tout <span className="text-muted-foreground">({total})</span>
          </button>
          {destinations.map((d) => (
            <React.Fragment key={d.country}>
              <span className="text-muted-foreground/40">·</span>
              <button
                type="button"
                onClick={() => push({ country: d.country === country ? null : d.country, city: null })}
                className={cn(
                  "text-xs font-semibold tracking-[0.2em] uppercase transition-colors",
                  d.country === country ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {flagEmoji(d.countryCode)} {d.country} <span className="text-muted-foreground">({d.count})</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Un nom, une ville, un pays…"
            aria-label="Rechercher dans la collection"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer" className="text-muted-foreground hover:text-foreground">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {selected && selected.cities.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {selected.cities.map((c) => (
            <button
              key={c.city}
              type="button"
              onClick={() => push({ city: c.city === city ? null : c.city })}
              className={cn(
                "border px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition-colors",
                c.city === city ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {c.city} <span className="opacity-60">{c.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
