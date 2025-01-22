import { PaymentStatus } from "@/enums/paymentStatusEnum"
import { prisma } from "@/lib/db"

export async function seedPaymentStatus(debug: boolean) {
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
