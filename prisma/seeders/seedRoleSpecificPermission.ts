import { prisma } from "@/lib/db"

export async function seedRoleSpecificPermission (roleId: string, debug: boolean) {
  try {
    const specificPermissions = await prisma.baseSpecificPermission.findMany()

    for (const permission of specificPermissions) {
      await prisma.roleSpecificPermission.upsert({
        where: { roleMenuId_baseSpecificPermId: { roleMenuId: roleId, baseSpecificPermId: permission.id } },
        update: {},
        create: {
          roleMenu: {
            connect: {
              roleId_baseMenuId: {
                roleId: roleId,
                baseMenuId: permission.baseMenuId
              }
            }
          },
          baseSpecificPerm: { connect: { id: permission.id } },
          granted: true
        }
      })
      if (debug) console.log(`RoleSpecificPermission for permission ${permission.name} processed.`)
    }
    if (debug) console.log("RoleSpecificPermission seeding completed.")
  } catch (e) {
    console.error("Error seeding RoleSpecificPermission:", e)
    throw e
  }
}
