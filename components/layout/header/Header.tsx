"use client"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserNav } from "./UserNav"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full shadow-lg bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all">
      <div className="flex h-14 items-center px-4 gap-4">
        <SidebarTrigger />
        <div className="flex flex-1">
          <span className="font-semibold">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
