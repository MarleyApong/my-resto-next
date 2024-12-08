"use client"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserNav } from "./UserNav"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

export const HeaderForTerminalSale = () => {

  return (
    <header className="fixed top-2 left-[16.5rem] z-50 w-[calc(100%-17rem)] transition-all ">
      <div className="flex justify-end items-center p-1 px-2 rounded-sm ml-auto gap-4 bg-[var(--header-background)]">
        <SidebarTrigger className="bg-background" />
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
