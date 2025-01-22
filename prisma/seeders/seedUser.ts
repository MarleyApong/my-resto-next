import { StatusUserEnum } from "@/enums/statusEnum"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function seedUser(debug: boolean) {
  try {
    const superAdminRole = await prisma.role.findFirst({
      where: {
        name: "Super Admin",
        organizationId: null
      }
    })

    if (!superAdminRole) {
      throw new Error("The 'Super Admin' role does not exist.")
    }

    // Find the USER status type
    const userStatusType = await prisma.statusType.findUnique({
      where: { name: "USER" }
    })

    if (!userStatusType) {
      throw new Error("The 'USER' status type does not exist.")
    }

    // Find the ACTIVE status for users
    const activeStatus = await prisma.status.findFirst({
      where: {
        AND: [{ name: StatusUserEnum.ACTIVE }, { statusTypeId: userStatusType.id }]
      }
    })

    if (!activeStatus) {
      throw new Error("The 'ACTIVE' status for users does not exist.")
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash("super123", 10)
    const temporyHashedPassword = await bcrypt.hash("hashedpassword123", 10)

    // Create or update the Super Admin user
    const superAdminUser = await prisma.user.upsert({
      where: { email: "marlex@test.com" },
      update: {},
      create: {
        firstname: "Super",
        lastname: "Admin",
        phone: "0123456789",
        email: "marlex@test.com",
        city: "Douala",
        neighborhood: "Japoma",
        password: hashedPassword,
        temporyPassword: temporyHashedPassword,
        expiryPassword: new Date(),
        roleId: superAdminRole.id,
        statusId: activeStatus.id
      }
    })

    if (debug) {
      if (superAdminUser) {
        console.log("Super Admin user processed.")
      } else {
        console.log("Super Admin user already exists.")
      }
    }
    if (debug) console.log("User seeding completed.")
  } catch (e) {
    console.error("Error seeding User:", e)
    throw e
  }
}
