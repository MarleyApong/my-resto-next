import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { z } from "zod"
import { headers } from "next/headers"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"

const loginSchema = z.object({
  email: z
    .string()
    .email()
    .min(1)
    .max(100)
    .trim()
    .toLowerCase()
    .regex(/^[^<>*%&]+$/, "Special characters are not allowed"),
  password: z
    .string()
    .min(8)
    .max(64)
    .regex(/^[^<>*%&]+$/, "Special characters are not allowed")
})

export const POST = withLogging(
  withErrorHandler(async (request: Request) => {
    const t = await getI18n()
    const body = await request.json()
    const headersList = headers()

    try {
      loginSchema.parse(body)
    } catch (error) {
      throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
    }

    const { email, password } = body

    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null
      },
      select: {
        id: true,
        password: true,
        status: {
          select: {
            name: true
          }
        }
      }
    })

    if (!user) {
      throw createError(errors.UnauthorizedError, t("api.errors.incorrectCredentials"))
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw createError(errors.UnauthorizedError, t("api.errors.incorrectCredentials"))
    }

    if (user.status.name !== "ACTIVE") {
      throw createError(errors.UnauthorizedError, t("api.errors.inactiveAccount"))
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        userAgent: headersList.get("user-agent") || null,
        ipAddress: (headersList.get("x-forwarded-for") || "::1").split(",")[0],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    })

    // Set session cookie
    cookies().set("sessionId", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      message: t("api.success.loggedIn")
    })
  })
)
