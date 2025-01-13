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
        const roles = await prisma.role.findMany({
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            menus: {
              select: {
                menuId: true
              }
            },
            organization: {
              select: {
                id: true,
                name: true
              }
            },
          }
        })

        const transformedMenusInArray = roles.map(org => ({
          id: org.id,
          name: org.name,
          menus: org.menus.map(menu => menu.menuId)
        }))


        return NextResponse.json(transformedMenusInArray)
      })
    )
  )
)
