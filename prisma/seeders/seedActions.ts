import { Action } from "@/enums/action"
import { prisma } from "@/lib/db"

export async function seedActions(debug: boolean) {
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
  } catch (e) {
    console.error("Error seeding actions:", e)
    throw e
  }
}
