import { NextApiRequest, NextApiResponse } from "next"
import cookie from "cookie"
import { HttpStatus } from "@/enums/httpStatus"
import { getI18n } from "@/locales/server"
import { withErrorHandler } from "@/middlewares/withErrorHandler"

async function logout(req: NextApiRequest, res: NextApiResponse) {
  const t = await getI18n()

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: -1
    })
  )

  return res.status(HttpStatus.OK).json({ message: t("api.success.loggedOut") })
}

export default withErrorHandler(logout)
