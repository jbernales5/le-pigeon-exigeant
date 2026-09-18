"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Cancel01Icon, CloudUploadIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { CandidateImage } from "@/lib/hotel-draft"
import type { PhotoInput } from "@/lib/hotel-form"
import { cn } from "@/lib/utils"

type Props = {
  candidates: CandidateImage[]
  selected: PhotoInput[]
  onChange: (photos: PhotoInput[]) => void
}

const keyOf = (p: PhotoInput) => p.url

export function PhotoPicker({ candidates, selected, onChange }: Props) {
  const [uploading, setUploading] = React.useState(false)
  const [broken, setBroken] = React.useState<Set<string>>(new Set())
  const fileRef = React.useRef<HTMLInputElement>(null)
  const selectedUrls = new Set(selected.map(keyOf))

  function toggleCandidate(c: CandidateImage) {
    if (selectedUrls.has(c.url)) onChange(selected.filter((p) => p.url !== c.url))
    else onChange([...selected, { kind: "remote", url: c.url, alt: c.alt ?? null }])
  }
  function remove(url: string) {
    onChange(selected.filter((p) => p.url !== url))
  }
  function makeCover(url: string) {
    const item = selected.find((p) => p.url === url)
    if (!item) return
    onChange([item, ...selected.filter((p) => p.url !== url)])
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const added: PhotoInput[] = []
    for (const file of Array.from(files).slice(0, 12)) {
      const body = new FormData()
      body.set("file", file)
      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) {
        toast.error(`${file.name} : ${data.error ?? "échec"}`)
        continue
      }
      added.push({ kind: "stored", url: data.url, width: data.width, height: data.height, alt: null })
    }
    setUploading(false)
    if (added.length) onChange([...selected, ...added])
  }

  const remaining = candidates.filter((c) => !selectedUrls.has(c.url) && !broken.has(c.url))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow">
            Photos retenues · {selected.length} {selected.length ? "· la première est la couverture" : ""}
          </span>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Spinner data-icon="inline-start" /> : <HugeiconsIcon icon={CloudUploadIcon} strokeWidth={2} data-icon="inline-start" />}
            Téléverser
          </Button>
        </div>
        {selected.length === 0 ? (
          <div className="flex h-32 items-center justify-center border border-dashed text-sm text-muted-foreground">
            Sélectionnez des photos ci-dessous ou téléversez les vôtres.
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {selected.map((p, i) => (
              <li key={p.url} className={cn("group relative aspect-square overflow-hidden bg-muted", i === 0 && "col-span-2 row-span-2")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.alt ?? ""} className="size-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                {i === 0 && <span className="absolute top-2 left-2 bg-background/90 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">Couverture</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {i !== 0 ? (
                    <button type="button" onClick={() => makeCover(p.url)} className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wider text-black uppercase hover:bg-white">
                      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3" /> Couverture
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={() => remove(p.url)} aria-label="Retirer" className="bg-white/90 p-1 text-black hover:bg-white">
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {remaining.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="eyebrow">Photos trouvées sur la page · {remaining.length} — cliquez pour retenir</span>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {remaining.map((c) => (
              <li key={c.url} className="relative aspect-square overflow-hidden bg-muted">
                <button type="button" onClick={() => toggleCandidate(c)} className="group block size-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.url}
                    alt={c.alt ?? ""}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="size-full object-cover opacity-80 transition-all group-hover:scale-105 group-hover:opacity-100"
                    onError={() => setBroken((s) => new Set(s).add(c.url))}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-6" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
