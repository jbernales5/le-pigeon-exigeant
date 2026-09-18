import Image from "next/image"
import Link from "next/link"

import { SITE } from "@/lib/site"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  href?: string
  /** Hide the tagline. */
  compact?: boolean
  /** Text colour scheme: "auto" follows the theme, "light" forces cream text (dark photo backgrounds). */
  tone?: "auto" | "light"
}

/** Gold pigeon mark + serif wordmark. */
export function Logo({ className, href = "/", compact = false, tone = "auto" }: Props) {
  return (
    <Link href={href} aria-label={`${SITE.name} — accueil`} className={cn("group inline-flex items-center gap-3 select-none", className)}>
      <Image src="/brand/mark.png" alt="" width={36} height={36} priority className="size-9 rounded-[7px] shadow-sm" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading text-[1.35rem] leading-none tracking-tight", tone === "light" ? "text-white" : "text-foreground")}>
          Le Pigeon <span className={cn("italic", tone === "light" ? "text-gold" : "text-primary")}>Exigeant</span>
        </span>
        {!compact && (
          <span className={cn("mt-1 hidden text-[0.55rem] font-semibold tracking-[0.3em] uppercase sm:inline", tone === "light" ? "text-white/60" : "text-muted-foreground")}>
            {SITE.tagline}
          </span>
        )}
      </span>
    </Link>
  )
}
