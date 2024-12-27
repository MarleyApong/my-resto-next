import prisma from "@/lib/db"
import { getI18n } from "@/locales/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = withLogging(
  withErrorHandler(async (request: Request) => {
    const t = await getI18n()
    const sessionId = cookies().get("sessionId")?.value

    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { valid: false }
      })
    }

    cookies().delete("sessionId")
    return NextResponse.json({ message: t("api.success.loggedOut") })
  })
)
