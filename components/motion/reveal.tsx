"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Props = React.ComponentProps<"div"> & {
  /** Delay in ms, useful to stagger siblings. */
  delay?: number
  /** Render once visible; when false the element animates back out when leaving the viewport. */
  once?: boolean
}

/** Fades and lifts its children in when they enter the viewport. */
export function Reveal({ children, className, delay = 0, once = true, style, ...props }: Props) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.shown = "true" // no observer available: show immediately without re-rendering
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            if (once) io.disconnect()
          } else if (!once) {
            setShown(false)
          }
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] motion-reduce:transition-none",
        "data-[shown=false]:translate-y-5 data-[shown=false]:opacity-0 motion-reduce:data-[shown=false]:translate-y-0 motion-reduce:data-[shown=false]:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
