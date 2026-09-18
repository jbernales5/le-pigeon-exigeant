"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

/** next/image that fades in once decoded, over a soft muted placeholder. */
export function FadeImage({ className, onLoad, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      data-loaded={loaded}
      className={cn(
        "transition-opacity duration-700 ease-out data-[loaded=false]:opacity-0 motion-reduce:transition-none",
        className
      )}
    />
  )
}
