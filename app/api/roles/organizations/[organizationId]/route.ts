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
            rolesOrganizationsMenus: {
              select: {
                organizationMenu: {
                  select: {
                    id: true,
                    menu: {
                      select: {
                        id: true,
                        name: true
                      }
                    },
                    specificsPermissions: {
                      select: {
                        specificPermission: {
                          select: {
                            id: true,
                            name: true,
                            description: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
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
        })

        // Transformer les données pour inclure les permissions et permissions spécifiques
        const transformedRoles = roles.map((role) => ({
          id: role.id,
          name: role.name,
          menus: role.rolesOrganizationsMenus.map((roleOrganizationMenu) => {
            const menuId = roleOrganizationMenu.organizationMenu.menu.id
            const permissions = role.permissions.find((p) => p.menuId === menuId)

            return {
              id: menuId,
              name: roleOrganizationMenu.organizationMenu.menu.name,
              permissions: {
                view: permissions?.view || false,
                create: permissions?.create || false,
                update: permissions?.update || false,
                delete: permissions?.delete || false
              },
              specificsPermissions: roleOrganizationMenu.organizationMenu.specificsPermissions.map((osp) => ({
                id: osp.specificPermission.id,
                name: osp.specificPermission.name,
                description: osp.specificPermission.description
              }))
            }
          })
        }))

        return NextResponse.json(transformedRoles)
      })
    )
  )
)
