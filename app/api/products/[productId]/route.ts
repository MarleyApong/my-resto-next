import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { productUpdateSchema } from "@/schemas/product"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "products",
      "update"
    )(
      withErrorHandler(async (request: Request, { params }: { params: { productId: string } }) => {
        const t = await getI18n()

        const product = await prisma.product.findUnique({
          where: { id: params.productId },
          include: {
            status: {
              select: {
                name: true
              }
            }
          }
        })

        if (!product) {
          throw createError(errors.NotFoundError, t("api.errors.productNotFound"))
        }

        const productWithFlatStatus = { ...product, status: product.status.name }

        return NextResponse.json({ data: productWithFlatStatus })
      })
    )
  )
)

export const PUT = withLogging(
  withAuth(
    withPermission(
      "products",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { productId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        try {
          productUpdateSchema.parse(body)
        } catch (error) {
          console.log("Validation error details:", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const product = await prisma.product.findUnique({
          where: { id: params.productId }
        })
        if (!product) {
          throw createError(errors.NotFoundError, t("api.errors.productNotFound"))
        }

        const updatedProduct = await prisma.$transaction(async (tx) => {
          const prod = await tx.product.update({
            where: { id: params.productId },
            data: {
              name: body.name,
              description: body.description,
              price: body.price,
              specialPrice: body.specialPrice

            }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: prod.id,
              entityType: "PRODUCT"
            }
          })

          return prod
        })

        return NextResponse.json({
          message: t("api.success.productUpdated"),
          data: updatedProduct
        })
      })
    )
  )
)

export const DELETE = withLogging(
  withAuth(
    withPermission(
      "products",
      "delete"
    )(
      withErrorHandler(async (request: Request & { user?: any }, context: { params: { productId: string } }) => {
        const t = await getI18n()
        const { params } = context

        await prisma.$transaction(async (tx) => {
          await tx.product.update({
            where: { id: params.productId },
            data: { deletedAt: new Date() }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
              userId: request.user.id,
              entityId: params.productId,
              entityType: "PRODUCT"
            }
          })
        })

        return NextResponse.json({ message: t("api.success.productDeleted") })
      })
    )
  )
)
