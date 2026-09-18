"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { signUp } from "@/lib/auth-client"

import { verifyInviteCode } from "@/app/(auth)/actions"

export function RegisterForm({ inviteRequired }: { inviteRequired: boolean }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    const invite = String(form.get("invite") ?? "").trim()

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    setPending(true)
    if (inviteRequired) {
      const ok = await verifyInviteCode(invite)
      if (!ok) {
        setPending(false)
        setError("Code d'invitation invalide.")
        return
      }
    }
    const { error } = await signUp.email({ name, email, password })
    setPending(false)
    if (error) {
      setError(error.message || "Inscription impossible.")
      return
    }
    toast.success("Bienvenue dans la volière.")
    router.replace("/collection")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <FieldGroup className="gap-7">
        <Field>
          <FieldLabel htmlFor="name">Prénom, ou vos deux prénoms</FieldLabel>
          <Input id="name" name="name" autoComplete="name" placeholder="Camille & Louis" required autoFocus />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="8 caractères minimum" required />
          {inviteRequired ? null : error ? <FieldError>{error}</FieldError> : null}
        </Field>
        {inviteRequired && (
          <Field data-invalid={Boolean(error) || undefined}>
            <FieldLabel htmlFor="invite">Code d&apos;invitation</FieldLabel>
            <Input id="invite" name="invite" placeholder="Transmis par un membre" required />
            <FieldDescription>La volière est réservée aux invités. Un pigeon ne rentre jamais seul.</FieldDescription>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        )}
      </FieldGroup>

      <Button type="submit" size="lg" disabled={pending} className="w-full justify-between">
        {pending ? <Spinner /> : <span>Rejoindre la volière</span>}
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà membre ?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
