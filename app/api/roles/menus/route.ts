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
            rolesOrganizationsMenus: {
              select: {
                organizationMenu: {
                  select: {
                    menuId: true // Fetch the menuId from OrganizationMenu
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

        // Transform the data to include menus in an array
        const transformedMenusInArray = roles.map((role) => ({
          id: role.id,
          name: role.name,
          organization: role.organization, // Include organization details
          menus: role.rolesOrganizationsMenus.map((rom) => rom.organizationMenu.menuId) // Extract menuIds
        }))

        return NextResponse.json(transformedMenusInArray)
      })
    )
  )
)
