import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false, follow: false } }

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow">Espace membres</span>
        <h1 className="text-4xl leading-none sm:text-5xl">Mot de passe envolé ?</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Indiquez l&apos;adresse de votre compte. Nous vous envoyons un lien pour en choisir un nouveau, valable une heure.
        </p>
      </header>
      <ForgotPasswordForm defaultEmail={email ?? ""} />
    </div>
  )
}
