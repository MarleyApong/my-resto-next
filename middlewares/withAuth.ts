import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { prisma } from "@/lib/db"

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

    if (!sessionId) {
      clearSessionCookie()
      throw createError(errors.UnauthorizedError, t("api.errors.noSession"))
    }

    try {
      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
          valid: true
        },
        select: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              picture: true,
              status: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  organizationId: true,
                  roleMenus: {
                    select: {
                      create: true,
                      view: true,
                      update: true,
                      delete: true,
                      baseMenu: {
                        select: {
                          id: true,
                          name: true,
                          description: true
                        }
                      },
                      specificPermissions: {
                        select: {
                          granted: true,
                          baseSpecificPerm: {
                            select: {
                              name: true
                            }
                          }
                        }
                      }
                    }
                  }
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

      if (!session || !session.user) {
        clearSessionCookie()
        throw createError(errors.SessionInvalidError, t("api.errors.invalidSession"))
      }

      // Vérifications supplémentaires (validité, expiration, etc.)
      const userData = {
        id: session.user.id,
        firstname: session.user.firstname,
        lastname: session.user.lastname,
        email: session.user.email,
        picture: session.user.picture,
        status: session.user.status,
        role: session.user.role
          ? {
              id: session.user.role.id,
              name: session.user.role.name,
              organization: session.user.role.organizationId
                ? {
                    id: session.user.role.organizationId,
                    name: session.user.role.organizationId
                  }
                : null,
              menus: session.user.role.roleMenus.map((roleMenu) => ({
                id: roleMenu.baseMenu?.id ?? "",
                name: roleMenu.baseMenu?.name ?? "",
                description: roleMenu.baseMenu?.description ?? "",
                permissions: {
                  create: roleMenu.create,
                  view: roleMenu.view,
                  update: roleMenu.update,
                  delete: roleMenu.delete
                },
                specificPermissions: roleMenu.specificPermissions.map((sp) => ({
                  name: sp.baseSpecificPerm?.name ?? "",
                  granted: sp.granted
                }))
              }))
            }
          : null,
        organization:
          session.user.organizations.length > 0
            ? {
                id: session.user.organizations[0].organization.id,
                name: session.user.organizations[0].organization.name,
                email: session.user.organizations[0].organization.email
              }
            : null,
        restaurant:
          session.user.restaurants.length > 0
            ? {
                id: session.user.restaurants[0].restaurant.id,
                name: session.user.restaurants[0].restaurant.name,
                email: session.user.restaurants[0].restaurant.email
              }
            : null
      }

      const requestWithUser = new Request(request, {
        headers: request.headers
      }) as ExtendedRequest

      requestWithUser.user = userData

      return handler(requestWithUser, context)
    } catch (err: any) {
      if (
        err.name === "UnauthorizedError" ||
        err.name === "SessionInvalidError" ||
        err.name === "SessionExpiredError" ||
        err.name === "SessionRevokedError" ||
        err.name === "InactiveAccountError" ||
        err.status === 401 ||
        err.code === "P2025"
      ) {
        clearSessionCookie()
      }

      throw err
    }
  }
}
