import { PrismaClient } from "@prisma/client"
import { StatusUserEnum, StatusRestaurantEnum, StatusOrganizationEnum, StatusSurveyEnum, StatusCustomerEnum, StatusProductEnum, StatusOrderEnum } from "@/enums/statusEnum"
import { PaymentMethod } from "@/enums/paymentMethodEnum"
import { PaymentStatus } from "@/enums/paymentStatusEnum"
import { menuItems } from "@/data/mainMenu"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function seedSuperAdminRole() {
  // Create the "Super Admin" role
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
      menuIds: JSON.stringify(menuItems.map((item) => item.id)) // Add all menus
    }
  })

  // Assign all permissions for all menus and submenus to the "Super Admin"
  for (const item of menuItems) {
    for (const subItem of item.subItems || []) {
      await prisma.permission.upsert({
        where: { roleId_menuId: { roleId: superAdminRole.id, menuId: subItem.id } },
        update: {},
        create: {
          menuId: subItem.id,
          roleId: superAdminRole.id,
          view: true,
          create: true,
          update: true,
          delete: true // Full access
        }
      })
    }
  }

  console.log("Super Admin role seeded with all permissions.")
}

async function seedSuperAdminUser() {
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "Super Admin" }
  })

  if (!superAdminRole) {
    throw new Error("The 'Super Admin' role does not exist.")
  }

  const activeStatus = await prisma.status.findUnique({
    where: { name: StatusUserEnum.ACTIVE }
  })

  if (!activeStatus) {
    throw new Error("The 'ACTIVE' status does not exist.")
  }

  const hashedPassword = await bcrypt.hash("super123", 10) // Super admin password haché
  const temporyHashedPassword = await bcrypt.hash("hashedpassword123", 10) // Temporaire haché si nécessaire

  const superAdminUser = await prisma.user.upsert({
    where: { email: "marlex@test.com" },
    update: {},
    create: {
      firstName: "Super",
      lastName: "Admin",
      phone: "0123456789",
      email: "marlex@test.com",
      city: "Douala",
      neighborhood: "Japoma",
      picture: new Uint8Array(),
      password: hashedPassword,
      temporyPassword: temporyHashedPassword,
      expiryPassword: new Date(),
      roleId: superAdminRole.id,
      statusId: activeStatus.id
    }
  })

  console.log(`Super Admin user created: ${superAdminUser.firstName} ${superAdminUser.lastName}.`)
}

async function seedStatusType(name: string, statuses: string[]) {
  const createdStatusType = await prisma.statusType.upsert({
    where: { name },
    update: {},
    create: { name: name.toLowerCase() }
  })

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { name: status },
      update: {},
      create: {
        name: status,
        statusTypeId: createdStatusType.id
      }
    })
  }
  console.log(`${name} statuses seeded.`)
}

async function seedPaymentStatuses() {
  const paymentStatuses = Object.values(PaymentStatus).map((status) => ({
    name: status
  }))

  for (const status of paymentStatuses) {
    await prisma.paymentStatus.upsert({
      where: { name: status.name },
      update: {},
      create: status
    })
  }
  console.log("Payment statuses seeded.")
}

async function seedPaymentMethods() {
  const paymentMethods = Object.values(PaymentMethod).map((method) => ({
    name: method
  }))

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method
    })
  }
  console.log("Payment methods seeded.")
}

async function main() {
  await seedStatusType("User", Object.values(StatusUserEnum))
  await seedStatusType("Restaurant", Object.values(StatusRestaurantEnum))
  await seedStatusType("Organization", Object.values(StatusOrganizationEnum))
  await seedStatusType("Survey", Object.values(StatusSurveyEnum))
  await seedStatusType("Customer", Object.values(StatusCustomerEnum))
  await seedStatusType("Product", Object.values(StatusProductEnum))
  await seedStatusType("Order", Object.values(StatusOrderEnum))
  await seedPaymentStatuses()
  await seedPaymentMethods()
  await seedSuperAdminRole()
  await seedSuperAdminUser()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
