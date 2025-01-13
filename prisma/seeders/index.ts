import { StatusUserEnum, StatusRestaurantEnum, StatusOrganizationEnum, StatusSurveyEnum, StatusCustomerEnum, StatusProductEnum, StatusOrderEnum } from "@/enums/statusEnum"
import { PaymentMethod } from "@/enums/paymentMethodEnum"
import { PaymentStatus } from "@/enums/paymentStatusEnum"
import { menuItems } from "@/data/mainMenu"
import { Action } from "@/enums/action"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// Variable debug pour afficher les détails des opérations
const debug = true

async function seedPermissionActions() {
  try {
    const actions = Object.values(SpecificPermissionAction).map((action) => ({
      name: action,
      description: `Permission to ${action.toLowerCase().replace(/_/g, " ")}`
    }))

    for (const action of actions) {
      await prisma.permissionAction.upsert({
        where: { name: action.name },
        update: { description: action.description },
        create: action
      })
      if (debug) console.log(`Permission action ${action.name} seeded.`)
    }
  } catch (error) {
    console.error("Error seeding permission actions:", error)
    throw error
  }
}

async function assignSpecificPermissions(roleId: string, menuId: string, actions: SpecificPermissionAction[]) {
  try {
    // Trouver ou créer la permission pour ce rôle et ce menu
    let permission = await prisma.permission.findUnique({
      where: {
        roleId_menuId: {
          roleId,
          menuId
        }
      }
    })

    if (!permission) {
      permission = await prisma.permission.create({
        data: {
          menuId,
          roleId,
          view: true,
          create: true,
          update: true,
          delete: true
        }
      })
      if (debug) console.log(`Permission for ${menuId} created.`)
    }

    // Trouver les actions spécifiques correspondantes
    const permissionActions = await prisma.permissionAction.findMany({
      where: {
        name: {
          in: actions
        }
      }
    })

    // Associer les actions spécifiques à la permission
    await prisma.permission.update({
      where: { id: permission.id },
      data: {
        permissionActions: {
          connect: permissionActions.map((action) => ({ id: action.id }))
        }
      }
    })

    if (debug) console.log(`Specific permissions assigned for menu ${menuId}`)
  } catch (error) {
    console.error(`Error assigning specific permissions for menu ${menuId}:`, error)
    throw error
  }
}

async function seedMenus() {
  try {
    for (const menuItem of menuItems) {
      await prisma.menu.upsert({
        where: { id: menuItem.id },
        update: {},
        create: {
          id: menuItem.id,
          name: menuItem.title
        }
      })
      if (debug) console.log(`Menu ${menuItem.id} seeded.`)

      for (const subItem of menuItem.subItems || []) {
        await prisma.menu.upsert({
          where: { id: subItem.id },
          update: {},
          create: {
            id: subItem.id,
            name: subItem.title
          }
        })
        if (debug) console.log(`Submenu ${subItem.id} seeded.`)
      }
    }
    if (debug) console.log("Menus and submenus seeded.")
  } catch (error) {
    console.error("Error seeding menus:", error)
    throw error
  }
}

