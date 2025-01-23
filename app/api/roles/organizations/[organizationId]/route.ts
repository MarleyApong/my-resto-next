import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"

export const GET = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { organizationId: string } }) => {
        const { organizationId } = params
        const t = await getI18n()

        // Vérifier si l'organisation existe
        const organization = await prisma.organization.findUnique({
          where: {
            id: organizationId,
            deletedAt: null
          }
        })

        if (!organization) {
          throw createError(errors.NotFoundError, t("api.errors.organizationNotFound"))
        }

        // Récupérer les rôles avec leurs menus, permissions et permissions spécifiques
        const roles = await prisma.role.findMany({
          where: {
            organizationId: organizationId,
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            roleMenus: {
              select: {
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
            },
            organization: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        const transformedMenusInArray = roles.map(role => ({
          id: role.id,
          name: role.name,
          menus: role.roleMenus.map(menu => menu.baseMenu?.id)
        }))

        return NextResponse.json(transformedMenusInArray)
      })
    )
  )
)
