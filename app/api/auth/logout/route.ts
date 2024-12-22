import { getI18n } from "@/locales/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = withErrorHandler(async (request: Request) => {
  const t = await getI18n()

  cookies().delete("refreshToken")
  return NextResponse.json({ message: t("api.success.loggedOut") })
})
