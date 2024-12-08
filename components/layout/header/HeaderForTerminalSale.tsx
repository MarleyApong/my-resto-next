"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Search, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserNav } from "./UserNav"
import { useEffect, useState } from "react"
import { useOrderCart } from "@/hooks/useOrderCart"

export const HeaderForTerminalSale = () => {
  const { state } = useSidebar()
  const { toggleOrderCart, isOrderCartVisible } = useOrderCart()
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }

    updateWindowWidth() // Initial check
    window.addEventListener("resize", updateWindowWidth)
    return () => window.removeEventListener("resize", updateWindowWidth)
  }, [])

  // Mode tablette où le sidebar est en overlay
  const isTabletOverlay = windowWidth <= 1024

  // Calcul dynamique de la largeur du header
  const headerWidth = isTabletOverlay
    ? isOrderCartVisible
      ? "w-[calc(100%-21rem)]" // Rétractation totale en mode tablette avec OrderCart
      : "w-[calc(100%-1rem)]" // Largeur standard en overlay
    : state === "collapsed"
      ? "w-[calc(100%-1rem)]"
      : isOrderCartVisible
        ? "w-[calc(100%-37rem)]" // 17rem (sidebar) + 20rem (OrderCart)
        : "w-[calc(100%-17rem)]" // Largeur normale avec sidebar

  // Calcul de la position gauche
  const headerLeft = isTabletOverlay ? "left-2" : state === "collapsed" ? "left-2" : "left-[16.5rem]"

  return (
    <header
      className={`
        fixed 
        top-2 
        z-50 
        transition-all 
        duration-300 
        ${headerWidth} 
        ${headerLeft}
      `}
    >
      <div className="flex justify-between items-center gap-2">
        <SidebarTrigger className="bg-[var(--header-background)] border" />

        <div className="flex items-center flex-1 border rounded-sm focus:ring-0 max-w-[600px] h-8 bg-[var(--header-background)] shadow-md px-1">
          <Search className="text-gray-500 mr-2" size={18} />
          <input
            placeholder="Search Product here..."
            className="text-sm flex-grow bg-transparent font-normal placeholder:text-muted-foreground md:text-xs"
            style={{ border: "none", outline: "none" }}
          />
        </div>

        <div className="flex items-center h-8 gap-4 bg-[var(--header-background)] border rounded-sm shadow-md p-1">
          <ModeToggle />
          <Button size="icon" variant="outline" className="p-3 hover:bg-gray-200 transition" onClick={toggleOrderCart}>
            <Route className="text-gray-600" size={20} />
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
