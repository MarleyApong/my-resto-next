"use client"

import React, { useEffect, useState } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, useSidebar } from "@/components/ui/sidebar"
import { SidebarItem } from "./SidebarItem"
import { menuItems } from "@/data/mainMenu"
import { useAuth } from "@/hooks/useAuth"
import { SpecificalLoader } from "@/components/features/SpecificalLoader"
import { MenuType } from "@/types/permission"

export function AppSidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const { toggleSidebar } = useSidebar()
  const { user } = useAuth()

  const hasMenuAccess = (menuId: string): boolean => {
    return user?.role?.menus?.some((menu: MenuType) => menu.id === menuId && menu.permissions.view) ?? false
  }
  
  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.subItems?.length) {
        const filteredSubItems = item.subItems.filter((subItem) => hasMenuAccess(subItem.id))
        if (filteredSubItems.length > 0) {
          return {
            ...item,
            subItems: filteredSubItems
          }
        }
        return null
      }
      return hasMenuAccess(item.id) ? item : null
    })
    .filter(Boolean)

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title)
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="position-relative">
              {!user ? (
                <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                  <SpecificalLoader />
                </div>
              ) : (
                filteredMenuItems.map(
                  (item) => item?.id && <SidebarItem key={item.title} item={item} isOpen={openMenu === item.title} onToggle={toggleMenu} closeSidebar={closeSidebar} />
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
