import { NextApiRequest, NextApiResponse } from "next"
import { verifyRefreshToken } from "@/lib/jwt"
import { generateAccessToken } from "@/lib/jwt"
import prisma from "@/lib/db"

import { JwtPayload } from "jsonwebtoken"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { HttpStatus } from "@/enums/httpStatus"

function isJwtPayload(token: string | JwtPayload): token is JwtPayload {
  return typeof token !== "string" && "userId" in token
}

async function refresh(req: NextApiRequest, res: NextApiResponse) {
  const t = await getI18n()

  if (req.method === "POST") {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      throw createError(errors.UnauthorizedError, t("api.errors.refreshTokenNotFound"))
    }

    try {
      const decoded = verifyRefreshToken(refreshToken as string)

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
      return res.status(HttpStatus.OK).json({ accessToken: newAccessToken })
    } catch (err) {
      throw createError(errors.ForbiddenError, t("api.errors.invalidRefreshToken"))
    }
  } else {
    throw createError(errors.MethodNotAllowedError, t("api.errors.methodNotAllowed"))
  }
}

export default withErrorHandler(refresh)
