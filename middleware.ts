import { NextResponse, type NextRequest } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { menuItems } from "@/data/mainMenu"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en"
})

// Type for menu items
type MenuItemWithSubItems = {
  id: string
  url: string | null
  title: string
  icon?: any
  subItems?: MenuItemWithSubItems[]
}

// Recursively build URL to menuId mapping
const generateRouteToMenuMap = (items: MenuItemWithSubItems[]): Record<string, string> => {
  const map: Record<string, string> = {}

  const processMenuItem = (item: MenuItemWithSubItems) => {
    if (item.url && item.id) {
      map[item.url] = item.id
    }
    if (item.subItems && item.subItems.length > 0) {
      item.subItems.forEach(processMenuItem)
    }
  }

  items.forEach(processMenuItem)
  return map
}

const routeToMenuMap = generateRouteToMenuMap(menuItems as MenuItemWithSubItems[])

export async function middleware(request: NextRequest) {
  const response = await I18nMiddleware(request)
  const pathname = request.nextUrl.pathname

  // Strip locale prefix for route checking
  const cleanPathname = pathname.replace(/^\/(en|fr)\//, "/")
  const isAuthRoute = cleanPathname.startsWith("/o/auth")
  const isProtectedRoute = cleanPathname.startsWith("/o") && !isAuthRoute

  // Retrieve session and locale
  const sessionId = request.cookies.get("sessionId")?.value
  const locale = pathname.match(/^\/(en|fr)/)?.[1] || request.cookies.get("Next-Locale")?.value || "en" // Fallback to "en"

  // Set the locale in cookies for subsequent requests
  response.cookies.set("Next-Locale", locale)

  const redirectToLogin = () => {
    const loginUrl = new URL(`/${locale}/o/auth/login`, request.url)
    const callbackUrl = new URL(request.url).pathname
    loginUrl.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(loginUrl)
  }

  if (isProtectedRoute && !sessionId) {
    return redirectToLogin()
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && sessionId) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
    if (callbackUrl && callbackUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
    return NextResponse.redirect(new URL(`/${locale}/o`, request.url))
  }

  // Check menu permissions for protected routes
  if (isProtectedRoute && sessionId) {
    try {
      const userResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          Cookie: `sessionId=${sessionId}; Next-Locale=${locale}`
        }
      })

      if (!userResponse.ok) {
        return redirectToLogin()
      }

      const { user } = await userResponse.json()
      const menuId = routeToMenuMap[cleanPathname]

      // Verify user has view permission for this menu
      if (menuId) {
        const hasPermission = user.role.permissions.some((permission: { menuId: string; view: boolean }) => permission.menuId === menuId && permission.view)

        if (!hasPermission) {
          const referer = request.headers.get("referer")
          if (referer) {
            return NextResponse.redirect(referer)
          }
          return NextResponse.redirect(new URL(`/${locale}/o`, request.url))
        }
      }
    } catch (error) {
      return redirectToLogin()
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)", "/o/:path*"]
}
