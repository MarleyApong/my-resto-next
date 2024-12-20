import { NextApiRequest, NextApiResponse } from "next"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"
import cookie from "cookie"
import prisma from "@/lib/db"

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" })
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

    return res.status(200).json({ accessToken })
  } else {
    return res.status(405).json({ message: "Method not allowed" })
  }
}
