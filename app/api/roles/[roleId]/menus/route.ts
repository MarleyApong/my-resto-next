import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"
import { getI18n } from "@/locales/server"
import { assignMenusSchema } from "@/schemas/role"
import { createError, errors } from "@/lib/errors"

export const PUT = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { roleId: string } }) => {
        const t = await getI18n()
        const body = await request.json()
        console.log("body", body);
        

        // Validate the request body
        try {
          assignMenusSchema.parse(body)
        } catch (error) {
          console.log("Validation error details:", error)
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
          const role = await tx.role.update({
            where: { id: roleId },
            data: {
              menuIds: menuIds // Update the menu IDs
            }
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
