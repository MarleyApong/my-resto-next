import { NextResponse, type NextRequest } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en"
})

export async function middleware(request: NextRequest) {
  const response = await I18nMiddleware(request)
  const pathname = request.nextUrl.pathname
  const cleanPathname = pathname.replace(/^\/(en|fr)\//, "/")

  const isAuthRoute = cleanPathname.startsWith("/o/auth")
  const isProtectedRoute = cleanPathname.startsWith("/o") && !isAuthRoute

  const sessionId = request.cookies.get("sessionId")?.value
  const locale = pathname.match(/^\/(en|fr)/)?.[1] || "en"

  // Helper function to redirect to login
  const redirectToLogin = () => {
    const loginUrl = new URL(`/${locale}/o/auth/login`, request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // For protected routes, check session
  if (isProtectedRoute && !sessionId) {
    return redirectToLogin()
  }

  // Redirect to dashboard if already authenticated
  if (isAuthRoute && sessionId) {
    return NextResponse.redirect(new URL(`/${locale}/o`, request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)", "/o/:path*"]
}
