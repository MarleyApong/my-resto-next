import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/jwt"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import prisma from "@/lib/db"

// Define a proper type for the decoded token
interface DecodedToken {
  userId: string
  iat: number
  exp: number
}

// Extended Request type to include user
interface ExtendedRequest extends Request {
  user: any // We'll properly type this below with UserWithRelations
}

type RouteHandler = (request: ExtendedRequest) => Promise<NextResponse> | NextResponse

// Type for user with all necessary relations
type UserWithRelations = {
  id: string
  email: string
  firstName: string
  lastName: string | null
  role: {
    id: string
    name: string
    permissions: {
      menuId: string
      view: boolean
      create: boolean
      update: boolean
      delete: boolean
    }[]
  }
  status: {
    id: string
    name: string
  }
  organizations: {
    organization: {
      id: string
      name: string
      email: string
    }
  }[]
  restaurants: {
    restaurant: {
      id: string
      name: string
      email: string
    }
  }[]
}

export function withAuth(handler: RouteHandler) {
  return async (request: Request) => {
    const t = await getI18n()
    const cookieStore = cookies()
    const accessToken = cookieStore.get("accessToken")

    if (!accessToken) {
      throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
    }

    try {
      // Verify and decode the token
      const decoded = verifyAccessToken(accessToken.value) as DecodedToken

      // Get user with all necessary relations
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          deletedAt: null // Ensure user is not soft-deleted
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  menuId: true,
                  view: true,
                  create: true,
                  update: true,
                  delete: true
                }
              }
            }
          },
          status: {
            select: {
              id: true,
              name: true
            }
          },
          organizations: {
            select: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          restaurants: {
            select: {
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (!user) {
        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      // Verify user status is active
      if (user.status.name !== "ACTIVE") {
        throw createError(errors.UnauthorizedError, t("api.errors.inactiveAccount"))
      }

      // Create new request with user data
      const requestWithUser = new Request(request, {
        headers: request.headers
      }) as ExtendedRequest

      // Attach user data to request
      requestWithUser.user = user

      return handler(requestWithUser)
    } catch (err: any) {
      if (err.name === "JsonWebTokenError") {
        throw createError(errors.UnauthorizedError, t("api.errors.invalidToken"))
      }
      if (err.name === "TokenExpiredError") {
        throw createError(errors.UnauthorizedError, t("api.errors.tokenExpired"))
      }
      throw err
    }
  }
}
