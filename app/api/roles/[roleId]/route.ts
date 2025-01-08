import { prisma } from "@/lib/db"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { withPermission } from "@/middlewares/withPermission"
import { roleUpdateSchema } from "@/schemas/role"
import { NextResponse } from "next/server"

export const PUT = withLogging(
  withAuth(
    withPermission(
      "roles",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { roleId: string } }) => {
        const t = await getI18n()
        const { roleId } = params
        const body = await request.json()

        // Validate the request body
        try {
          roleUpdateSchema.parse(body)
        } catch (error) {
          console.log("error", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Update the role in a transaction
        const updatedRole = await prisma.$transaction(async (tx) => {
          // Update the role
          const role = await tx.role.update({
            where: { id: roleId },
            data: {
              name: body.name,
              description: body.description
            }
          })

          // Log the action in auditLog
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

        return NextResponse.json({
          message: t("api.success.roleUpdated"),
          data: updatedRole
        })
      })
    )
  )
)

export const DELETE = withLogging(
  withAuth(
    withPermission(
      "roles",
      "delete"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { roleId: string } }) => {
        const t = await getI18n()
        const { roleId } = params

        // Delete the role in a transaction
        await prisma.$transaction(async (tx) => {
          const role = await tx.role.delete({
            where: { id: roleId }
          })

          // Log the action in auditLog
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
              userId: request.user.id,
              entityId: role.id,
              entityType: "ROLE"
            }
          })
        })

        return NextResponse.json({
          message: t("api.success.roleDeleted")
        })
      })
    )
  )
)
