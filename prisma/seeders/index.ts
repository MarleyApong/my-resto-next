import { PrismaClient } from "@prisma/client"
import { StatusUserEnum, StatusRestaurantEnum, StatusOrganizationEnum, StatusSurveyEnum, StatusCustomerEnum, StatusProductEnum, StatusOrderEnum } from "@/enums/statusEnum"
import { PaymentMethod } from "@/enums/paymentMethodEnum"
import { PaymentStatus } from "@/enums/paymentStatusEnum"
import { menuItems } from "@/data/mainMenu"
import bcrypt from "bcryptjs"
import { Action } from "@/enums/action"

const prisma = new PrismaClient()

async function seedSuperAdminRole() {
  try {
    // Check if "Super Admin" role already exists
    let superAdminRole = await prisma.role.findUnique({
      where: { name: "Super Admin" }
    })

    // If not, create it
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: "Super Admin",
          menuIds: JSON.stringify(menuItems.map((item) => item.id)) // Add all menus
        }
      })
      console.log("Super Admin role created.")
    } else {
      console.log("Super Admin role already exists.")
    }

    // Check if dashboard permission exists
    let dashboardPermission = await prisma.permission.findUnique({
      where: { roleId_menuId: { roleId: superAdminRole.id, menuId: "dashboard" } }
    })

    // If not, create it
    if (!dashboardPermission) {
      await prisma.permission.create({
        data: {
          menuId: "dashboard",
          roleId: superAdminRole.id,
          view: true,
          create: true,
          update: true,
          delete: true
        }
      })
      console.log("Dashboard permission created.")
    } else {
      console.log("Dashboard permission already exists.")
    }

    // Assign all permissions for menus and submenus to "Super Admin"
    for (const item of menuItems) {
      for (const subItem of item.subItems || []) {
        let permission = await prisma.permission.findUnique({
          where: { roleId_menuId: { roleId: superAdminRole.id, menuId: subItem.id } }
        })

        if (!permission) {
          await prisma.permission.create({
            data: {
              menuId: subItem.id,
              roleId: superAdminRole.id,
              view: true,
              create: true,
              update: true,
              delete: true // Full access
            }
          })
          console.log(`Permission for ${subItem.id} created.`)
        } else {
          console.log(`Permission for ${subItem.id} already exists.`)
        }
      }
    }

    console.log("Super Admin role seeded with all permissions.")
  } catch (error) {
    console.error("Error seeding Super Admin role:", error)
    throw error
  }
}

async function seedSuperAdminUser() {
  try {
    // Check if "Super Admin" role exists
    const superAdminRole = await prisma.role.findUnique({
      where: { name: "Super Admin" }
    })

    if (!superAdminRole) {
      throw new Error("The 'Super Admin' role does not exist.")
    }

    // D'abord, trouvez le statusType pour User
    const userStatusType = await prisma.statusType.findUnique({
      where: { name: "USER" }
    })

    if (!userStatusType) {
      throw new Error("The 'USER' status type does not exist.")
    }

    const activeStatus = await prisma.status.findFirst({
      where: {
        AND: [
          { name: StatusUserEnum.ACTIVE },
          { statusTypeId: userStatusType.id }
        ]
      }
    })

    if (!activeStatus) {
      throw new Error("The 'ACTIVE' status for users does not exist.")
    }

    // Vérifiez si le Super Admin existe déjà
    let superAdminUser = await prisma.user.findUnique({
      where: { email: "marlex@test.com" }
    })

    // Si non, créez-le
    if (!superAdminUser) {
      const hashedPassword = await bcrypt.hash("super123", 10)
      const temporyHashedPassword = await bcrypt.hash("hashedpassword123", 10)

      superAdminUser = await prisma.user.create({
        data: {
          firstName: "Super",
          lastName: "Admin",
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
      console.log("Super Admin user created.")
    } else {
      console.log("Super Admin user already exists.")
    }
  } catch (error) {
    console.error("Error seeding Super Admin user:", error)
    throw error
  }
}

async function seedStatusType(name: string, statuses: string[]) {
  try {
    // Utiliser upsert pour créer ou mettre à jour le StatusType
    const statusType = await prisma.statusType.upsert({
      where: { name }, // Utilisez le champ unique "name"
      update: {}, // Ne rien mettre à jour si le StatusType existe déjà
      create: { name: name.toUpperCase() }
    })

    console.log(`StatusType ${name} processed.`)

    // Créer les statuts associés
    console.log(`Seeding ${name} statuses:`, statuses)
    for (const status of statuses) {
      // Vérifier si le statut existe déjà pour ce StatusType
      const existingStatus = await prisma.status.findFirst({
        where: {
          name: status,
          statusTypeId: statusType.id
        }
      })

      if (existingStatus) {
        // Si le statut existe déjà, ne rien faire
        console.log(`Status ${status} already exists for ${name}.`)
      } else {
        // Si le statut n'existe pas, le créer
        await prisma.status.create({
          data: {
            name: status,
            statusTypeId: statusType.id
          }
        })
        console.log(`Status ${status} created for ${name}.`)
      }
    }

    console.log(`${name} statuses seeded.`)
  } catch (error) {
    console.error(`Error seeding ${name} statuses:`, error)
    throw error
  }
}

async function seedPaymentStatus() {
  try {
    const paymentStatuses = Object.values(PaymentStatus).map((status) => ({
      name: status
    }))

    for (const status of paymentStatuses) {
      await prisma.paymentStatus.upsert({
        where: { name: status.name },
        update: {}, // No update if it already exists
        create: status
      })
      console.log(`Payment status ${status.name} processed.`)
    }

    console.log("Payment status seeded.")
  } catch (error) {
    console.error("Error seeding payment status:", error)
    throw error
  }
}

async function seedPaymentMethods() {
  try {
    const paymentMethods = Object.values(PaymentMethod).map((method) => ({
      name: method
    }))

    for (const method of paymentMethods) {
      await prisma.paymentMethod.upsert({
        where: { name: method.name },
        update: {}, // No update if it already exists
        create: method
      })
      console.log(`Payment method ${method.name} processed.`)
    }

    console.log("Payment methods seeded.")
  } catch (error) {
    console.error("Error seeding payment methods:", error)
    throw error
  }
}

async function seedActions() {
  try {
    const actions = Object.values(Action).map((action) => ({
      name: action
    }))

    for (const action of actions) {
      await prisma.action.upsert({
        where: { name: action.name },
        update: {}, // No update if it already exists
        create: action
      })
      console.log(`Action ${action.name} processed.`)
    }

    console.log("Actions for audit log seeded.")
  } catch (error) {
    console.error("Error seeding actions:", error)
    throw error
  }
}

async function main() {
  try {
    await seedStatusType("User", Object.values(StatusUserEnum))
    await seedStatusType("Restaurant", Object.values(StatusRestaurantEnum))
    await seedStatusType("Organization", Object.values(StatusOrganizationEnum))
    await seedStatusType("Survey", Object.values(StatusSurveyEnum))
    await seedStatusType("Customer", Object.values(StatusCustomerEnum))
    await seedStatusType("Product", Object.values(StatusProductEnum))
    await seedStatusType("Order", Object.values(StatusOrderEnum))
    await seedActions()
    await seedPaymentStatus()
    await seedPaymentMethods()
    await seedSuperAdminRole()
    await seedSuperAdminUser()
  } catch (error) {
    console.error("Error in main seeding function:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
