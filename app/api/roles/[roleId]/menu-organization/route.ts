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
        const roles = await prisma.role.findUnique({
          where: { id: roleId },
          select: {
            id: true,
            name: true,
            roleMenus: {
              select: {
                baseMenu: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
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

        if (!roles) {
          throw createError(errors.NotFoundError, t("api.errors.roleNotFound"))
        }

        const roleWithPermissions = {
          menus: roles.roleMenus.map((menu) => ({
            id: menu.baseMenu?.id,
            name: menu.baseMenu?.name
          })),
          permissions: roles.roleMenus.map(menu => {
            menu.specificPermissions.map(perm => ({
              name: perm.baseSpecificPerm,
              granted: perm.granted
            }))
          })
        }

        return NextResponse.json(roleWithPermissions)
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

        // Check if the menuIds exist in the OrganizationMenu table
        const existingMenus = await prisma.organizationMenu.findMany({
          where: {
            baseMenuId: {
              in: menuIds
            }
          },
          select: {
            id: true
          }
        })

        // If not all menuIds exist, throw an error
        if (existingMenus.length !== menuIds.length) {
          throw createError(errors.BadRequestError, t("api.errors.invalidMenuIds"))
        }

        // Update the role's menus in a transaction
        const updatedRole = await prisma.$transaction(async (tx) => {
          // Delete existing menu associations for the role
          await tx.roleMenu.deleteMany({
            where: { roleId }
          })

          // Create new menu associations
          await tx.roleMenu.createMany({
            data: menuIds.map((baseMenuId: string) => ({
              roleId,
              baseMenuId
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
