"use client"

import { MoveLeft, Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useOrderCart } from "@/hooks/useOrderCart"

export const HeaderForMenuProduct = () => {
  const { toggleOrderCart, isOrderCartVisible } = useOrderCart()

  const headerWidth = isOrderCartVisible ? "w-[calc(100%-21rem)]" : "w-[calc(100%-1rem)]"

  return (
    <header
      className={`
        fixed 
        top-2 
        left-2
        z-50 
        transition-all 
        duration-300 
        ${headerWidth} 
      `}
    >
      <div className="flex justify-between items-center gap-2">
        <Button variant="close" className="shadow-md" size="sm"><MoveLeft/> Retour</Button>
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
            <ShoppingCart className="text-gray-600" size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}
