import Image from "next/image"
import { redirect } from "next/navigation"

import { Logo } from "@/components/logo"
import { MadeBy } from "@/components/made-by"
import { SITE } from "@/lib/site"
import { getSession } from "@/lib/session"

const HERO =
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1800&q=80"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (session) redirect("/collection")
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.15fr_1fr]">
      <aside className="grain relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src={HERO}
          alt="Suite baignée de lumière, vue sur la mer"
          fill
          priority
          sizes="60vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-10 text-white">
          <Logo tone="light" />
          <span className="eyebrow text-white/70">Volière privée · Depuis 2026</span>
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 p-10 text-white">
          <div className="relative -ml-2 mb-6 aspect-[3/2] h-28 xl:h-36">
            <Image src="/brand/logo-white.png" alt="" fill sizes="220px" className="object-contain" />
          </div>
          <p className="font-heading max-w-xl text-5xl leading-[1.05] xl:text-6xl">
            Les adresses que l&apos;on ne partage <span className="italic">qu&apos;entre pigeons.</span>
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/75">
            Hôtels, maisons et refuges où nos membres ont vraiment dormi, vraiment payé et vraiment envie de revenir.
            Pas d&apos;algorithme, pas de sponsor : des amis qui ont le goût du beau, et le portefeuille qui suit. Parfois.
          </p>
        </figcaption>
      </aside>

      <main className="relative flex min-h-svh flex-col px-6 py-6 sm:px-12 sm:py-8 lg:min-h-0 lg:px-20">
        <div className="flex items-center justify-between lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="animate-fade-up w-full max-w-md">{children}</div>
        </div>
        <footer className="flex items-center justify-between text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
          <span>{SITE.name}</span>
          <MadeBy />
        </footer>
      </main>
    </div>
  )
}
