import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt"
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken"
import { getI18n } from "@/locales/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { createError, errors } from "@/lib/errors"
import { HttpStatus } from "@/enums/httpStatus"
import prisma from "@/lib/db"

function isJwtPayload(token: string | JwtPayload): token is JwtPayload {
  return typeof token !== "string" && "userId" in token
}

export const POST = withLogging(
  withErrorHandler(async (request: Request) => {
    const t = await getI18n()
    const cookieStore = cookies()
    const refreshToken = cookieStore.get("refreshToken")

    if (!refreshToken) {
      throw createError(errors.UnauthorizedError, t("api.errors.sessionExpired"))
    }

    try {
      const decoded = verifyRefreshToken(refreshToken.value)

      if (!isJwtPayload(decoded)) {
        throw createError(errors.ForbiddenError, t("api.errors.invalidRefreshToken"))
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw createError(errors.UnauthorizedError, t("api.errors.incorrectCredentials"))
      }

      const newAccessToken = generateAccessToken(user.id)

      // Store the new access token in a HttpOnly cookie
      cookies().set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 // 1 day
      })

      return NextResponse.json({ accessToken: newAccessToken }, { status: HttpStatus.OK })
    } catch (err) {
      cookies().delete("accessToken")
      cookies().delete("refreshToken")
      if (err instanceof JsonWebTokenError) {
        throw createError(errors.ForbiddenError, t("api.errors.sessionExpired"))
      }

      throw createError(errors.ForbiddenError, t("api.errors.sessionExpired"))
    }
  })
)
