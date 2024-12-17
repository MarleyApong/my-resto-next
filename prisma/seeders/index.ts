import { PrismaClient } from "@prisma/client"
import { PaymentMethod } from "@/enums/paymentMethodEnum"
import { PaymentStatus } from "@/enums/paymentStatusEnum"

const prisma = new PrismaClient()

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
  await seedPaymentStatuses()
  await seedPaymentMethods()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
