"use client"

import React from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar"
import { useState } from "react"
import { SidebarItem } from "./SidebarItem"
import { menuItems } from "@/data/mainMenu"

export function AppSidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  // const [hasAdminAccess, setHasAdminAccess] = useState<string | null>(null)

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title)
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
                <SidebarItem key={item.title} item={item} isOpen={openMenu === item.title} onToggle={toggleMenu} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
