import { NextResponse, type NextRequest } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en"
})    

export async function middleware(request: NextRequest) {
  const isPrivateRoute = request.nextUrl.pathname.startsWith("/o") && request.nextUrl.pathname !== "/o/auth/login"

  if (isPrivateRoute) {
    const accessToken = request.cookies.get("accessToken")

    if (!accessToken) {
      return redirectToLogin(request)
    }
  }

  return I18nMiddleware(request)
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/o/auth/login", request.url)
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.href)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)", "/o/:path*"]
}
