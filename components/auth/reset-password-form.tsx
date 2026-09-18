"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [show, setShow] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password") ?? "")
    const confirm = String(form.get("confirm") ?? "")
    if (password.length < 8) return setError("Huit caractères minimum. Un pigeon exigeant ne transige pas là-dessus.")
    if (password !== confirm) return setError("Les deux mots de passe ne sont pas identiques.")
    setPending(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setPending(false)
    if (error) {
      setError(
        error.code === "INVALID_TOKEN" || /token/i.test(error.message ?? "")
          ? "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau."
          : error.message || "Impossible de changer le mot de passe."
      )
      return
    }
    toast.success("Nouveau mot de passe enregistré. Bon retour, cher pigeon.")
    router.replace("/login")
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <FieldGroup className="gap-7">
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
          <InputGroup>
            <InputGroupInput id="password" name="password" type={show ? "text" : "password"} autoComplete="new-password" placeholder="8 caractères minimum" required autoFocus />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" variant="ghost" size="icon-xs" aria-label={show ? "Masquer" : "Afficher"} onClick={() => setShow((v) => !v)}>
                <HugeiconsIcon icon={show ? ViewOffIcon : ViewIcon} strokeWidth={2} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>Toutes vos sessions ouvertes seront fermées, par sécurité.</FieldDescription>
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="confirm">Confirmer</FieldLabel>
          <InputGroup>
            <InputGroupInput id="confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" placeholder="Le même, sans faute de frappe" required />
          </InputGroup>
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" disabled={pending} className="w-full justify-between">
        {pending ? <Spinner /> : <span>Enregistrer et rentrer</span>}
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-foreground underline underline-offset-4 hover:text-primary">
          Demander un nouveau lien
        </Link>
      </p>
    </form>
  )
}
