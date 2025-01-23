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
        // Fetch all roles with their associated menus and organization
        const roles = await prisma.role.findMany({
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            roleMenus: {
              select: {
                baseMenu: {
                  select: {
                    id: true,
                    name: true,
                    description: true
                  }
                },
                specificPermissions: {
                  select: {
                    granted: true,
                    baseSpecificPerm: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            organization: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        return NextResponse.json(roles)
      })
    )
  )
)
