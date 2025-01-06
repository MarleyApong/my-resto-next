import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import prisma from "@/lib/db"

interface ExtendedRequest extends Request {
  user: any
}

type RouteHandler = (request: ExtendedRequest, context: any) => Promise<NextResponse> | NextResponse

const clearSessionCookie = () => {
  cookies().set("sessionId", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  })
}

export function withAuth(handler: RouteHandler) {
  return async (request: Request, context: any) => {
    const t = await getI18n()
    const sessionId = cookies().get("sessionId")?.value

    // Si pas de sessionId dans les cookies
    if (!sessionId) {
      clearSessionCookie()
      throw createError(errors.UnauthorizedError, t("api.errors.noSession"))
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
              firstname: true,
              lastname: true,
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

      // Session n'existe pas dans la BD
      if (!session || !session.user) {
        clearSessionCookie()
        throw createError(errors.SessionInvalidError, t("api.errors.invalidSession"))
      }

      // Vérification de la validité
      if (!session.valid) {
        clearSessionCookie()
        throw createError(errors.SessionRevokedError, t("api.errors.sessionRevoked"))
      }

      // Vérification de l'expiration absolue
      if (session.expiresAt < new Date()) {
        clearSessionCookie()
        await prisma.session
          .update({
            where: { id: sessionId },
            data: { valid: false }
          })
          .catch(() => {})
        throw createError(errors.SessionExpiredError, t("api.errors.sessionExpired"))
      }

      // Vérification de l'inactivité
      if (session.lastActivity < new Date(Date.now() - 30 * 60 * 1000)) {
        clearSessionCookie()
        await prisma.session
          .update({
            where: { id: sessionId },
            data: { valid: false }
          })
          .catch(() => {})
        throw createError(errors.SessionExpiredError, t("api.errors.sessionInactive"))
      }

      try {
        // Mise à jour de la dernière activité de manière atomique
        await prisma.session.update({
          where: {
            id: sessionId,
            valid: true // Double vérification de sécurité
          },
          data: {
            lastActivity: new Date()
          }
        })
      } catch (updateError) {
        // Si la mise à jour échoue, on continue quand même
        // mais on log l'erreur pour le debugging
        console.error("Failed to update session lastActivity:", updateError)
      }

      // Vérification du statut de l'utilisateur
      if (session.user.status.name !== "ACTIVE") {
        clearSessionCookie()
        await prisma.session
          .update({
            where: { id: sessionId },
            data: { valid: false }
          })
          .catch(() => {})
        throw createError(errors.InactiveAccountError, t("api.errors.inactiveAccount"))
      }

      // Ajout de l'utilisateur à la requête
      const requestWithUser = new Request(request, {
        headers: request.headers
      }) as ExtendedRequest

      requestWithUser.user = session.user

      return handler(requestWithUser, context)
    } catch (err: any) {
      // On ne nettoie le cookie que si c'est une erreur d'authentification
      // ou si l'erreur vient de Prisma (potentiellement session invalide)
      if (
        err.name === "UnauthorizedError" ||
        err.name === "SessionInvalidError" ||
        err.name === "SessionExpiredError" ||
        err.name === "SessionRevokedError" ||
        err.name === "InactiveAccountError" ||
        err.status === 401 ||
        err.code === "P2025" // Prisma error pour record non trouvé
      ) {
        clearSessionCookie()
      }

      throw err
    }
  }
}
