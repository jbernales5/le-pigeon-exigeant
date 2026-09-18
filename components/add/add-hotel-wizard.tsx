"use client"

import * as React from "react"

import { HotelForm, type HotelFormValues } from "@/components/add/hotel-form"
import { SourceStep, type ProviderInfo } from "@/components/add/source-step"
import type { CandidateImage, ExtractionResult, HotelDraft } from "@/lib/hotel-draft"
import type { HotelFormInput } from "@/lib/hotel-form"
import { createHotel } from "@/lib/actions/hotels"

type Step = { kind: "source" } | { kind: "review"; values: HotelFormValues; candidates: CandidateImage[]; warnings: string[] }

function toValues(draft: HotelDraft, sourceUrl: string | null): HotelFormValues {
  return { ...draft, sourceUrl, pricePerNight: null, currency: "EUR", stayedAt: null, rating: null, personalNote: null, photos: [] }
}

export function AddHotelWizard({ providers }: { providers: ProviderInfo[] }) {
  const [step, setStep] = React.useState<Step>({ kind: "source" })

  function onExtracted(result: ExtractionResult) {
    const values = toValues(result.draft, result.sourceUrl || null)
    // Pre-select the first few candidates so the user has something to react to.
    values.photos = result.images.slice(0, 6).map((img) => ({ kind: "remote" as const, url: img.url, alt: img.alt ?? null }))
    setStep({ kind: "review", values, candidates: result.images, warnings: result.warnings })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function onManual(draft: HotelDraft, sourceUrl: string | null) {
    setStep({ kind: "review", values: toValues(draft, sourceUrl), candidates: [], warnings: [] })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col gap-12">
      <ol className="flex flex-wrap items-center gap-3 text-[0.6rem] font-semibold tracking-[0.22em] uppercase sm:gap-4 sm:text-[0.65rem]">
        <li className={step.kind === "source" ? "text-foreground" : "text-muted-foreground"}>1 · Source</li>
        <li className="hidden h-px w-10 bg-border sm:block" />
        <li className={step.kind === "review" ? "text-foreground" : "text-muted-foreground"}>2 · Vérification</li>
        <li className="hidden h-px w-10 bg-border sm:block" />
        <li className="text-muted-foreground">3 · Dans la collection</li>
      </ol>

      {step.kind === "source" ? (
        <SourceStep providers={providers} onExtracted={onExtracted} onManual={onManual} />
      ) : (
        <HotelForm
          key={step.values.sourceUrl ?? "manual"}
          mode="create"
          initial={step.values}
          candidates={step.candidates}
          warnings={step.warnings}
          onBack={() => setStep({ kind: "source" })}
          onSubmit={(values: HotelFormInput) => createHotel(values)}
        />
      )}
    </div>
  )
}
