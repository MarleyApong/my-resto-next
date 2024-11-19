"use client"

import Head from "next/head"
import dynamic from "next/dynamic"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import "./layout.css"

// Charger ThemeProvider dynamiquement sans SSR
const DynamicThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), {
  ssr: false
})

// Fonction pour obtenir les cookies de manière asynchrone
async function getCookies() {
  const cookieStore = await import("next/headers").then(({ cookies }) => cookies())
  return cookieStore.get("sidebar:state")?.value === "true"
}

// Composant PrivatusLayout
export default function PrivatusLayout({ children, defaultOpen }: { children: React.ReactNode; defaultOpen: boolean }) {
  return (
    <>
      <Head>
        <title>Admin Section</title>
        <meta name="description" content="Welcome in admin section" />
      </Head>
      <DynamicThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SidebarProvider defaultOpen={defaultOpen}>
          <Header />
          <div className="relative flex w-screen h-[100vh] transition-all pt-14 bg-secondary">
            <AppSidebar />
            <main className="relative flex-1 flex flex-col bg-secondary pe-2 pb-3 px-4 overflow-y-auto max-h-[calc(100vh - 600px)]">{children}</main>
          </div>
        </SidebarProvider>
      </DynamicThemeProvider>
    </>
  )
}

// Chargement asynchrone de PrivatusLayout avec les cookies
export async function generatePrivatusLayout(props: { children: React.ReactNode }) {
  const defaultOpen = await getCookies()
  return <PrivatusLayout {...props} defaultOpen={defaultOpen} />
}
