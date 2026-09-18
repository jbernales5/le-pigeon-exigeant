import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="page flex flex-col items-start gap-6 py-32">
      <span className="eyebrow">404</span>
      <h1 className="text-5xl">Cette adresse n&apos;existe pas (ou plus).</h1>
      <Button nativeButton={false} render={<Link href="/collection" />}>Retour à la collection</Button>
    </main>
  )
}
