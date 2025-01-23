import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"
import { getI18n } from "@/locales/server"
import { assignMenusSchema } from "@/schemas/organization"
import { createError, errors } from "@/lib/errors"

export const PUT = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { organizationId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the request body
        try {
          assignMenusSchema.parse(body)
        } catch (error) {
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const { organizationId } = params
        const { menuIds } = body

        // Check if the organization exists
        const organization = await prisma.organization.findUnique({
          where: { id: organizationId }
        })
        if (!organization) {
          throw createError(errors.NotFoundError, t("api.errors.organizationNotFound"))
        }

        // Update the organization's menus in a transaction
        const updatedOrganization = await prisma.$transaction(async (tx) => {
          // Delete existing menu associations for the organization
          await tx.organizationMenu.deleteMany({
            where: { organizationId }
          })

          // Create new menu associations
          await tx.organizationMenu.createMany({
            data: menuIds.map((baseMenuId: string) => ({
              organizationId,
              baseMenuId
            }))
          })

          // Log the menu assignment action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: organization.id,
              entityType: "ORGANIZATION"
            }
          })

          return organization
        })

        // Return the response with the updated organization
        return NextResponse.json({
          message: t("api.success.menusAssigned"),
          data: updatedOrganization
        })
      })
    )
  )
)
