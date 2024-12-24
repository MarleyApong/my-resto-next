import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/jwt"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import prisma from "@/lib/db"

type RouteHandler = (request: Request) => Promise<NextResponse> | NextResponse

export function withAuth(handler: RouteHandler) {
  return async (request: Request) => {
    const t = await getI18n()
    const cookieStore = cookies()
    const accessToken = cookieStore.get("accessToken")

    if (!accessToken) {
      throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
    }

    try {
      const decoded = verifyAccessToken(accessToken.value) as { userId: string }

      // Vérifier si l'utilisateur existe toujours dans la base de données
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      // Ajouter l'utilisateur à la requête pour une utilisation ultérieure
      const requestWithUser = new Request(request, {
        headers: request.headers
      })
      // @ts-ignore
      requestWithUser.user = user

      return handler(requestWithUser)
    } catch (err: any) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        throw createError(errors.UnauthorizedError, t("api.errors.invalidToken"))
      }
      throw err
    }
  }
}
