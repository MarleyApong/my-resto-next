import { prisma } from "@/lib/db"

export async function seedStatusType(name: string, statuses: string[], debug: boolean) {
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
