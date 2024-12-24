import { NextResponse } from "next/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"

export const GET = withLogging(
  withErrorHandler(
    withAuth(async (request: Request) => {
      // @ts-ignore
      const user = request.user

      // Ne pas renvoyer le mot de passe
      const { password, ...safeUser } = user

      return NextResponse.json({
        user: safeUser
      })
    })
  )
)
