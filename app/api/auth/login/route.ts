import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"

export const POST = withErrorHandler(async (request: Request) => {
  const t = await getI18n()

  const body = await request.json()
  const { email, password } = body

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

  // Utiliser l'API moderne de cookies
  cookies().set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 // 7 jours
  })

  return NextResponse.json({ accessToken })
})
