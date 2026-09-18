"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiMagicIcon, ArrowRight01Icon, DropletIcon, Link01Icon, Location01Icon, Search01Icon, SparklesIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/add/confirm-dialog"
import { ProgressOverlay } from "@/components/add/progress-overlay"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { emptyDraft, type ExtractionResult, type HotelDraft } from "@/lib/hotel-draft"
import type { HotelCandidate, SearchProvider } from "@/lib/search/types"
import { flagEmoji } from "@/lib/format"
import { cn } from "@/lib/utils"

export type ProviderInfo = { id: SearchProvider; label: string; hint: string; enabled: boolean }

type Props = {
  providers: ProviderInfo[]
  onExtracted: (result: ExtractionResult) => void
  onManual: (draft: HotelDraft, sourceUrl: string | null) => void
}

const EXTRACT_STEPS = [
  "Ouverture de la page…",
  "Lecture des métadonnées et du texte…",
  "L'IA rédige une description soignée…",
  "Repérage des plus belles photos…",
  "Géolocalisation de l'adresse…",
  "Dernières retouches…",
]
const RESOLVE_STEPS = ["Recherche du site officiel…", ...EXTRACT_STEPS]
const AI_SEARCH_STEPS = ["Interrogation du web…", "Tri des résultats les plus plausibles…", "Vérification des sites officiels…", "Mise en forme…"]

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "Opération impossible")
  return data as T
}

