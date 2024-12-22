import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt"
import { JwtPayload } from "jsonwebtoken"
import { getI18n } from "@/locales/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import prisma from "@/lib/db"
import { createError, errors } from "@/lib/errors"
import { HttpStatus } from "@/enums/httpStatus"

function isJwtPayload(token: string | JwtPayload): token is JwtPayload {
  return typeof token !== "string" && "userId" in token
}

export const POST = withErrorHandler(async (request: Request) => {
  const t = await getI18n()
  const cookieStore = cookies()
  const refreshToken = cookieStore.get("refreshToken")

  if (!refreshToken) {
    throw createError(errors.UnauthorizedError, t("api.errors.refreshTokenNotFound"))
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

    return NextResponse.json({ accessToken: newAccessToken }, { status: HttpStatus.OK })
  } catch (err) {
    throw createError(errors.ForbiddenError, t("api.errors.invalidRefreshToken"))
  }
})
