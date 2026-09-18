import type { Metadata } from "next"

import { AddHotelWizard } from "@/components/add/add-hotel-wizard"
import { availableProviders } from "@/lib/search"

export const metadata: Metadata = { title: "Ajouter une adresse" }

export default function AddPage() {
  const providers = availableProviders()
  return (
    <main className="page flex flex-col gap-8 py-8 sm:gap-12 sm:py-12">
      <header className="max-w-2xl">
        <span className="eyebrow">Recommander</span>
        <h1 className="mt-3 text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
          Une adresse qui mérite <span className="italic text-primary">d&apos;être partagée.</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Vous avez payé cher, vous avez adoré, et vous voulez que les autres pigeons en profitent. Collez le lien ou cherchez
          par le nom : l&apos;agent prépare la fiche, vous vérifiez, vous confessez le prix payé et vous ajoutez votre mot.
        </p>
      </header>
      <AddHotelWizard providers={providers} />
    </main>
  )
}
