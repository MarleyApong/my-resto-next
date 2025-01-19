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
      withErrorHandler(async (request: Request & { user?: any }) => {
        const organizations = await prisma.organization.findMany({
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            organizationsMenus: {
              select: {
                menuId: true
              }
            }
          }
        })

        const transformedMenusInArray = organizations.map(org => ({
          id: org.id,
          name: org.name,
          menus: org.organizationsMenus.map(menu => menu.menuId)
        }))

        return NextResponse.json(transformedMenusInArray)
      })
    )
  )
)
