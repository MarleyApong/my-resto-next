import { prisma } from "@/lib/db"

export async function seedRole(debug: boolean) {
  try {
    // Check if the Super Admin role already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name: "Super Admin",
        organizationId: null
      }
    })

    let superAdminRole

    if (existingRole) {
      // If the role exists, update it (though no changes are needed)
      superAdminRole = await prisma.role.update({
        where: { id: existingRole.id },
        data: {}
      })
      if (debug) console.log("Role 'Super Admin' already exists. No changes made.")
    } else {
      // If the role does not exist, create it
      superAdminRole = await prisma.role.create({
        data: {
          name: "Super Admin",
          organizationId: null
        }
      })
      if (debug) console.log("Role 'Super Admin' created.")
    }

    if (debug) console.log("Role seeding completed.")
    return superAdminRole
  } catch (e) {
    console.error("Error seeding Role:", e)
    throw e
  }
}
