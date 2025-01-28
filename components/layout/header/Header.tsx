"use client"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserNav } from "./UserNav"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation" // Importez usePathname pour vérifier la route actuelle

export const Header = () => {
  const { user } = useAuth()
  const { state } = useSidebar()
  const [isOverlay, setIsOverlay] = useState(false)
  const pathname = usePathname() // Récupérez le chemin actuel

  // Vérifiez si la route est "/en/o"
  const isSpecificRoute = pathname.endsWith("/en/o")

  useEffect(() => {
    const updateOverlayState = () => {
      setIsOverlay(window.innerWidth <= 768)
    }
    updateOverlayState()
    window.addEventListener("resize", updateOverlayState)
    return () => window.removeEventListener("resize", updateOverlayState)
  }, [])

  // Ajustez la largeur et la position du header en fonction de la route
  const headerWidth = isSpecificRoute ? "w-[calc(100%-1rem)]" : isOverlay || state === "collapsed" ? "w-[calc(100%-1rem)]" : "w-[calc(100%-17rem)]"
  const headerLeft = isSpecificRoute ? "left-2" : isOverlay || state === "collapsed" ? "left-2" : "left-[16.5rem]"

  return (
    <header className={`fixed top-2 z-50 transition-all border shadow-md rounded-sm ${headerWidth} ${headerLeft}`}>
      <div className="flex justify-end items-center p-1 rounded-sm ml-auto gap-4 bg-[var(--header-background)]">
        {/* Ne pas afficher le SidebarTrigger sur la route spécifique */}
        {!isSpecificRoute && <SidebarTrigger className="bg-background border" />}

        <div className="flex flex-1"></div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <span className="text-xs">{user?.role.name}</span>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
