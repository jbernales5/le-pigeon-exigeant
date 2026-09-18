import type { Metadata } from "next"

import { MadeBy } from "@/components/made-by"
import { MobileNav } from "@/components/mobile-nav"
import { SiteHeader } from "@/components/site-header"
import { requireSession } from "@/lib/session"
import { SITE } from "@/lib/site"

// The collection is private: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader user={session.user} />
      <div className="flex flex-1 flex-col pb-14 md:pb-0">{children}</div>
      <footer className="hairline mt-20 pb-14 md:pb-0">
        <div className="page flex flex-col items-start justify-between gap-2 py-8 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase sm:flex-row sm:items-center">
          <span>{SITE.name} · Collection privée</span>
          <span>Aucun algorithme n&apos;a été consulté.</span>
          <MadeBy />
        </div>
      </footer>
      <MobileNav />
    </div>
  )
}
