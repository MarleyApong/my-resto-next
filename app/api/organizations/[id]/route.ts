// api/organizations/[id]/route.ts
import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { organizationUpdateSchema, organizationUpdatePictureSchema, organizationUpdateStatusSchema } from "@/schemas/organization"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { imageProcessing } from "@/lib/imageProcessing"
import prisma from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withErrorHandler(async (request: Request, { params }: { params: { id: string } }) => {
      const organization = await prisma.organization.findUnique({
        where: { id: params.id },
        include: {
          status: {
            select: {
              name: true
            }
          }
        }
      })

      if (!organization) {
        throw createError(errors.NotFoundError, "Organization not found")
      }

      return NextResponse.json({ data: organization })
    })
  )
)

export const PUT = withLogging(
  withAuth(
    withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { id: string } }) => {
      const t = await getI18n()
      const body = await request.json()

      // Validate the input data against the update schema
      try {
        organizationUpdateSchema.parse(body)
      } catch (error) {
        console.log("Validation error details:", error)
        throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
      }

      // Check if the user has permission to update organizations
      const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "organizations" && p.update)
      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Find the organization to update
      const organization = await prisma.organization.findUnique({
        where: { id: params.id }
      })
      if (!organization) {
        throw createError(errors.NotFoundError, "Organization not found")
      }

      // Update the organization in a transaction
      const updatedOrganization = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.update({
          where: { id: params.id },
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
            entityType: "Organization"
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

export const DELETE = withLogging(
  withAuth(
    withErrorHandler(async (request: Request & { user?: any }, context: { params: { id: string } }) => {
      const t = await getI18n()
      const { params } = context

      console.log("Request:", request)
      console.log("Params:", params)

      const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "organizations" && p.delete)
      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      await prisma.$transaction(async (tx) => {
        await tx.organization.update({
          where: { id: params.id },
          data: { deletedAt: new Date() }
        })

        await tx.auditLog.create({
          data: {
            actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
            userId: request.user.id,
            entityId: params.id,
            entityType: "Organization"
          }
        })
      })

      return NextResponse.json({ message: t("api.success.organizationDeleted") })
    })
  )
)
