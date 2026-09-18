"use client"

import * as React from "react"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  /** Big serif line, e.g. the hotel name. */
  title: string
  /** Messages rotated while waiting. */
  steps: string[]
  /** Approximate ms per step (purely cosmetic). */
  cadence?: number
}

/** Elegant, non-dismissable waiting screen shown while the agent works. */
export function ProgressOverlay({ open, title, steps, cadence = 2600 }: Props) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (!open) return
    const t = setInterval(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), cadence)
    return () => clearInterval(t)
  }, [open, steps.length, cadence])

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setIndex(0), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(92vw,30rem)] border-border bg-background p-0 sm:max-w-[30rem]"
      >
        <div className="relative overflow-hidden px-8 py-12 sm:px-12">
          {/* Slow breathing halo */}
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl [animation:breathe_5s_ease-in-out_infinite]" />

          <div className="relative flex flex-col items-center text-center">
            <span className="eyebrow">L&apos;agent prépare la fiche</span>
            <DialogTitle className="mt-4 font-heading text-3xl leading-tight font-normal normal-case tracking-tight sm:text-4xl">{title}</DialogTitle>

            {/* Orbiting dot */}
            <div className="relative my-10 size-16">
              <span className="absolute inset-0 rounded-full border border-border" />
              <span className="absolute inset-2 rounded-full border border-dashed border-border/70 [animation:spin_14s_linear_infinite_reverse]" />
              <span className="absolute inset-0 [animation:spin_2.8s_cubic-bezier(0.65,0,0.35,1)_infinite]">
                <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/60" />
              </span>
            </div>

            <div className="relative h-6 w-full overflow-hidden">
              {steps.map((s, i) => (
                <DialogDescription
                  key={s}
                  aria-hidden={i !== index}
                  className={cn(
                    "absolute inset-x-0 text-sm text-muted-foreground transition-[opacity,transform] duration-500 ease-out",
                    i === index ? "translate-y-0 opacity-100" : i < index ? "-translate-y-3 opacity-0" : "translate-y-3 opacity-0"
                  )}
                >
                  {s}
                </DialogDescription>
              ))}
            </div>

            <ol className="mt-6 flex items-center gap-2" aria-hidden>
              {steps.map((s, i) => (
                <li key={s} className={cn("h-px w-6 transition-colors duration-500", i <= index ? "bg-primary" : "bg-border")} />
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
