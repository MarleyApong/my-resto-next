import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import prisma from "@/lib/db"

interface ExtendedRequest extends Request {
  user: any
}

type RouteHandler = (request: ExtendedRequest) => Promise<NextResponse> | NextResponse

async function cleanupExpiredSessions() {
  const SHORT_TIMEOUT = 30 * 60 * 1000 // 30 minutes for restaurant application
  const MAX_SESSION_AGE = 12 * 60 * 60 * 1000 // 12 hours maximum session lifetime

  await prisma.session.updateMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // Absolute session expiry
        {
          lastActivity: {
            lt: new Date(Date.now() - SHORT_TIMEOUT)
          }
        } // Inactivity timeout
      ]
    },
    data: {
      valid: false
    }
  })
}

export function withAuth(handler: RouteHandler) {
  return async (request: Request) => {
    const t = await getI18n()
    const sessionId = cookies().get("sessionId")?.value

    if (!sessionId) {
      cookies().set("sessionId", "", { path: "/", expires: new Date(0) }) // Supprime le cookie
      throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
    }

    try {
      // Get session with user data
      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
          valid: true
        },
        include: {
          user: {
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
          }
        }
      })

      if (
        !session ||
        !session.user ||
        session.lastActivity < new Date(Date.now() - 30 * 60 * 1000) || // Inactivity timeout
        session.expiresAt < new Date() // Absolute expiry
      ) {
        // Invalidate session and delete cookie
        cookies().set("sessionId", "", { path: "/", expires: new Date(0) })
        await prisma.session.update({
          where: { id: sessionId },
          data: { valid: false }
        })

        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      // Update last activity atomically
      await prisma.session.update({
        where: {
          id: sessionId,
          valid: true // Extra safety check
        },
        data: {
          lastActivity: new Date()
        }
      })

      // Verify user status is active
      if (session.user.status.name !== "ACTIVE") {
        throw createError(errors.UnauthorizedError, t("api.errors.inactiveAccount"))
      }

      const requestWithUser = new Request(request, {
        headers: request.headers
      }) as ExtendedRequest

      requestWithUser.user = session.user

      return handler(requestWithUser)
    } catch (err: any) {
      // In case of any error, clean up cookie and throw error
      cookies().set("sessionId", "", { path: "/", expires: new Date(0) }) // Supprime le cookie
      throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
    }
  }
}
