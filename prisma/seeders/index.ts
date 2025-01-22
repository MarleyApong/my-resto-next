import { StatusCustomerEnum, StatusOrderEnum, StatusOrganizationEnum, StatusProductEnum, StatusRestaurantEnum, StatusSurveyEnum, StatusUserEnum } from "@/enums/statusEnum"
import { seedActions } from "./seedActions"
import { seedBaseMenu } from "./seedBaseMenu"
import { seedBaseSpecificPermission } from "./seedBaseSpecificPermission"
import { seedPaymentMethods } from "./seedPaymentMethods"
import { seedPaymentStatus } from "./seedPaymentStatus"
import { seedRole } from "./seedRole"
import { seedRoleMenu } from "./seedRoleMenu"
import { seedRoleSpecificPermission } from "./seedRoleSpecificPermission"
import { seedStatusType } from "./seedStatusType"
import { seedUser } from "./seedUser"

async function runSeeds(debug: boolean) {
  try {
    const superAdminRole = await seedRole(debug)
    await seedStatusType("User", Object.values(StatusUserEnum), debug)
    await seedStatusType("Restaurant", Object.values(StatusRestaurantEnum), debug)
    await seedStatusType("Organization", Object.values(StatusOrganizationEnum), debug)
    await seedStatusType("Survey", Object.values(StatusSurveyEnum), debug)
    await seedStatusType("Customer", Object.values(StatusCustomerEnum), debug)
    await seedStatusType("Product", Object.values(StatusProductEnum), debug)
    await seedStatusType("Order", Object.values(StatusOrderEnum), debug)
    await seedActions(debug)
    await seedBaseMenu(debug)
    await seedBaseSpecificPermission(debug)
    await seedRoleMenu(superAdminRole.id, debug)
    await seedRoleSpecificPermission(superAdminRole.id, debug)
    await seedPaymentMethods(debug)
    await seedPaymentStatus(debug)
    await seedUser(debug)
    console.log("All seeding completed.")
  } catch (error) {
    console.error("Error during seeding:", error)
    process.exit(1)
  }
}

const debug = true
runSeeds(debug)
