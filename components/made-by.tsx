import { SITE } from "@/lib/site"
import { cn } from "@/lib/utils"

/** "Fait avec ♥ par un pigeon exigeant" — links to the author's site. */
export function MadeBy({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      Fait avec
      <span aria-label="amour" role="img" className="text-primary">
        ♥
      </span>
      par{" "}
      <a href={SITE.author.url} target="_blank" rel="noopener noreferrer author" className="underline decoration-current/40 underline-offset-4 transition-colors hover:text-primary">
        un pigeon exigeant
      </a>
    </span>
  )
}
