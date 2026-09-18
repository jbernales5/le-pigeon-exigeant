"use client"

import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, MapsIcon, Moon02Icon, GridViewIcon, Sun03Icon } from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"
import { initials } from "@/lib/format"

export function UserMenu({ user }: { user: { name: string; email: string; image?: string | null } }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  async function onSignOut() {
    await signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu du compte"
        className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <Avatar className="size-9 border border-border">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold tracking-wider">{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium normal-case tracking-normal">{user.name}</span>
            <span className="truncate text-xs font-normal normal-case tracking-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/collection")}>
            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} />
            Collection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/map")}>
            <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
            Carte du monde
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            <HugeiconsIcon icon={resolvedTheme === "dark" ? Sun03Icon : Moon02Icon} strokeWidth={2} />
            {resolvedTheme === "dark" ? "Mode clair" : "Mode sombre"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
