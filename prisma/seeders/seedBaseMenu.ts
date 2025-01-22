import { menuItems } from "@/data/mainMenu"
import { prisma } from "@/lib/db"

// Recursive function to process menu items and sub-items
const processMenuItems = async (items: any[], debug: boolean) => {
  for (const item of items) {
    // Create or update the base menu item
    await prisma.baseMenu.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        name: item.title,
        description: null
      }
    })
    if (debug) console.log(`Menu ${item.title} (${item.id}) processed.`)

    // If the menu item has sub-items, process them recursively
    if (item.subItems && item.subItems.length > 0) {
      await processMenuItems(item.subItems, debug)
    }
  }
}

// Main function to seed the BaseMenu table
export const seedBaseMenu = async (debug: boolean) => {
  try {
    // Start processing the top-level menu items
    await processMenuItems(menuItems, debug)
    if (debug) console.log("BaseMenu seeding completed.")
  } catch (e) {
    console.error("Error seeding BaseMenu:", e)
    throw e
  }
}
