"use client"

import Head from "next/head"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SurveyProvider } from "@/contexts/SurveyContext"
import { HeaderForTerminalSale } from "@/components/layout/header/HeaderForTerminalSale"
import { OrderCartProvider } from "@/contexts/OrderCartContext"
import { AuthGuard } from "@/guards/AuthGuard"
import { InactivityHandler } from "@/guards/InactivityHandlerGuard"
import { CustomBreadcrumb } from "@/components/features/CustomBreadcrumb"
import "./layout.css"

// Charger ThemeProvider dynamiquement sans SSR
const DynamicThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), {
  ssr: false
})

async function getCookies() {
  const cookieStore = await import("next/headers").then(({ cookies }) => cookies())
  return cookieStore.get("sidebar:state")?.value === "true"
}

export async function generatePrivatusLayout(props: { children: React.ReactNode }) {
  const defaultOpen = await getCookies()
  return <PrivatusLayout {...props} defaultOpen={defaultOpen} />
}

interface PrivatusLayoutProps {
  children: React.ReactNode
  defaultOpen: boolean
}

const PrivatusLayout = ({ children, defaultOpen }: PrivatusLayoutProps) => {
  const pathname = usePathname()

  // Vérifier si la route est "/en/o"
  const shouldShowSidebar = !pathname.endsWith("/en/o")

  return (
    <>
      <InactivityHandler />
      <SurveyProvider>
        <Head>
          <title>Admin Section</title>
          <meta name="description" content="Welcome in admin section" />
        </Head>
        <DynamicThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            <OrderCartProvider>
              {pathname.includes("sales-terminal") ? <HeaderForTerminalSale /> : !pathname.includes("surveys/design/") && <Header />}
              <div className="relative flex w-screen h-[100vh] transition-all pt- bg-secondary">
                {shouldShowSidebar && <AppSidebar />} {/* Condition pour afficher ou non le sidebar */}
                <main
                  className={`relative flex-1 flex flex-col bg-secondary ${!pathname.includes("sales-terminal") || !pathname.includes("surveys/design/") ? "mt-0 p-2 pt-0" : "mt-5 p-2"} overflow-y-auto max-h-[calc(100vh - 600px)]`}
                >
                  <CustomBreadcrumb currentPath={pathname} />
                  <div className={`${pathname.includes("/o/dashboard") || pathname.endsWith("/o") ? "mt-12" : !pathname.includes("surveys/design/") ? "mt-28" : ""}`}>
                    {children}
                  </div>
                </main>
              </div>
            </OrderCartProvider>
          </SidebarProvider>
        </DynamicThemeProvider>
      </SurveyProvider>
    </>
  )
}

export default PrivatusLayout
