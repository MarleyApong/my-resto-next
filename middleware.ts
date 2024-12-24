import { createI18nMiddleware } from "next-international/middleware"
import { NextResponse, type NextRequest } from "next/server"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en"
})

export async function middleware(request: NextRequest) {
  const isPrivateRoute = request.nextUrl.pathname.startsWith("/o") && request.nextUrl.pathname !== "/o/auth/login"
  const isLoginPage = request.nextUrl.pathname === "/o/auth/login"

  // Vérification du token d'accès
  const accessToken = request.cookies.get("accessToken")

  if (isPrivateRoute) {
    // Si la route est protégée et qu'il n'y a pas de token, on redirige vers la page de login
    if (!accessToken) {
      const loginUrl = new URL("/o/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.href)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Continuer avec le middleware i18n
  return I18nMiddleware(request)
}

export const config = {
  matcher: [
    // Matcher pour i18n
    "/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)",
    // Matcher pour toutes les routes sous "/o", y compris les sous-routes
    "/o/:path*"
  ]
}
