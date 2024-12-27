import { NextResponse } from "next/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"

export const GET = withLogging(
  withErrorHandler(
    withAuth(async (request: Request) => {
      // @ts-ignore - withAuth middleware adds user to request
      const user = request.user

      // Filter out sensitive data
      const { password, temporyPassword, expiryPassword, ...safeUser } = user

      return NextResponse.json({
        user: safeUser
      })
    })
  )
)
