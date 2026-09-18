"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { signIn } from "@/lib/auth-client"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/collection"
  const [pending, setPending] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    setPending(true)
    const { error } = await signIn.email({ email, password, rememberMe: true })
    setPending(false)
    if (error) {
      setError(error.message === "Invalid email or password" ? "Identifiants incorrects." : error.message || "Connexion impossible.")
      return
    }
    toast.success("Heureux de vous revoir, cher pigeon.")
    router.replace(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <FieldGroup className="gap-7">
        <Field>
          <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required autoFocus />
        </Field>
        <Field data-invalid={Boolean(error) || undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Link href="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Oublié ?
            </Link>
          </div>
          <InputGroup>
            <InputGroupInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••"
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} strokeWidth={2} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={pending} className="w-full justify-between">
        {pending ? <Spinner /> : <span>Entrer</span>}
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore membre ?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary">
          Demander l&apos;accès
        </Link>
      </p>
    </form>
  )
}
