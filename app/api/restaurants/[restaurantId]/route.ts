import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { restaurantUpdateSchema } from "@/schemas/restaurant"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import prisma from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "restaurants",
      "update"
    )(
      withErrorHandler(async (request: Request, { params }: { params: { restaurantId: string } }) => {
        const t = await getI18n()

        const restaurant = await prisma.restaurant.findUnique({
          where: { id: params.restaurantId },
          include: {
            status: {
              select: {
                name: true
              }
            }
          }
        })

        if (!restaurant) {
          throw createError(errors.NotFoundError, t("api.errors.restaurantNotFound"))
        }

        const restaurantsWithFlatStatus = { ...restaurant, status: restaurant.status.name }

        return NextResponse.json({ data: restaurantsWithFlatStatus })
      })
    )
  )
)

export const PUT = withLogging(
  withAuth(
    withPermission(
      "restaurants",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { restaurantId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the input data against the update schema
        try {
          restaurantUpdateSchema.parse(body)
        } catch (error) {
          console.log("Validation error details:", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Find the restaurant to update
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: params.restaurantId }
        })
        if (!restaurant) {
          throw createError(errors.NotFoundError, t("api.errors.restaurantNotFound"))
        }

        // Update the restaurant in a transaction
        const updatedRestaurant = await prisma.$transaction(async (tx) => {
          const resto = await tx.restaurant.update({
            where: { id: params.restaurantId },
            data: {
              name: body.name,
              description: body.description,
              city: body.city,
              neighborhood: body.neighborhood,
              phone: body.phone
            }
          })

          // Log the update action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: resto.id,
              entityType: "RESTAURANT"
            }
          })

          return resto
        })

        // Return the updated restaurant
        return NextResponse.json({
          message: t("api.success.restaurantUpdated"),
          data: updatedRestaurant
        })
      })
    )
  )
)

export const DELETE = withLogging(
  withAuth(
    withPermission(
      "restaurants",
      "delete"
    )(
      withErrorHandler(async (request: Request & { user?: any }, context: { params: { restaurantId: string } }) => {
        const t = await getI18n()
        const { params } = context

        await prisma.$transaction(async (tx) => {
          await tx.restaurant.update({
            where: { id: params.restaurantId },
            data: { deletedAt: new Date() }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
              userId: request.user.id,
              entityId: params.restaurantId,
              entityType: "RESTAURANT"
            }
          })
        })

        return NextResponse.json({ message: t("api.success.restaurantDeleted") })
      })
    )
  )
)