export function SourceStep({ providers, onExtracted, onManual }: Props) {
  const aiEnabled = providers.some((p) => p.id === "ai" && p.enabled)
  return (
    <Tabs defaultValue="url" className="gap-8">
      <TabsList variant="line" className="h-auto w-full justify-start gap-4 border-b border-border p-0 sm:gap-6">
        <TabsTrigger value="url" className="h-auto flex-none px-0 pb-3 text-[0.65rem] tracking-[0.15em] sm:text-[0.7rem] sm:tracking-[0.2em]">
          <HugeiconsIcon icon={Link01Icon} strokeWidth={2} data-icon="inline-start" className="hidden sm:inline" />
          Depuis un lien
        </TabsTrigger>
        <TabsTrigger value="search" className="h-auto flex-none px-0 pb-3 text-[0.65rem] tracking-[0.15em] sm:text-[0.7rem] sm:tracking-[0.2em]">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} data-icon="inline-start" className="hidden sm:inline" />
          Par le nom
        </TabsTrigger>
        <TabsTrigger value="manual" className="h-auto flex-none px-0 pb-3 text-[0.65rem] tracking-[0.15em] sm:text-[0.7rem] sm:tracking-[0.2em]">
          À la main
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url">
        <UrlTab onExtracted={onExtracted} aiEnabled={aiEnabled} />
      </TabsContent>
      <TabsContent value="search">
        <SearchTab providers={providers} aiEnabled={aiEnabled} onExtracted={onExtracted} />
      </TabsContent>
      <TabsContent value="manual">
        <div className="flex flex-col gap-6">
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Vous préférez tout renseigner vous-même ? Vous pourrez téléverser vos propres photos à l&apos;étape suivante.
          </p>
          <Button variant="outline" onClick={() => onManual(emptyDraft, null)} className="w-fit">
            Commencer une fiche vierge
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

/* -------------------------------------------------------------------------- */

function UrlTab({ onExtracted, aiEnabled }: { onExtracted: (r: ExtractionResult) => void; aiEnabled: boolean }) {
  const [url, setUrl] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    let target = url.trim()
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`
    try {
      new URL(target)
    } catch {
      setError("Ce lien ne semble pas valide.")
      return
    }
    setPending(true)
    try {
      const result = await postJson<ExtractionResult>("/api/extract", { url: target })
      toast.success(result.mode === "ai" ? "Fiche préparée par l'IA." : "Fiche préparée depuis la page.")
      onExtracted(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPending(false)
    }
  }

  let host = ""
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "")
  } catch {
    host = url
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <ProgressOverlay open={pending} title={host || "Votre adresse"} steps={aiEnabled ? EXTRACT_STEPS : EXTRACT_STEPS.filter((s) => !s.includes("IA"))} />
      <Field>
        <FieldLabel htmlFor="url">Lien de l&apos;hôtel</FieldLabel>
        <InputGroup className="h-12">
          <InputGroupAddon>
            <HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.hotel-exemple.com" inputMode="url" autoComplete="off" autoFocus className="text-base" />
        </InputGroup>
        <FieldDescription>
          Site officiel de préférence. Un agent IA lit la page, en extrait le nom, la localisation, une description soignée et les photos.
        </FieldDescription>
      </Field>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Impossible d&apos;analyser ce lien</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={pending || !url.trim()} className="w-fit">
        {pending ? <Spinner data-icon="inline-start" /> : <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} data-icon="inline-start" />}
        {pending ? "Lecture de la page…" : "Analyser avec l'IA"}
      </Button>
    </form>
  )
}

/* -------------------------------------------------------------------------- */

function SearchTab({ providers, aiEnabled, onExtracted }: { providers: ProviderInfo[]; aiEnabled: boolean; onExtracted: (r: ExtractionResult) => void }) {
  const [provider, setProvider] = React.useState<SearchProvider>("photon")
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<HotelCandidate[] | null>(null)
  const [searching, setSearching] = React.useState(false)
  const [aiSearching, setAiSearching] = React.useState(false)
  const [confirmAi, setConfirmAi] = React.useState(false)
  const [pendingPick, setPendingPick] = React.useState<HotelCandidate | null>(null)
  const [resolving, setResolving] = React.useState<HotelCandidate | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function runSearch() {
    if (query.trim().length < 2) return
    setError(null)
    const isAi = provider === "ai"
    if (isAi) setAiSearching(true)
    else setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&provider=${provider}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Recherche impossible")
      setResults(data.results as HotelCandidate[])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSearching(false)
      setAiSearching(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (provider === "ai") setConfirmAi(true)
    else runSearch()
  }

  // OpenStreetMap is free and instant: search as you type. AI / Google: explicit submit.
  React.useEffect(() => {
    if (provider !== "photon" || query.trim().length < 3) return
    const t = setTimeout(() => runSearch(), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, provider])

  async function resolve(c: HotelCandidate) {
    setResolving(c)
    setError(null)
    try {
      const result = await postJson<ExtractionResult>("/api/resolve", c)
      if (result.images.length > 0) toast.success(result.mode === "ai" ? "Fiche préparée par l'IA depuis le site officiel." : "Fiche préparée depuis le site officiel.")
      onExtracted(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setResolving(null)
    }
  }

  const current = providers.find((p) => p.id === provider)

  return (
    <div className="flex flex-col gap-6">
      <ProgressOverlay open={aiSearching} title={`« ${query.trim()} »`} steps={AI_SEARCH_STEPS} cadence={3200} />
      <ProgressOverlay open={resolving !== null} title={resolving?.name ?? ""} steps={aiEnabled ? RESOLVE_STEPS : RESOLVE_STEPS.filter((s) => !s.includes("IA"))} />

      <ConfirmDialog
        open={confirmAi}
        onOpenChange={setConfirmAi}
        icon={DropletIcon}
        eyebrow="Un instant de sobriété"
        title="Évaporer un demi-litre d'eau pour cette recherche ?"
        description={
          <>
            Une recherche IA avec navigation web, c&apos;est à peu près une petite bouteille d&apos;eau et l&apos;électricité d&apos;un grille-pain pendant quelques
            secondes. OpenStreetMap est juste à côté : gratuit, sobre, et souvent suffisant.
            <br />
            <br />
            Si l&apos;hôtel reste introuvable ou que l&apos;orthographe vous échappe, allez-y. On ne jugera pas (trop).
          </>
        }
        cancelLabel="Rester sobre"
        confirmLabel="Oui, j'assume"
        onConfirm={runSearch}
      />

      <ConfirmDialog
        open={pendingPick !== null}
        onOpenChange={(open) => !open && setPendingPick(null)}
        icon={SparklesIcon}
        eyebrow="Préparer la fiche"
        title={pendingPick?.name ?? ""}
        description={
          aiEnabled ? (
            <>
              L&apos;agent va chercher le site officiel de cette adresse, lire la page, en extraire une description soignée, la localisation et les
              photos, puis vous laisser vérifier et compléter avant publication. Une vingtaine de secondes, tout au plus.
            </>
          ) : (
            <>
              L&apos;agent va chercher le site officiel de cette adresse et en extraire les métadonnées et les photos. Sans clé OpenAI, la description
              restera à rédiger : vous pourrez tout compléter à l&apos;étape suivante.
            </>
          )
        }
        cancelLabel="Annuler"
        confirmLabel="Lancer l'extraction"
        onConfirm={() => pendingPick && resolve(pendingPick)}
      />

      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.enabled}
            onClick={() => {
              setProvider(p.id)
              setResults(null)
              setError(null)
            }}
            title={p.enabled ? p.hint : `${p.hint} (non configuré)`}
            className={cn(
              "border px-3 py-1.5 text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              provider === p.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {p.id === "ai" && <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className="mr-1.5 inline size-3" />}
            {p.label}
          </button>
        ))}
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">{current?.hint}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="flex-1">
          <FieldLabel htmlFor="q">Nom de l&apos;hôtel, ville…</FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>{searching ? <Spinner /> : <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />}</InputGroupAddon>
            <InputGroupInput id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Aman Tokyo, Le Sirenuse Positano, riad Marrakech…" autoComplete="off" className="text-base" />
          </InputGroup>
        </Field>
        <Button type="submit" size="lg" disabled={searching || query.trim().length < 2} variant={provider === "ai" ? "default" : "outline"}>
          {provider === "ai" && <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} data-icon="inline-start" />}
          {provider === "ai" ? "Rechercher avec l'IA" : "Rechercher"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Quelque chose a résisté</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground">
          Aucun résultat. Précisez la ville, essayez {aiEnabled && provider !== "ai" ? "la recherche IA, " : ""}ou collez directement le lien du site.
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="divide-y divide-border border-y border-border">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setPendingPick(c)}
                disabled={resolving !== null}
                className="group flex w-full items-center justify-between gap-6 py-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-60"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-heading truncate text-xl leading-tight transition-colors group-hover:text-primary">{c.name}</span>
                  <span className="eyebrow flex items-center gap-1.5">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="size-3" />
                    {[flagEmoji(c.countryCode), c.city, c.region, c.country].filter(Boolean).join(" · ") || c.address || "Localisation inconnue"}
                  </span>
                  {c.description && c.description !== "hotel" && <span className="line-clamp-1 text-sm text-muted-foreground">{c.description}</span>}
                  {c.website && <span className="truncate text-xs text-muted-foreground/70">{c.website.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
