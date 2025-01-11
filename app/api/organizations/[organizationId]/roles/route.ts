import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"

export const GET = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { organizationId: string } }) => {
        const { organizationId } = params
        const t = await getI18n()

        // Check if organization exist
        const organization = await prisma.organization.findUnique({
          where: {
            id: organizationId,
            deletedAt: null
          }
        })

        if (!organization) {
          throw createError(errors.NotFoundError, t("api.errors.organizationNotFound"))
        }

        // Get role by organizationId
        const roles = await prisma.role.findMany({
          where: {
            organizationId: organizationId,
            deletedAt: null
          },
          select: {
            id: true,
            name: true
          }
        })

        return NextResponse.json(roles)
      })
    )
  )
)
