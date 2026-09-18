import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Espace membres du Pigeon Exigeant.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow">Espace membres</span>
        <h1 className="text-4xl leading-none sm:text-5xl">Bon retour, cher pigeon.</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Connectez-vous pour parcourir la collection et confesser vos dernières folies.
        </p>
      </header>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
