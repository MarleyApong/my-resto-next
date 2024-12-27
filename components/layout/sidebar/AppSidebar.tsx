"use client"

import React, { useEffect } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, useSidebar } from "@/components/ui/sidebar"
import { useState } from "react"
import { SidebarItem } from "./SidebarItem"
import { menuItems } from "@/data/mainMenu"
import { useAuthStore } from "@/stores/authStore"

export function AppSidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const { toggleSidebar } = useSidebar()
  const { user } = useAuthStore()

  // Fonction pour vérifier si l'utilisateur a accès à un menu spécifique
  const hasMenuAccess = (menuId: string) => {
    return user?.role?.permissions?.some((permission) => permission.menuId === menuId && permission.view)
  }

  // Filtre les menus en fonction des permissions
  const filteredMenuItems = menuItems
    .map((item) => {
      // Si l'item a des sous-menus, on les filtre
      if (item.subItems?.length) {
        const filteredSubItems = item.subItems.filter((subItem) => hasMenuAccess(subItem.id))

        // Si au moins un sous-menu est accessible, on retourne l'item parent avec les sous-menus filtrés
        if (filteredSubItems.length > 0) {
          return {
            ...item,
            subItems: filteredSubItems
          }
        }
        // Si aucun sous-menu n'est accessible, on ne retourne pas l'item parent
        return null
      }

      // Pour les items sans sous-menus, on vérifie directement leur accès
      return hasMenuAccess(item.id) ? item : null
    })
    .filter(Boolean) // Supprime les items null

  // Reste du code inchangé...
  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title)
  }

  useEffect(() => {
    const checkMobile = () => {
      const mobileMediaQuery = window.matchMedia("(max-width: 768px)")
      setIsMobile(mobileMediaQuery.matches)
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
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map(
                (item) => item?.id && <SidebarItem key={item.title} item={item} isOpen={openMenu === item.title} onToggle={toggleMenu} closeSidebar={closeSidebar} />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
