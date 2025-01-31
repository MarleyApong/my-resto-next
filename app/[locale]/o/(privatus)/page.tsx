"use client"

import React from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import * as Icons from "lucide-react"
import { menuItems } from "@/data/mainMenu"
import { MenuType } from "@/types/permission"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { MenuItem } from "@/types/sidebar"

interface SectionMenus {
  [key: string]: MenuType[]
}

const Home: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()

  const getMenuIcon = (menuId: string) => {
    const menuItem = menuItems.find((item) => item.id === menuId) || menuItems.flatMap((item) => item.subItems || []).find((sub) => sub.id === menuId)
    const IconComponent = menuItem?.icon || Icons.File
    return <IconComponent className="h-6 w-6 text-primary" />
  }

  const getMenusBySection = (menus: MenuType[]): SectionMenus => {
    const sections: SectionMenus = {}

    menus.forEach((menu) => {
      // Vérifie si c'est un sous-menu
      const parentMenu = menuItems.find((item) => item.subItems?.some((sub) => sub.id === menu.id && sub.url !== null))

      if (parentMenu) {
        const menuItem = parentMenu.subItems?.find((sub) => sub.id === menu.id)
        if (menuItem?.url) {
          if (!sections[parentMenu.title]) {
            sections[parentMenu.title] = []
          }
          sections[parentMenu.title].push(menu)
        }
      } else {
        // Vérifie si c'est un menu principal avec une URL
        const mainMenu = menuItems.find((item) => item.id === menu.id && item.url !== null)
        if (mainMenu) {
          if (!sections["Menus Principaux"]) {
            sections["Menus Principaux"] = []
          }
          sections["Menus Principaux"].push(menu)
        }
      }
    })

    return sections
  }

  const handleCardClick = (menuId: string) => {
    // Vérifie d'abord si c'est un sous-menu
    let menuItem = menuItems.flatMap((item) => item.subItems || []).find((sub) => sub.id === menuId) as MenuItem | undefined

    // Si ce n'est pas un sous-menu, cherche parmi les menus principaux
    if (!menuItem) {
      menuItem = menuItems.find((item) => item.id === menuId) as MenuItem | undefined
    }

    // Vérifie si `menuItem` existe et si `url` est bien une string avant de naviguer
    if (menuItem && typeof menuItem.url === "string") {
      router.push(menuItem.url)
    }
  }

  return (
    <div className="mt-10">
      {Object.entries(getMenusBySection(user?.role?.menus || [])).map(([section, menus]) => (
        <div key={section} className="mb-8">
          <h2 className="text-lg font-bold text-primary mb-4">{section}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ml-2">
            {menus.map((menu) => (
              <Card key={menu.id} className="hover:shadow-lg transition-shadow cursor-pointer border-primary" onClick={() => handleCardClick(menu.id)}>
                <CardHeader className="flex flex-row items-center gap-2">
                  {getMenuIcon(menu.id)}
                  <CardTitle className="font-normal">{menu.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home
