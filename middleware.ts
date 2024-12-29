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

  // Skip middleware for /api/auth/me to prevent recursion
  if (cleanPathname.startsWith("/api/auth/me")) {
    return response
  }

  const isAuthRoute = cleanPathname.startsWith("/o/auth")
  const isProtectedRoute = cleanPathname.startsWith("/o") && !isAuthRoute

  // Retrieve session and locale
  const sessionId = request.cookies.get("sessionId")?.value
  const locale = pathname.match(/^\/(en|fr)/)?.[1] || request.cookies.get("Next-Locale")?.value || "en"

  // Set the locale in cookies for subsequent requests
  response.cookies.set("Next-Locale", locale)

  const redirectToLogin = (reason = "") => {
    const loginUrl = new URL(`/${locale}/o/auth/login`, request.url)
    const callbackUrl = new URL(request.url).pathname
    loginUrl.searchParams.set("callbackUrl", callbackUrl)
    if (reason) loginUrl.searchParams.set("reason", reason)

    const newResponse = NextResponse.redirect(loginUrl)
    newResponse.cookies.set("sessionId", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })
    return newResponse
  }

  // Redirect unauthenticated users to login
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
      // Add a cache-control header to prevent caching of the /api/auth/me response
      const userResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          Cookie: `sessionId=${sessionId}; Next-Locale=${locale}`,
          "Cache-Control": "no-store, max-age=0"
        }
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        let reason = "session_expired"

        switch (errorData.name) {
          case "SessionExpiredError":
            reason = "session_expired"
            break
          case "SessionInvalidError":
            reason = "session_invalid"
            break
          case "SessionRevokedError":
            reason = "session_revoked"
            break
          case "InactiveAccountError":
            reason = "account_inactive"
            break
          default:
            reason = "server_error"
            break
        }
        return redirectToLogin(reason)
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
      return redirectToLogin("server_error")
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)", "/o/:path*"]
}
