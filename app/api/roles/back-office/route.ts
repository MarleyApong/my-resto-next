import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "back-office-manage",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }) => {
        const roles = await prisma.role.findMany({
          where: {
            deletedAt: null,
            organizationId: null
          },
          select: {
            id: true,
            name: true,
            roleMenus: {
              select: {
                baseMenuId: true
              }
            }
          }
        })

        const transformedRoleAndMenusInArray = roles.map(role => ({
          id: role.id,
          name: role.name,
          menus: role.roleMenus.map(menu => menu.baseMenuId)
        }))

        return NextResponse.json(transformedRoleAndMenusInArray)
      })
    )
  )
)
