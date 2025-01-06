import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { userUpdateSchema } from "@/schemas/user"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import prisma from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "users",
      "view"
    )(
      withErrorHandler(async (request: Request, { params }: { params: { userId: string } }) => {
        const t = await getI18n()

        const user = await prisma.user.findUnique({
          where: { id: params.userId },
          include: {
            status: {
              select: {
                name: true
              }
            }
          }
        })

        if (!user) {
          throw createError(errors.NotFoundError, t("api.errors.userNotFound"))
        }

        const usersWithFlatStatus = { ...user, status: user.status.name }

        return NextResponse.json({ data: usersWithFlatStatus })
      })
    )
  )
)

export const PUT = withLogging(
  withAuth(
    withPermission(
      "users",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { userId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the input data against the update schema
        try {
          userUpdateSchema.parse(body)
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

        // Update the user in a transaction
        const updatedUser = await prisma.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id: params.userId },
            data: {
              firstname: body.name,
              lastname: body.name,
              city: body.city,
              neighborhood: body.neighborhood,
              phone: body.phone,
              email: body.email
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
          message: t("api.success.userUpdated"),
          data: updatedUser
        })
      })
    )
  )
)

export const DELETE = withLogging(
  withAuth(
    withPermission(
      "users",
      "delete"
    )(
      withErrorHandler(async (request: Request & { user?: any }, context: { params: { userId: string } }) => {
        const t = await getI18n()
        const { params } = context

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: params.userId },
            data: { deletedAt: new Date() }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
              userId: request.user.id,
              entityId: params.userId,
              entityType: "USER"
            }
          })
        })

        return NextResponse.json({ message: t("api.success.userDeleted") })
      })
    )
  )
)
