"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkCircle02Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import { requestAccess, type AccessRequestResult } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

export function AccessRequestDialog({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [result, setResult] = React.useState<AccessRequestResult | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending(true)
    const res = await requestAccess({
      name: form.get("name"),
      email: form.get("email"),
      message: form.get("message") || undefined,
      website: form.get("website") || undefined,
    })
    setPending(false)
    setResult(res)
    if (res.ok) setDone(true)
  }

  const err = (k: string) => (result && !result.ok ? result.fieldErrors?.[k]?.[0] : undefined)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setTimeout(() => { setDone(false); setResult(null) }, 300)
      }}
    >
      <DialogTrigger render={<Button variant="outline" className="w-full justify-between" />}>
        Je n&apos;ai pas de code : solliciter un accès
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
      </DialogTrigger>
      <DialogContent className="w-[min(92vw,34rem)] p-8 sm:max-w-[34rem] sm:p-10">
        {done ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <span className="flex size-12 items-center justify-center border border-border text-primary">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-6" />
            </span>
            <DialogTitle className="font-heading text-3xl leading-tight font-normal normal-case tracking-tight">Votre demande est arrivée à bon port.</DialogTitle>
            <DialogDescription className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Un e-mail de confirmation part vers votre boîte. Un pigeon lit chaque demande à la main, comptez quelques jours. Le temps d&apos;un café,
              parfois deux.
            </DialogDescription>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
            <DialogHeader className="items-start gap-3 text-left">
              <span className="flex size-10 items-center justify-center border border-border text-primary">
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="size-5" />
              </span>
              <span className="eyebrow">Solliciter un accès</span>
              <DialogTitle className="font-heading text-3xl leading-tight font-normal normal-case tracking-tight">Frapper à la porte de la volière.</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Pas de code d&apos;invitation ? Laissez-nous un mot. Nous lisons tout, à la main, et nous répondons à chacun.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="gap-6">
              <Field data-invalid={Boolean(err("name")) || undefined}>
                <FieldLabel htmlFor="ar-name">Prénom, ou vos deux prénoms</FieldLabel>
                <Input id="ar-name" name="name" autoComplete="name" placeholder="Camille & Louis" required autoFocus />
                {err("name") && <FieldError>{err("name")}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(err("email")) || undefined}>
                <FieldLabel htmlFor="ar-email">Adresse e-mail</FieldLabel>
                <Input id="ar-email" name="email" type="email" autoComplete="email" defaultValue={defaultEmail} placeholder="vous@exemple.com" required />
                {err("email") && <FieldError>{err("email")}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(err("message")) || undefined}>
                <FieldLabel htmlFor="ar-message">Un mot pour nous</FieldLabel>
                <Textarea id="ar-message" name="message" rows={3} placeholder="Qui vous a parlé de nous, ou l'adresse qui vous a le plus marqué ces dernières années…" />
                <FieldDescription>Facultatif, mais les pigeons parrainés passent devant.</FieldDescription>
                {err("message") && <FieldError>{err("message")}</FieldError>}
              </Field>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            </FieldGroup>

            {result && !result.ok && !result.fieldErrors && <FieldError>{result.error}</FieldError>}

            <Button type="submit" size="lg" disabled={pending} className="w-full justify-between">
              {pending ? <Spinner /> : <span>Envoyer ma demande</span>}
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
