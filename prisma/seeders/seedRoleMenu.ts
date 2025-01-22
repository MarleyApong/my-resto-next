import { prisma } from "@/lib/db"

export async function seedRoleMenu(roleId: string, debug: boolean) {
  try {
    const menuItems = await prisma.baseMenu.findMany()

    for (const menu of menuItems) {
      await prisma.roleMenu.upsert({
        where: { roleId_baseMenuId: { roleId: roleId, baseMenuId: menu.id } },
        update: {},
        create: {
          role: { connect: { id: roleId } },
          baseMenu: { connect: { id: menu.id } },
          create: true,
          view: true,
          update: true,
          delete: true
        }
      })
      if (debug) console.log(`RoleMenu for menu ${menu.name} processed.`)
    }
    if (debug) console.log("RoleMenu seeding completed.")
  } catch (error) {
    console.error("Error seeding RoleMenu:", error)
    throw error
  }
}
