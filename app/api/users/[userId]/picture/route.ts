import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { userUpdatePictureSchema } from "@/schemas/user"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { imageProcessing } from "@/lib/imageProcessing"
import { withPermission } from "@/middlewares/withPermission"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import {prisma} from "@/lib/db"

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
          userUpdatePictureSchema.parse(body)
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

        // Handle the picture field
        let picturePath: string | null = user.picture
        if (body.picture && body.picture !== user.picture) {
          // If the picture is a base64 string, process it
          if (body.picture.startsWith("data:image/")) {
            const processedImagePath = await imageProcessing(body.picture)
            if (processedImagePath === null) {
              throw createError(errors.BadRequestError, t("api.errors.imageProcessingFailed"))
            }
            picturePath = processedImagePath
          }
          // If the picture is a path, use it directly
          else if (body.picture.startsWith("/api/imgs/users/")) {
            picturePath = body.picture
          }
          // If the picture is invalid, throw an error
          else {
            throw createError(errors.BadRequestError, t("api.errors.invalidImage"))
          }
        }

        // Update the user picture in a transaction
        const updatedRestaurant = await prisma.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id: params.userId },
            data: {
              picture: picturePath!
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
          message: t("api.success.userPictureUpdated"),
          data: updatedRestaurant
        })
      })
    )
  )
)
