import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { organizationUpdateSchema } from "@/schemas/organization"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import {prisma} from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "organizations",
      "view"
    )(
      withErrorHandler(async (request: Request, { params }: { params: { organizationId: string } }) => {
        const t = await getI18n()

        const organization = await prisma.organization.findUnique({
          where: { id: params.organizationId },
          include: {
            status: {
              select: {
                name: true
              }
            }
          }
        })

        if (!organization) {
          throw createError(errors.NotFoundError, t("api.errors.organizationNotFound"))
        }

        const organizationsWithFlatStatus = { ...organization, status: organization.status.name }

        return NextResponse.json({ data: organizationsWithFlatStatus })
      })
    )
  )
)

export const PUT = withLogging(
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
          organizationUpdateSchema.parse(body)
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

        // Update the organization in a transaction
        const updatedOrganization = await prisma.$transaction(async (tx) => {
          const org = await tx.organization.update({
            where: { id: params.organizationId },
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
              entityId: org.id,
              entityType: "ORGANIZATION"
            }
          })

          return org
        })

        // Return the updated organization
        return NextResponse.json({
          message: t("api.success.organizationUpdated"),
          data: updatedOrganization
        })
      })
    )
  )
)

export const DELETE = withLogging(
  withAuth(
    withPermission(
      "organizations",
      "delete"
    )(
      withErrorHandler(async (request: Request & { user?: any }, context: { params: { organizationId: string } }) => {
        const t = await getI18n()
        const { params } = context

        const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "organizations" && p.delete)
        if (!hasPermission) {
          throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
        }

        await prisma.$transaction(async (tx) => {
          await tx.organization.update({
            where: { id: params.organizationId },
            data: { deletedAt: new Date() }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
              userId: request.user.id,
              entityId: params.organizationId,
              entityType: "ORGANIZATION"
            }
          })
        })

        return NextResponse.json({ message: t("api.success.organizationDeleted") })
      })
    )
  )
)
