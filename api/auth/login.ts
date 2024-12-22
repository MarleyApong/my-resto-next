import bcrypt from "bcryptjs"
import cookie from "cookie"
import prisma from "@/lib/db"
import { NextApiRequest, NextApiResponse } from "next"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import { HttpStatus } from "@/enums/httpStatus"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { withErrorHandler } from "@/middlewares/withErrorHandler"

async function login(req: NextApiRequest, res: NextApiResponse) {
  const t = await getI18n()

  if (req.method === "POST") {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError(errors.UnauthorizedError, t("api.errors.incorrectCredentials"))
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw createError(errors.UnauthorizedError, t("api.errors.incorrectCredentials"))
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 // 7 jours
      })
    )

    return res.status(HttpStatus.OK).json({ accessToken })
  } else {
    throw createError(errors.MethodNotAllowedError, t("api.errors.methodNotAllowed"))
  }
}

export default withErrorHandler(login)
