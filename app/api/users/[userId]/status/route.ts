import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { userUpdateStatusSchema } from "@/schemas/user"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import { prisma } from "@/lib/db"

export const PATCH = withLogging(
  withAuth(
    withPermission(
      "employees",
      SpecificPermissionAction.UPDATE_STATUS
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { userId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the input data against the update schema
        try {
          userUpdateStatusSchema.parse(body)
        } catch (error) {
          console.log("Validation error details:", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Find the user to update
        const user = await prisma.user.findUnique({
          where: { id: params.userId }
        })
        if (!user) {
          throw createError(errors.NotFoundError, t("api.errors.userNotFound"))
        }

        // Find the status for the user
        const status = await prisma.status.findFirst({
          where: { name: body.status.toUpperCase() }
        })
        if (!status) {
          throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
        }

        // Update the user status in a transaction
        const updatedRestaurant = await prisma.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id: params.userId },
            data: {
              statusId: status.id
            }
          })

          // Log the update action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: user.id,
              entityType: "USER"
            }
          })

          return user
        })

        // Return the updated user
        return NextResponse.json({
          message: t("api.success.userStatusUpdated"),
          data: updatedRestaurant
        })
      })
    )
  )
)
