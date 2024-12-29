import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { organizationSchema } from "@/schemas/organization"
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

      try {
        organizationSchema.parse(body)
      } catch (error) {
        throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
      }

      const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "organizations" && p.update)
      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      const organization = await prisma.organization.findUnique({
        where: { id: params.id }
      })
      if (!organization) {
        throw createError(errors.NotFoundError, "Organization not found")
      }

      const status = await prisma.status.findFirst({
        where: { name: body.status.toUpperCase() }
      })
      if (!status) {
        throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
      }

      let picturePath = organization.picture
      if (body.picture && body.picture !== organization.picture) {
        picturePath = await imageProcessing(body.picture)
      }

      const updatedOrganization = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.update({
          where: { id: params.id },
          data: {
            name: body.name,
            description: body.description,
            city: body.city,
            neighborhood: body.neighborhood,
            phone: body.phone,
            email: body.email,
            picture: picturePath,
            statusId: status.id
          }
        })

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

      return NextResponse.json({
        message: t("api.success.organizationUpdated"),
        data: updatedOrganization
      })
    })
  )
)

export const DELETE = withLogging(
  withAuth(
    withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { id: string } }) => {
      const t = await getI18n()
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
