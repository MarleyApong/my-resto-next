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

        // Fetch the role with its associated menus, permissions, and specific actions
        const roleWithPermissions = await prisma.role.findUnique({
          where: { id: roleId },
          select: {
            id: true,
            name: true,
            menus: {
              select: {
                menuId: true,
                menu: {
                  select: {
                    id: true,
                    name: true
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
                delete: true,
                permissionActions: {
                  select: {
                    id: true,
                    name: true
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

        if (!roleWithPermissions) {
          throw createError(errors.NotFoundError, t("api.errors.roleNotFound"))
        }

        // Transform the data to include menus with their permissions and specific actions
        const menusWithPermissions = roleWithPermissions.menus.map((roleMenu) => {
          const menuPermissions = roleWithPermissions.permissions.find(
            (permission) => permission.menuId === roleMenu.menuId
          );
        
          return {
            id: roleMenu.menu.id,
            name: roleMenu.menu.name,
            permissions: {
              view: menuPermissions?.view || false,
              create: menuPermissions?.create || false,
              update: menuPermissions?.update || false,
              delete: menuPermissions?.delete || false
            },
            specificActions: menuPermissions?.permissionActions || [] // Include specific actions
          };
        });

        return NextResponse.json({
          role: {
            id: roleWithPermissions.id,
            name: roleWithPermissions.name,
            organization: roleWithPermissions.organization
          },
          menus: menusWithPermissions
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
          await tx.roleMenu.deleteMany({
            where: { roleId }
          })

          // Create new menu associations
          await tx.roleMenu.createMany({
            data: menuIds.map((menuId: string) => ({
              roleId,
              menuId
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
