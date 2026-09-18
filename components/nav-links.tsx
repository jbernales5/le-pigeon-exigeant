"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/map", label: "Carte" },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="hidden items-center gap-7 md:flex">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/")
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "relative text-xs font-semibold tracking-[0.2em] uppercase transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l.label}
            <span
              className={cn(
                "absolute -bottom-[22px] left-0 h-px w-full bg-primary transition-opacity",
                active ? "opacity-100" : "opacity-0"
              )}
            />
          </Link>
        )
      })}
    </nav>
  )
}
