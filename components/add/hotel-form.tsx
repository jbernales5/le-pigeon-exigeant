"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Cancel01Icon, StarIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { PhotoPicker } from "@/components/add/photo-picker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { CandidateImage, HotelDraft } from "@/lib/hotel-draft"
import { CURRENCIES, type ActionResult, type HotelFormInput, type PhotoInput } from "@/lib/hotel-form"
import { cn } from "@/lib/utils"

export type HotelFormValues = HotelDraft & {
  sourceUrl: string | null
  pricePerNight: number | null
  currency: string
  stayedAt: string | null
  rating: number | null
  personalNote: string | null
  photos: PhotoInput[]
}

type Props = {
  initial: HotelFormValues
  candidates: CandidateImage[]
  warnings?: string[]
  mode: "create" | "edit"
  onBack?: () => void
  onSubmit: (values: HotelFormInput) => Promise<ActionResult>
  onDelete?: () => Promise<void>
}

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => String(CURRENT_YEAR - i))
const NONE = "none"

/** Two native-feeling selects (month, year) producing "YYYY-MM"; no free typing, no invalid values. */
function MonthPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [year, month] = value ? value.split("-") : ["", ""]
  const update = (y: string, m: string) => {
    if (!y && !m) return onChange(null)
    onChange(`${y || String(CURRENT_YEAR)}-${m || "01"}`)
  }
  return (
    <div className="grid grid-cols-[1fr_96px] gap-3">
      <Select value={month || NONE} onValueChange={(v) => update(year, v === NONE || v == null ? "" : String(v))}>
        <SelectTrigger className="w-full" aria-label="Mois">
          <SelectValue>{(v: string | null) => (!v || v === NONE ? <span className="text-muted-foreground">Mois</span> : MONTHS[Number(v) - 1])}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>—</SelectItem>
          {MONTHS.map((label, i) => {
            const v = String(i + 1).padStart(2, "0")
            return (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <Select value={year || NONE} onValueChange={(v) => update(v === NONE || v == null ? "" : String(v), month)}>
        <SelectTrigger className="w-full" aria-label="Année">
          <SelectValue>{(v: string | null) => (!v || v === NONE ? <span className="text-muted-foreground">Année</span> : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>—</SelectItem>
          {YEARS.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = React.useState("")
  const commit = () => {
    const v = draft.trim().replace(/,$/, "")
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft("")
  }
  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((t) => (
            <li key={t} className="flex items-center gap-1.5 border border-border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
              {t}
              <button type="button" aria-label={`Retirer ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="text-muted-foreground hover:text-foreground">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commit()
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
      />
    </div>
  )
}

export function HotelForm({ initial, candidates, warnings = [], mode, onBack, onSubmit, onDelete }: Props) {
  const router = useRouter()
  const [values, setValues] = React.useState<HotelFormValues>(initial)
  const [pending, setPending] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  const set = <K extends keyof HotelFormValues>(key: K, v: HotelFormValues[K]) => setValues((s) => ({ ...s, [key]: v }))
  const str = (v: string) => (v.trim() === "" ? null : v)
  const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setErrors({})
    setFormError(null)
    const result = await onSubmit({
      ...values,
      countryCode: values.countryCode ? values.countryCode.toUpperCase() : null,
      website: values.website && !/^https?:\/\//.test(values.website) ? `https://${values.website}` : values.website,
    })
    setPending(false)
    if (!result.ok) {
      setFormError(result.error)
      setErrors(result.fieldErrors ?? {})
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    for (const w of result.warnings) toast.warning(w)
    toast.success(mode === "create" ? "Adresse ajoutée à la collection." : "Adresse mise à jour.")
    router.push(`/hotels/${result.slug}`)
    router.refresh()
  }

  const err = (k: string) => errors[k]?.[0]

  return (
    <form onSubmit={submit} className="flex flex-col gap-10 sm:gap-14">
      {(warnings.length > 0 || formError) && (
        <div className="flex flex-col gap-3">
          {formError && (
            <Alert variant="destructive">
              <AlertTitle>Impossible d&apos;enregistrer</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {warnings.map((w) => (
            <Alert key={w}>
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-6">
        <h2 className="eyebrow font-sans">01 · Les photos</h2>
        <PhotoPicker candidates={candidates} selected={values.photos} onChange={(photos) => set("photos", photos)} />
        {err("photos") && <FieldError>{err("photos")}</FieldError>}
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="eyebrow font-sans">02 · L&apos;adresse</h2>
        <FieldGroup className="gap-7">
          <div className="grid gap-7 md:grid-cols-[2fr_1fr]">
            <Field data-invalid={Boolean(err("name")) || undefined}>
              <FieldLabel htmlFor="name">Nom</FieldLabel>
              <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Aman Tokyo" required className="font-heading text-2xl md:text-2xl" />
              {err("name") && <FieldError>{err("name")}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="website">Site officiel</FieldLabel>
              <Input id="website" value={values.website ?? ""} onChange={(e) => set("website", str(e.target.value))} placeholder="https://" inputMode="url" />
              {err("website") && <FieldError>{err("website")}</FieldError>}
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="tagline">Accroche</FieldLabel>
            <Input id="tagline" value={values.tagline ?? ""} onChange={(e) => set("tagline", str(e.target.value))} placeholder="Un ryokan contemporain suspendu au-dessus de Tokyo" className="italic" />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea id="description" rows={5} value={values.description ?? ""} onChange={(e) => set("description", str(e.target.value))} placeholder="Deux à quatre phrases, sobres et précises." />
          </Field>
          <div className="grid gap-7 md:grid-cols-2">
            <Field>
              <FieldLabel>Ce qui fait la différence</FieldLabel>
              <TagInput value={values.highlights} onChange={(v) => set("highlights", v.slice(0, 8))} placeholder="Ajouter un point fort, Entrée pour valider" />
            </Field>
            <Field>
              <FieldLabel>Prestations</FieldLabel>
              <TagInput value={values.amenities} onChange={(v) => set("amenities", v.slice(0, 20))} placeholder="Spa, Piscine, Plage privée…" />
            </Field>
          </div>
        </FieldGroup>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="eyebrow font-sans">03 · Où</h2>
        <FieldGroup className="gap-7">
          <div className="grid gap-7 md:grid-cols-3">
            <Field data-invalid={Boolean(err("city")) || undefined}>
              <FieldLabel htmlFor="city">Ville</FieldLabel>
              <Input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} required />
              {err("city") && <FieldError>{err("city")}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="region">Région</FieldLabel>
              <Input id="region" value={values.region ?? ""} onChange={(e) => set("region", str(e.target.value))} />
            </Field>
            <div className="grid grid-cols-[1fr_64px] gap-4 sm:grid-cols-[1fr_72px]">
              <Field data-invalid={Boolean(err("country")) || undefined}>
                <FieldLabel htmlFor="country">Pays</FieldLabel>
                <Input id="country" value={values.country} onChange={(e) => set("country", e.target.value)} required />
                {err("country") && <FieldError>{err("country")}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(err("countryCode")) || undefined}>
                <FieldLabel htmlFor="cc">Code</FieldLabel>
                <Input id="cc" value={values.countryCode ?? ""} maxLength={2} onChange={(e) => set("countryCode", str(e.target.value.toUpperCase()))} placeholder="JP" className="uppercase" />
              </Field>
            </div>
          </div>
          <Field>
            <FieldLabel htmlFor="address">Adresse</FieldLabel>
            <Input id="address" value={values.address ?? ""} onChange={(e) => set("address", str(e.target.value))} />
          </Field>
          <div className="grid gap-7 md:grid-cols-2">
            <Field data-invalid={Boolean(err("latitude")) || undefined}>
              <FieldLabel htmlFor="lat">Latitude</FieldLabel>
              <Input id="lat" inputMode="decimal" value={values.latitude ?? ""} onChange={(e) => set("latitude", num(e.target.value))} placeholder="35.6857" />
              {err("latitude") && <FieldError>{err("latitude")}</FieldError>}
            </Field>
            <Field data-invalid={Boolean(err("longitude")) || undefined}>
              <FieldLabel htmlFor="lng">Longitude</FieldLabel>
              <Input id="lng" inputMode="decimal" value={values.longitude ?? ""} onChange={(e) => set("longitude", num(e.target.value))} placeholder="139.7648" />
              {err("longitude") && <FieldError>{err("longitude")}</FieldError>}
            </Field>
          </div>
          <FieldDescription>Sans coordonnées, l&apos;adresse n&apos;apparaîtra pas sur la carte.</FieldDescription>
        </FieldGroup>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="eyebrow font-sans">04 · Votre séjour</h2>
        <FieldGroup className="gap-7">
          <div className="grid gap-7 md:grid-cols-3">
            <Field data-invalid={Boolean(err("pricePerNight")) || undefined}>
              <FieldLabel htmlFor="price">Prix payé par nuit</FieldLabel>
              <div className="flex items-end gap-3">
                <Input id="price" inputMode="decimal" value={values.pricePerNight ?? ""} onChange={(e) => set("pricePerNight", num(e.target.value))} placeholder="850" className="font-heading text-2xl md:text-2xl" />
                <Select value={values.currency} onValueChange={(v) => set("currency", (v as string) ?? "EUR")}>
                  <SelectTrigger className="w-20" aria-label="Devise">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {err("pricePerNight") && <FieldError>{err("pricePerNight")}</FieldError>}
            </Field>
            <Field data-invalid={Boolean(err("stayedAt")) || undefined}>
              <FieldLabel>Mois du séjour</FieldLabel>
              <MonthPicker value={values.stayedAt} onChange={(v) => set("stayedAt", v)} />
              {err("stayedAt") && <FieldError>{err("stayedAt")}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Coup de cœur</FieldLabel>
              <div className="flex h-10 items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n} sur 5`} onClick={() => set("rating", values.rating === n ? null : n)} className="p-0.5">
                    <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className={cn("size-5 transition-colors", values.rating && n <= values.rating ? "fill-primary text-primary" : "text-border hover:text-muted-foreground")} />
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="note">Votre mot, pour les autres pigeons</FieldLabel>
            <Textarea id="note" rows={4} value={values.personalNote ?? ""} onChange={(e) => set("personalNote", str(e.target.value))} placeholder="La chambre à demander, le restaurant à réserver, ce qu'il ne faut pas rater, ce qu'on vous a fait payer trop cher…" />
          </Field>
        </FieldGroup>
      </section>

      <footer className="hairline flex flex-col-reverse items-center justify-between gap-4 pt-8 sm:flex-row">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
              Changer de source
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={async () => {
                if (!confirm("Supprimer définitivement cette adresse ?")) return
                await onDelete()
              }}
            >
              Supprimer
            </Button>
          )}
        </div>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Enregistrement des photos…" : mode === "create" ? "Ajouter à la collection" : "Enregistrer"}
        </Button>
      </footer>
    </form>
  )
}
