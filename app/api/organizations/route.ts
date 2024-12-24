import { NextResponse } from "next/server"
import { getI18n } from "@/locales/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import prisma from "@/lib/db"

export const GET = withLogging(
  withErrorHandler(
    withAuth(async (request: Request) => {
      const t = await getI18n()
      // @ts-ignore
      const user = request.user

      const organizations = await prisma.organization.findMany({
        where: {
          userId: user.id
        }
      })

      return NextResponse.json({
        message: t("api.success.organizationsRetrieved"),
        data: organizations
      })
    })
  )
)
