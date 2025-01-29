import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { productCategoryUpdateSchema } from "@/schemas/productCategory"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "product-categories",
      "view"
    )(
      withErrorHandler(async (request: Request, { params }: { params: { productCategoryId: string } }) => {
        const t = await getI18n()

        const productCategory = await prisma.productCategory.findUnique({
          where: { id: params.productCategoryId },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            organization: {
              select: {
                id: true,
                name: true
              }
            },
            restaurant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        if (!productCategory) {
          throw createError(errors.NotFoundError, t("api.errors.productCategoryNotFound"))
        }

        return NextResponse.json(productCategory)
      })
    )
  )
)

export const PUT = withLogging(
  withAuth(
    withPermission(
      "product-categories",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { productCategoryId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the input data against the update schema
        try {
          productCategoryUpdateSchema.parse(body)
        } catch (error) {
          console.log("Validation error details:", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Find the productCategory to update
        const productCategory = await prisma.productCategory.findUnique({
          where: { id: params.productCategoryId }
        })
        if (!productCategory) {
          throw createError(errors.NotFoundError, t("api.errors.productCategoryNotFound"))
        }

        // Update the productCategory in a transaction
        const updatedProductCategory = await prisma.$transaction(async (tx) => {
          const prodCategory = await tx.productCategory.update({
            where: { id: params.productCategoryId },
            data: {
              name: body.name,
              description: body.description,
              organizationId: body.organizationId,
              restaurantId: body.restaurantId,
            }
          })

          // Log the update action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: prodCategory.id,
              entityType: "PRODUCT_CATEGORIES"
            }
          })

          return productCategory
        })

        // Return the updated productCategory
        return NextResponse.json({
          message: t("api.success.productCategoryUpdated"),
          data: updatedProductCategory
        })
      })
    )
  )
)

export const DELETE = withLogging(
  withAuth(
    withPermission(
      "product-categories",
      "delete"
    )(
      withErrorHandler(async (request: Request & { user?: any }, context: { params: { productCategoryId: string } }) => {
        const t = await getI18n()
        const { params } = context

        const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "productCategorys" && p.delete)
        if (!hasPermission) {
          throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
        }

        await prisma.$transaction(async (tx) => {
          await tx.productCategory.update({
            where: { id: params.productCategoryId },
            data: { deletedAt: new Date() }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "DELETE" } }))!.id,
              userId: request.user.id,
              entityId: params.productCategoryId,
              entityType: "ORGANIZATION"
            }
          })
        })

        return NextResponse.json({ message: t("api.success.productCategoryDeleted") })
      })
    )
  )
)