async function seedSuperAdminRole() {
  try {
    let superAdminRole = await prisma.role.findUnique({
      where: { name: "Super Admin" }
    })

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: "Super Admin"
        }
      })
      if (debug) console.log("Super Admin role created.")
    } else {
      if (debug) console.log("Super Admin role already exists.")
    }

    for (const menuItem of menuItems) {
      await prisma.roleMenu.upsert({
        where: {
          roleId_menuId: {
            roleId: superAdminRole.id,
            menuId: menuItem.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          menuId: menuItem.id
        }
      })
      if (debug) console.log(`Menu ${menuItem.id} assigned to Super Admin role.`)

      for (const subItem of menuItem.subItems || []) {
        await prisma.roleMenu.upsert({
          where: {
            roleId_menuId: {
              roleId: superAdminRole.id,
              menuId: subItem.id
            }
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            menuId: subItem.id
          }
        })
        if (debug) console.log(`Submenu ${subItem.id} assigned to Super Admin role.`)
      }
    }

    for (const item of menuItems) {
      for (const subItem of item.subItems || []) {
        let permission = await prisma.permission.findUnique({
          where: { roleId_menuId: { roleId: superAdminRole.id, menuId: subItem.id } }
        })

        if (!permission) {
          permission = await prisma.permission.create({
            data: {
              menuId: subItem.id,
              roleId: superAdminRole.id,
              view: true,
              create: true,
              update: true,
              delete: true
            }
          })
          if (debug) console.log(`Permission for ${subItem.id} created.`)

          switch (subItem.id) {
            case "organizations":
              await assignSpecificPermissions(superAdminRole.id, subItem.id, [
                SpecificPermissionAction.UPDATE_STATUS,
                SpecificPermissionAction.UPDATE_PICTURE,
                SpecificPermissionAction.EXPORT_DATA,
                SpecificPermissionAction.IMPORT_DATA
              ])
              break
            case "restaurants":
              await assignSpecificPermissions(superAdminRole.id, subItem.id, [
                SpecificPermissionAction.UPDATE_STATUS,
                SpecificPermissionAction.UPDATE_PICTURE,
                SpecificPermissionAction.EXPORT_DATA,
                SpecificPermissionAction.IMPORT_DATA
              ])
              break
            case "employees":
              await assignSpecificPermissions(superAdminRole.id, subItem.id, [
                SpecificPermissionAction.UPDATE_STATUS,
                SpecificPermissionAction.UPDATE_PICTURE,
                SpecificPermissionAction.CHANGE_PASSWORD,
                SpecificPermissionAction.RESET_PASSWORD
              ])
              break
            case "customers":
              await assignSpecificPermissions(superAdminRole.id, subItem.id, [
                SpecificPermissionAction.UPDATE_STATUS,
                SpecificPermissionAction.UPDATE_PICTURE,
                SpecificPermissionAction.EXPORT_DATA,
                SpecificPermissionAction.IMPORT_DATA
              ])
              break
            case "products":
              await assignSpecificPermissions(superAdminRole.id, subItem.id, [
                SpecificPermissionAction.UPDATE_STATUS,
                SpecificPermissionAction.UPDATE_PICTURE,
                SpecificPermissionAction.EXPORT_DATA,
                SpecificPermissionAction.IMPORT_DATA
              ])
              break
          }
        } else {
          if (debug) console.log(`Permission for ${subItem.id} already exists.`)
        }
      }
    }
    if (debug) console.log("Super Admin role seeded with all permissions.")
  } catch (error) {
    console.error("Error seeding Super Admin role:", error)
    throw error
  }
}

async function seedSuperAdminUser() {
  try {
    const superAdminRole = await prisma.role.findUnique({
      where: { name: "Super Admin" }
    })

    if (!superAdminRole) {
      throw new Error("The 'Super Admin' role does not exist.")
    }

    const userStatusType = await prisma.statusType.findUnique({
      where: { name: "USER" }
    })

    if (!userStatusType) {
      throw new Error("The 'USER' status type does not exist.")
    }

    const activeStatus = await prisma.status.findFirst({
      where: {
        AND: [{ name: StatusUserEnum.ACTIVE }, { statusTypeId: userStatusType.id }]
      }
    })

    if (!activeStatus) {
      throw new Error("The 'ACTIVE' status for users does not exist.")
    }

    let superAdminUser = await prisma.user.findUnique({
      where: { email: "marlex@test.com" }
    })

    if (!superAdminUser) {
      const hashedPassword = await bcrypt.hash("super123", 10)
      const temporyHashedPassword = await bcrypt.hash("hashedpassword123", 10)

      superAdminUser = await prisma.user.create({
        data: {
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
      if (debug) console.log("Super Admin user created.")
    } else {
      if (debug) console.log("Super Admin user already exists.")
    }
  } catch (error) {
    console.error("Error seeding Super Admin user:", error)
    throw error
  }
}

async function seedStatusType(name: string, statuses: string[]) {
  try {
    const statusType = await prisma.statusType.upsert({
      where: { name },
      update: {},
      create: { name: name.toUpperCase() }
    })
    if (debug) console.log(`StatusType ${name} processed.`)

    for (const status of statuses) {
      const existingStatus = await prisma.status.findFirst({
        where: {
          name: status,
          statusTypeId: statusType.id
        }
      })

      if (!existingStatus) {
        await prisma.status.create({
          data: {
            name: status,
            statusTypeId: statusType.id
          }
        })
        if (debug) console.log(`Status ${status} created for ${name}.`)
      } else {
        if (debug) console.log(`Status ${status} already exists for ${name}.`)
      }
    }
    if (debug) console.log(`${name} statuses seeded.`)
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
        update: {},
        create: status
      })
      if (debug) console.log(`Payment status ${status.name} processed.`)
    }
    if (debug) console.log("Payment status seeded.")
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
        update: {},
        create: method
      })
      if (debug) console.log(`Payment method ${method.name} processed.`)
    }
    if (debug) console.log("Payment methods seeded.")
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
        update: {},
        create: action
      })
      if (debug) console.log(`Action ${action.name} processed.`)
    }
    if (debug) console.log("Actions for audit log seeded.")
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
    await seedPermissionActions()
    await seedMenus()
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
