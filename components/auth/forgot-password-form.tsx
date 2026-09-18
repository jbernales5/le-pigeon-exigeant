"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

export function ForgotPasswordForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Cette adresse e-mail ne semble pas valide.")
      return
    }
    setPending(true)
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
    setPending(false)
    if (error) {
      setError(error.message || "Impossible d'envoyer le lien pour le moment.")
      return
    }
    // Same answer whether or not the address is a member: no account enumeration.
    setSent(email)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-5">
        <span className="flex size-12 items-center justify-center border border-border text-primary">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-6" />
        </span>
        <p className="font-heading text-2xl leading-snug">Si {sent} est bien dans la volière, un lien vient de partir.</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Il est valable une heure. Pensez aux indésirables si rien n&apos;arrive, ou{" "}
          <button type="button" onClick={() => setSent(null)} className="text-foreground underline underline-offset-4 hover:text-primary">
            réessayez avec une autre adresse
          </button>
          .
        </p>
        <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="email">Adresse e-mail du compte</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={defaultEmail} placeholder="vous@exemple.com" required autoFocus />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" disabled={pending} className="w-full justify-between">
        {pending ? <Spinner /> : <span>Recevoir le lien</span>}
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Finalement, il vous revient ?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
