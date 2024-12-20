import { NextApiRequest, NextApiResponse } from "next"
import { verifyRefreshToken } from "@/lib/jwt"
import { generateAccessToken } from "@/lib/jwt"
import prisma from "@/lib/db"

import { JwtPayload } from "jsonwebtoken"

function isJwtPayload(token: string | JwtPayload): token is JwtPayload {
  return typeof token !== "string" && "userId" in token
}

export default async function refresh(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" })
    }

    try {
      const decoded = verifyRefreshToken(refreshToken as string)

      if (!isJwtPayload(decoded)) {
        return res.status(403).json({ message: "Invalid refresh token" })
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        return res.status(401).json({ message: "User not found" })
      }

      const newAccessToken = generateAccessToken(user.id)
      return res.status(200).json({ accessToken: newAccessToken })
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" })
  }
}
