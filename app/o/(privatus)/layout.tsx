"use client"

import Head from "next/head"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import "./layout.css"
import { SurveyProvider } from "@/contexts/SurveyContext"
import { HeaderForTerminalSale } from "@/components/layout/header/HeaderForTerminalSale"

// Charger ThemeProvider dynamiquement sans SSR
const DynamicThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), {
  ssr: false
})

interface NavigationItem {
  title: string
  display: string
  path: string
  children?: NavigationItem[]
}

// Routes à exclure du breadcrumb
const EXCLUDED_PATHS = ["/o", "/o/", "/o/dashboard", "/o/home"]

// Composant CustomBreadcrumb
const CustomBreadcrumb = ({ currentPath }: { currentPath: string }) => {
  // Vérifier si le chemin actuel est dans la liste des exclusions
  if (EXCLUDED_PATHS.includes(currentPath)) {
    return null
  }

  // Exemple de structure de navigation - à adapter selon vos besoins
  const navigation: NavigationItem[] = [
    {
      title: "users",
      display: "Utilisateurs",
      path: "/o/users",
      children: [
        {
          title: "list",
          display: "Liste des utilisateurs",
          path: "/o/users/list"
        },
        {
          title: "create",
          display: "Créer un utilisateur",
          path: "/o/users/create"
        }
      ]
    },
    {
      title: "settings",
      display: "Paramètres",
      path: "/o/settings",
      children: [
        {
          title: "general",
          display: "Général",
          path: "/o/settings/general"
        },
        {
          title: "security",
          display: "Sécurité",
          path: "/o/settings/security"
        }
      ]
    }
  ]

  // Fonction pour trouver l'item de navigation correspondant au segment
  const findNavigationItem = (segment: string, items: NavigationItem[]): NavigationItem | undefined => {
    for (const item of items) {
      if (item.title === segment) {
        return item
      }
      if (item.children) {
        const found = findNavigationItem(segment, item.children)
        if (found) return found
      }
    }
    return undefined
  }

  // Générer le chemin de navigation basé sur l'URL actuelle
  const pathSegments = currentPath.split("/").filter(Boolean)

  // Retirer le "o" initial du chemin pour le traitement
  if (pathSegments[0] === "o") {
    pathSegments.shift()
  }

  return (
    <Breadcrumb className="fixed w-auto py-1 px-2 mb-2 mt-[10px] bg-backgroun rounded-sm">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/o">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {pathSegments.length > 2 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Plus</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {navigation.map((item) => (
                    <DropdownMenuItem key={item.path}>
                      <BreadcrumbLink href={item.path}>{item.display}</BreadcrumbLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {pathSegments.map((segment, index) => {
          const navItem = findNavigationItem(segment, navigation)
          const currentPath = "/o/" + pathSegments.slice(0, index + 1).join("/")

          return (
            <BreadcrumbItem key={segment}>
              {index === pathSegments.length - 1 ? (
                <BreadcrumbPage>{navItem?.display || segment}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={currentPath}>{navItem?.display || segment}</BreadcrumbLink>
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

interface PrivatusLayoutProps {
  children: React.ReactNode
  defaultOpen: boolean
}

export default function PrivatusLayout({ children, defaultOpen }: PrivatusLayoutProps) {
  const pathname = usePathname()

  return (
    <>
      <SurveyProvider>
        <Head>
          <title>Admin Section</title>
          <meta name="description" content="Welcome in admin section" />
        </Head>
        <DynamicThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            {pathname.includes("sales-terminal") ? <HeaderForTerminalSale /> : <Header />}
            <div className="relative flex w-screen h-[100vh] transition-all pt- bg-secondary">
              <AppSidebar />
              <main className="relative flex-1 flex flex-col bg-secondary p-2 mt-5 overflow-y-auto max-h-[calc(100vh - 600px)]">
                {/* <CustomBreadcrumb currentPath={pathname} /> */}
                <div className="mt-14">{children}</div>
              </main>
            </div>
          </SidebarProvider>
        </DynamicThemeProvider>
      </SurveyProvider>
    </>
  )
}

async function getCookies() {
  const cookieStore = await import("next/headers").then(({ cookies }) => cookies())
  return cookieStore.get("sidebar:state")?.value === "true"
}

export async function generatePrivatusLayout(props: { children: React.ReactNode }) {
  const defaultOpen = await getCookies()
  return <PrivatusLayout {...props} defaultOpen={defaultOpen} />
}
