"use client"

import React, { useEffect } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, useSidebar } from "@/components/ui/sidebar"
import { useState } from "react"
import { SidebarItem } from "./SidebarItem"
import { menuItems } from "@/data/mainMenu"

export function AppSidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const { toggleSidebar } = useSidebar()

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title)
  }

  useEffect(() => {
    const checkMobile = () => {
      const mobileMediaQuery = window.matchMedia("(max-width: 768px)")
      setIsMobile(mobileMediaQuery.matches)
    }

    checkMobile() // Call
    window.addEventListener("resize", checkMobile) // update

    return () => {
      window.removeEventListener("resize", checkMobile) // clear
    }
  }, [])

  const closeSidebar = () => {
    if (isMobile) {
      toggleSidebar()
    }
  }

  return (
    <Sidebar variant="sidebar" className="border-b bg-[var(--sidebar-background)] backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 p-0 shadow-lg" collapsible="icon">
      <SidebarContent>
        {/* Menu principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarItem key={item.title} item={item} isOpen={openMenu === item.title} onToggle={toggleMenu} closeSidebar={closeSidebar} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
