"use client"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserNav } from "./UserNav"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    // shadow-lg bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 
    <header className="fixed top-2 left-[16.5rem] z-50 w-[calc(100%-17rem)] transition-all ">
      <div className="flex justify-end items-center p-1 px-2 rounded-sm ml-auto gap-4 bg-[var(--header-background)]">
        <SidebarTrigger className="bg-background" />
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
