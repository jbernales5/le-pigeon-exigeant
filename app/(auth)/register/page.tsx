import type { Metadata } from "next"

import { AccessRequestDialog } from "@/components/auth/access-request-dialog"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Rejoindre la volière",
  description: "Rejoindre Le Pigeon Exigeant, collection privée d'hôtels d'exception recommandés par leurs membres. Sur invitation, ou en sollicitant un accès.",
  alternates: { canonical: "/register" },
}

export default function RegisterPage() {
  const inviteRequired = Boolean(process.env.INVITE_CODE)
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow">Invitation</span>
        <h1 className="text-4xl leading-none sm:text-5xl">Rejoindre la volière.</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Un compte, un couple, une liste d&apos;adresses qui valaient vraiment leur prix. Ou pas, mais c&apos;était beau.
        </p>
      </header>
      <RegisterForm inviteRequired={inviteRequired} />
      {inviteRequired && (
        <section aria-labelledby="no-code" className="flex flex-col gap-4 border-t border-border pt-8">
          <div>
            <h2 id="no-code" className="eyebrow font-sans">Pas de code d&apos;invitation ?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La volière est petite et le reste volontairement. Dites-nous qui vous êtes : nous lisons chaque demande et nous répondons.
            </p>
          </div>
          <AccessRequestDialog />
        </section>
      )}
    </div>
  )
}
