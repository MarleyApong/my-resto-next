"use client"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserNav } from "./UserNav"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export const Header = () => {
  const {user} = useAuth()
  const { state } = useSidebar()
  const [isOverlay, setIsOverlay] = useState(false)

  useEffect(() => {
    const updateOverlayState = () => {
      setIsOverlay(window.innerWidth <= 768)
    }
    updateOverlayState()
    window.addEventListener("resize", updateOverlayState)
    return () => window.removeEventListener("resize", updateOverlayState)
  }, [])

  const headerWidth = isOverlay || state === "collapsed" ? "w-[calc(100%-1rem)]" : "w-[calc(100%-17rem)]"
  const headerLeft = isOverlay || state === "collapsed" ? "left-2" : "left-[16.5rem]"

  return (
    <header className={`fixed top-2 z-50 transition-all border shadow-md rounded-sm ${headerWidth} ${headerLeft}`}>
      <div className="flex justify-end items-center p-1 rounded-sm ml-auto gap-4 bg-[var(--header-background)]">
        <SidebarTrigger className="bg-background border" />

        <div className="flex flex-1">
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <span className="text-xs">{user?.role.name}</span>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
