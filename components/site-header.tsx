import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Logo } from "@/components/logo"
import { NavLinks } from "@/components/nav-links"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

export function SiteHeader({ user }: { user: { name: string; email: string; image?: string | null } }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="page flex h-14 items-center justify-between gap-6 md:h-16">
        <div className="flex items-center gap-10">
          <Logo href="/collection" compact />
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" nativeButton={false} render={<Link href="/add" />} className="hidden md:inline-flex">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Ajouter une adresse
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
