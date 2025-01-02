"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MenuItem } from "@/types/sidebar"
import { menuItems } from "@/data/mainMenu"
import { useI18n } from "@/locales/client"

// Routes à exclure du breadcrumb
const EXCLUDED_PATHS = ["/o", "/o/", "/o/dashboard", "/o/home"]

// Composant CustomBreadcrumb
export const CustomBreadcrumb = ({ currentPath }: { currentPath: string }) => {
  const t = useI18n()

  // Vérifier si le chemin actuel est dans la liste des exclusions
  if (EXCLUDED_PATHS.includes(currentPath)) {
    return null
  }

  // Fonction pour trouver l'item de menu correspondant au segment
  const findMenuItem = (segment: string, items: MenuItem[]): MenuItem | undefined => {
    for (const item of items) {
      if (item.id === segment) {
        return item
      }
      if (item.subItems) {
        const found = findMenuItem(segment, item.subItems)
        if (found) return found
      }
    }
    return undefined
  }

  // Générer le chemin de navigation basé sur l'URL actuelle
  const pathSegments = currentPath.split("/").filter(Boolean)

  // Ignorer la locale (premier segment)
  if (pathSegments.length > 0 && ["en", "fr"].includes(pathSegments[0])) {
    pathSegments.shift()
  }

  // Retirer le "o" initial du chemin pour le traitement
  if (pathSegments[0] === "o") {
    pathSegments.shift()
  }

  return (
    <Breadcrumb className="fixed w-auto mb-2 mt-[60px]">
      <BreadcrumbList>
        <BreadcrumbItem className="text-xs">
          <BreadcrumbLink href="/o">home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {pathSegments.length > 2 && (
          <>
            <BreadcrumbItem className="text-xs">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Plus</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.id}>
                      <BreadcrumbLink className="text-xs" href={item.url || "#"}>{item.title}</BreadcrumbLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {pathSegments.map((segment, index) => {
          const menuItem = findMenuItem(segment, menuItems)
          const currentPath = "/o/" + pathSegments.slice(0, index + 1).join("/")

          return (
            <BreadcrumbItem key={segment}>
              {index === pathSegments.length - 1 ? (
                <BreadcrumbPage className="text-xs text-primary">{menuItem ? menuItem.title : segment}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink className="text-xs" href={currentPath}>{menuItem ? menuItem.title : segment}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}