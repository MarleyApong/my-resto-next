import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "view"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { menuId: string } }) => {
        const { menuId } = params

        // Fetch specific permissions for the given menuId
        const specificPermissions = await prisma.baseSpecificPermission.findMany({
          where: {
            baseMenuId: menuId // Filter by menuId
          },
          select: {
            id: true,
            name: true,
            description: true
          }
        })

        return NextResponse.json(specificPermissions)
      })
    )
  )
)

