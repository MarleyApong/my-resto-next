import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { organizationUpdateStatusSchema } from "@/schemas/organization"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import prisma from "@/lib/db"

export const PATCH = withLogging(
  withAuth(
    withPermission(
      "organizations",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { organizationId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the input data against the update schema
        try {
          organizationUpdateStatusSchema.parse(body)
        } catch (error) {
          console.log("Validation error details:", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Find the organization to update
        const organization = await prisma.organization.findUnique({
          where: { id: params.organizationId }
        })
        if (!organization) {
          throw createError(errors.NotFoundError, t("api.errors.organizationNotFound"))
        }

        // Find the status for the organization
        const status = await prisma.status.findFirst({
          where: { name: body.status.toUpperCase() }
        })
        if (!status) {
          throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
        }

        // Update the organization status in a transaction
        const updatedOrganization = await prisma.$transaction(async (tx) => {
          const org = await tx.organization.update({
            where: { id: params.organizationId },
            data: {
              statusId: status.id
            }
          })

          // Log the update action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: org.id,
              entityType: "ORGANIZATION"
            }
          })

          return org
        })

        // Return the updated organization
        return NextResponse.json({
          message: t("api.success.organizationStatusUpdated"),
          data: updatedOrganization
        })
      })
    )
  )
)
