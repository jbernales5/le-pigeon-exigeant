import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Logo } from "@/components/logo"
import { MadeBy } from "@/components/made-by"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { absoluteUrl, SITE } from "@/lib/site"

const HERO = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=2200&q=80"

const PILLARS = [
  {
    title: "Une collection, pas un moteur",
    body: "Quelques dizaines d'adresses seulement, chacune ajoutée par un membre qui y a dormi. Pas de classement sponsorisé, pas d'avis anonymes, pas d'algorithme qui décide à votre place.",
  },
  {
    title: "Le prix, vraiment payé",
    body: "Chaque fiche indique ce que le membre a réellement réglé pour la nuit, le mois du séjour, et ce qu'il referait ou pas. Entre pigeons, on ne se ment pas.",
  },
  {
    title: "Sur invitation",
    body: "La volière reste petite pour rester sincère. On y entre par un membre, ou en demandant l'accès : nous lisons chaque demande, à la main, comme le reste.",
  },
]

export default async function LandingPage() {
  const session = await getSession()
  if (session) redirect("/collection")

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: SITE.name,
        alternateName: SITE.shortName,
        url: SITE.url,
        logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-black.png"), width: 1200, height: 800 },
        image: absoluteUrl("/brand/og.jpg"),
        description: SITE.description,
        slogan: SITE.slogan,
        email: SITE.email.replyTo,
        areaServed: "Worldwide",
        knowsLanguage: ["fr"],
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "fr-FR",
        publisher: { "@id": absoluteUrl("/#organization") },
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/"),
        url: SITE.url,
        name: `${SITE.name} · ${SITE.tagline}`,
        description: SITE.description,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
        primaryImageOfPage: absoluteUrl("/brand/og.jpg"),
        inLanguage: "fr-FR",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-ink text-white">
        {/* ------------------------------------------------------------ hero */}
        <section className="relative min-h-svh" aria-labelledby="hero-title">
          <div className="grain absolute inset-0 overflow-hidden">
            <Image src={HERO} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          </div>

          <div className="page relative flex min-h-svh flex-col">
            <header className="flex items-center justify-between py-6 sm:py-8">
              <Logo tone="light" compact />
              <nav aria-label="Principale" className="flex items-center gap-2">
                <Button variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex" nativeButton={false} render={<Link href="/register" />}>
                  Rejoindre
                </Button>
                <Button variant="outline" className="border-white/40 text-white hover:bg-white hover:text-ink" nativeButton={false} render={<Link href="/login" />}>
                  Se connecter
                </Button>
              </nav>
            </header>

            <div className="grid flex-1 items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <div className="flex flex-col">
              {/* Mobile / tablet: small logo above the title. On desktop it becomes the right-hand piece below. */}
              <div className="animate-fade-up relative -ml-3 mb-2 aspect-[3/2] h-24 self-start sm:h-28 lg:hidden">
                <Image src="/brand/logo-white.png" alt={`${SITE.name} — ${SITE.tagline}`} fill priority sizes="200px" className="object-contain" />
              </div>
              <span className="eyebrow animate-fade-up mt-4 text-gold [animation-delay:60ms]">Collection privée · Par des pigeons exigeants, pour des pigeons exigeants</span>
              <h1 id="hero-title" className="animate-fade-up mt-6 max-w-4xl text-[2.75rem] leading-[0.98] sm:text-6xl md:text-7xl lg:text-8xl [animation-delay:80ms]">
                Nous sommes des pigeons, certes, mais des exigeants avant tout.
              </h1>
              <p className="animate-fade-up mt-8 max-w-xl text-base leading-relaxed text-white/75 [animation-delay:160ms]">
                {SITE.name} nous rassemble parce que nous sommes des pigeons exigeants. Nous avons testé, payé et validé ces adresses :
                la suite, la vue, le prix de la nuit (entre pigeons, on ne se ment pas) et pourquoi nous y retournerions quand même.
                Aucun algorithme, aucun sponsor, aucune étoile achetée. Autant les partager.
              </p>
              <div className="animate-fade-up mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center [animation-delay:240ms]">
                <Button size="lg" className="w-full bg-white text-ink hover:bg-white/90 sm:w-auto" nativeButton={false} render={<Link href="/login" />}>
                  Entrer dans la collection
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
                </Button>
                <Link href="/register" className="text-sm text-white/70 underline underline-offset-4 hover:text-white">
                  Demander une invitation
                </Link>
              </div>
              </div>

              {/* Desktop: the wide logo as the hero's centrepiece, its glow acting as a light source. */}
              <div className="animate-fade-up relative hidden aspect-[3/2] w-full max-w-[34rem] justify-self-end lg:block [animation-delay:200ms]">
                <Image src="/brand/logo-white.png" alt="" fill priority sizes="(min-width: 1024px) 34rem, 0px" className="object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]" />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- manifesto */}
        <section className="page py-20 sm:py-28" aria-labelledby="manifesto-title">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <span className="eyebrow text-gold">Ce que nous sommes</span>
              <h2 id="manifesto-title" className="mt-3 text-4xl leading-[1.05] sm:text-5xl">
                Des hôtels d&apos;exception, <span className="italic">recommandés par des humains.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">{SITE.slogan} Une carte du monde, des photos qui donnent envie, et la note salée qu&apos;il a fallu payer pour en profiter.</p>
            </div>
            <dl className="grid gap-10 sm:grid-cols-3 lg:gap-8">
              {PILLARS.map((p, i) => (
                <div key={p.title} className="border-t border-white/15 pt-5">
                  <dt className="font-heading text-2xl leading-tight">
                    <span className="mr-2 text-sm text-gold">0{i + 1}</span>
                    {p.title}
                  </dt>
                  <dd className="mt-3 text-sm leading-relaxed text-white/65">{p.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="page flex flex-col gap-4 py-8 text-[0.65rem] tracking-[0.2em] text-white/50 uppercase sm:flex-row sm:items-center sm:justify-between">
            <span>{SITE.name} · {SITE.tagline}</span>
            <nav aria-label="Pied de page" className="flex gap-6">
              <Link href="/login" className="hover:text-white">Connexion</Link>
              <Link href="/register" className="hover:text-white">Rejoindre</Link>
              <a href={`mailto:${SITE.email.replyTo}`} className="hover:text-white">Écrire</a>
            </nav>
            <MadeBy className="text-white/50 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-gold" />
          </div>
        </footer>
      </main>
    </>
  )
}
