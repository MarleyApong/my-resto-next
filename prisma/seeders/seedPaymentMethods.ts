import { PaymentMethod } from "@/enums/paymentMethodEnum"
import { prisma } from "@/lib/db"

export async function seedPaymentMethods(debug: boolean) {
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
