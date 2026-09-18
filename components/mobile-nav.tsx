"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, GridViewIcon, MapsIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/collection", label: "Collection", icon: GridViewIcon },
  { href: "/add", label: "Ajouter", icon: Add01Icon, primary: true },
  { href: "/map", label: "Carte", icon: MapsIcon },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-3">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[0.6rem] font-semibold tracking-[0.2em] uppercase transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.primary ? (
                  <span className={cn("flex size-8 items-center justify-center bg-primary text-primary-foreground transition-transform", active && "scale-95")}>
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
                  </span>
                ) : (
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} className={cn("size-5", active && "text-primary")} />
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
