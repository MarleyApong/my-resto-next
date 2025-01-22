import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import { prisma } from "@/lib/db"

const specificPermissionsByMenu: Record<string, SpecificPermissionAction[]> = {
  organizations: [SpecificPermissionAction.UPDATE_STATUS, SpecificPermissionAction.UPDATE_PICTURE, SpecificPermissionAction.EXPORT_DATA, SpecificPermissionAction.IMPORT_DATA],
  restaurants: [SpecificPermissionAction.UPDATE_STATUS, SpecificPermissionAction.UPDATE_PICTURE, SpecificPermissionAction.EXPORT_DATA, SpecificPermissionAction.IMPORT_DATA],
  employees: [SpecificPermissionAction.UPDATE_STATUS, SpecificPermissionAction.UPDATE_PICTURE, SpecificPermissionAction.CHANGE_PASSWORD, SpecificPermissionAction.RESET_PASSWORD],
  customers: [SpecificPermissionAction.UPDATE_STATUS, SpecificPermissionAction.UPDATE_PICTURE, SpecificPermissionAction.EXPORT_DATA, SpecificPermissionAction.IMPORT_DATA],
  products: [SpecificPermissionAction.UPDATE_STATUS, SpecificPermissionAction.UPDATE_PICTURE, SpecificPermissionAction.EXPORT_DATA, SpecificPermissionAction.IMPORT_DATA]
}

export async function seedBaseSpecificPermission (debug: boolean) {
  try {
    for (const [menuId, permissions] of Object.entries(specificPermissionsByMenu)) {
      for (const permission of permissions) {
        await prisma.baseSpecificPermission.upsert({
          where: { name_baseMenuId: { name: permission, baseMenuId: menuId } },
          update: {},
          create: {
            name: permission,
            baseMenu: {
              connect: { id: menuId }
            }
          }
        })
        if (debug) console.log(`Permission ${permission} for menu ${menuId} processed.`)
      }
    }
    if (debug) console.log("BaseSpecificPermission seeding completed.")
  } catch (e) {
    console.error("Error seeding BaseSpecificPermission:", e)
    throw e
  }
}
