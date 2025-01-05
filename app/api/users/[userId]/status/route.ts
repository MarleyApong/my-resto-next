import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { restaurantUpdateStatusSchema } from "@/schemas/restaurant"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import prisma from "@/lib/db"

export const PATCH = withLogging(
  withAuth(
    withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { restaurantId: string } }) => {
      const t = await getI18n()
      const body = await request.json()

      // Validate the input data against the update schema
      try {
        restaurantUpdateStatusSchema.parse(body)
      } catch (error) {
        console.log("Validation error details:", error)
        throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
      }

      // Check if the user has permission to update restaurants
      const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "restaurants" && p.update)
      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Find the restaurant to update
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: params.restaurantId }
      })
      if (!restaurant) {
        throw createError(errors.NotFoundError, t("api.errors.restaurantNotFound"))
      }

      // Find the status for the restaurant
      const status = await prisma.status.findFirst({
        where: { name: body.status.toUpperCase() }
      })
      if (!status) {
        throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
      }

      // Update the restaurant status in a transaction
      const updatedRestaurant = await prisma.$transaction(async (tx) => {
        const user = await tx.restaurant.update({
          where: { id: params.restaurantId },
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

      // Return the updated restaurant
      return NextResponse.json({
        message: t("api.success.restaurantStatusUpdated"),
        data: updatedRestaurant
      })
    })
  )
)
