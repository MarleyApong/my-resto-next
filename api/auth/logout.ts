import { NextApiRequest, NextApiResponse } from "next"
import cookie from "cookie"

export default function logout(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: -1 // Expirer le cookie
    })
  )

  return res.status(200).json({ message: "Logged out" })
}
