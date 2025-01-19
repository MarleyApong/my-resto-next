import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { assignMenusSchema } from "@/schemas/role"

export const GET = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "view"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { roleId: string } }) => {
        const t = await getI18n()
        const { roleId } = params

        // Check if the role exists
        const role = await prisma.role.findUnique({
          where: { id: roleId }
        })
        if (!role) {
          throw createError(errors.NotFoundError, t("api.errors.roleNotFound"))
        }

        // Fetch the role with its menus, permissions, and specific permissions
        const roleWithPermissions = await prisma.role.findUnique({
          where: { id: roleId },
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
                        name: true,
                        specificsPermissions: {
                          select: {
                            id: true,
                            name: true
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
            },
            organization: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        if (!roleWithPermissions) {
          throw createError(errors.NotFoundError, t("api.errors.roleNotFound"))
        }

        // Transform the data to include menus with their permissions and specific actions
        const roleMenuWithPermissions = roleWithPermissions.rolesOrganizationsMenus.map((roleOrganizationMenu) => {
          const menuId = roleOrganizationMenu.organizationMenu.menu.id
          const menuPermissions = roleWithPermissions.permissions.find((permission) => permission.menuId === menuId)

          return {
            id: roleOrganizationMenu.organizationMenu.menu.id,
            name: roleOrganizationMenu.organizationMenu.menu.name,
            permissions: {
              view: menuPermissions?.view || false,
              create: menuPermissions?.create || false,
              update: menuPermissions?.update || false,
              delete: menuPermissions?.delete || false
            },
            specificsPermissions: roleOrganizationMenu.organizationMenu.menu.specificsPermissions || []
          }
        })

        return NextResponse.json({
          role: {
            id: roleWithPermissions.id,
            name: roleWithPermissions.name,
            organization: roleWithPermissions.organization
          },
          menus: roleMenuWithPermissions
        })
      })
    )
  )
)

export const PUT = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { roleId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the request body
        try {
          assignMenusSchema.parse(body)
        } catch (error) {
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const { roleId } = params
        const { menuIds } = body

        // Check if the role exists
        const role = await prisma.role.findUnique({
          where: { id: roleId }
        })
        if (!role) {
          throw createError(errors.NotFoundError, t("api.errors.roleNotFound"))
        }

        // Update the role's menus in a transaction
        const updatedRole = await prisma.$transaction(async (tx) => {
          // Delete existing menu associations for the role
          await tx.roleOrganizationMenu.deleteMany({
            where: { roleId }
          })

          // Create new menu associations
          await tx.roleOrganizationMenu.createMany({
            data: menuIds.map((menuId: string) => ({
              roleId,
              organizationMenuId: menuId // Use organizationMenuId instead of menuId
            }))
          })

          // Log the menu assignment action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: role.id,
              entityType: "ROLE"
            }
          })

          return role
        })

        // Return the response with the updated role
        return NextResponse.json({
          message: t("api.success.menusAssigned"),
          data: updatedRole
        })
      })
    )
  )
)
