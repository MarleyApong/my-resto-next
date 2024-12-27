import { NextResponse, type NextRequest } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en"
})

export async function middleware(request: NextRequest) {
  const response = await I18nMiddleware(request)
  const pathname = request.nextUrl.pathname

  // Remove locale prefix from pathname for clean route checking
  const cleanPathname = pathname.replace(/^\/(en|fr)\//, "/")

  const isAuthRoute = cleanPathname.startsWith("/o/auth")
  const isProtectedRoute = cleanPathname.startsWith("/o") && !isAuthRoute

  // Get session and locale information
  const sessionId = request.cookies.get("sessionId")?.value
  const locale = pathname.match(/^\/(en|fr)/)?.[1] || "en"

  // Helper function to redirect to login with the original URL as callback
  const redirectToLogin = () => {
    const loginUrl = new URL(`/${locale}/o/auth/login`, request.url)
    const callbackUrl = new URL(request.url).pathname
    loginUrl.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(loginUrl)
  }

  // Protect routes that require authentication
  if (isProtectedRoute && !sessionId) {
    return redirectToLogin()
  }

  // Handle authenticated users trying to access auth routes
  if (isAuthRoute && sessionId) {
    // Check if there's a callback URL to redirect to
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
    if (callbackUrl && callbackUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
    // Default redirect to dashboard if no callback URL
    return NextResponse.redirect(new URL(`/${locale}/o`, request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)", "/o/:path*"]
}
