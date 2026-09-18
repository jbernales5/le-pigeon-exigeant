import type { Metadata } from "next"
import Link from "next/link"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false, follow: false } }

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams
  const invalid = !token || Boolean(error)

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow">Espace membres</span>
        <h1 className="text-4xl leading-none sm:text-5xl">{invalid ? "Ce lien ne vole plus." : "Un nouveau mot de passe."}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {invalid
            ? "Il a expiré, a déjà servi, ou a été abîmé en route. Rien de grave : demandez-en un autre, il arrive en quelques secondes."
            : "Choisissez-le soigné et mémorable, comme une bonne adresse."}
        </p>
      </header>
      {invalid ? (
        <Button size="lg" className="w-full sm:w-auto" nativeButton={false} render={<Link href="/forgot-password" />}>
          Demander un nouveau lien
        </Button>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </div>
  )
}
