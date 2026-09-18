"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: IconSvgElement
  eyebrow?: string
  title: string
  description: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  /** Visual tone of the confirm button. */
  tone?: "default" | "outline"
}

export function ConfirmDialog({ open, onOpenChange, icon, eyebrow, title, description, confirmLabel, cancelLabel = "Annuler", onConfirm, tone = "default" }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,32rem)] p-8 sm:max-w-[32rem] sm:p-10">
        <DialogHeader className="items-start gap-3 text-left">
          {icon && (
            <span className="flex size-10 items-center justify-center border border-border text-primary">
              <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-5" />
            </span>
          )}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <DialogTitle className="font-heading text-3xl leading-tight font-normal normal-case tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 gap-3 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone}
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
