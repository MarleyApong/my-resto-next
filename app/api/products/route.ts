import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { productSchema } from "@/schemas/product"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { imageProcessing } from "@/lib/imageProcessing"
import { buildWhereClause } from "@/lib/buildWhereClause"
import { prisma } from "@/lib/db"
import { withPermission } from "@/middlewares/withPermission"

export const GET = withLogging(
  withAuth(
    withPermission(
      "products",
      "view"
    )(
      withErrorHandler(async (request: Request) => {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "0")
        const size = parseInt(searchParams.get("size") || "20")
        const order = searchParams.get("order") === "asc" ? "asc" : "desc"
        const filter = searchParams.get("filter") || "createdAt"
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || "*"
        const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
        const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined

        const {
          where,
          order: orderBy,
          skip,
          take
        } = await buildWhereClause(
          {
            page,
            size,
            order,
            filter,
            search,
            status,
            startDate,
            endDate
          },
          "PRODUCT"
        )

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              specialPrice: true,
              picture: true,
              status: {
                select: {
                  name: true
                }
              },
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
              },
              createdAt: true
            }
          }),
          prisma.product.count({ where })
        ])

        const productsWithFlatStatus = products.map((product) => ({
          ...product,
          status: product.status.name
        }))

        return NextResponse.json({
          data: productsWithFlatStatus,
          recordsFiltered: total,
          recordsTotal: total
        })
      })
    )
  )
)

export const POST = withLogging(
  withAuth(
    withPermission(
      "products",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }) => {
        const t = await getI18n()
        const body = await request.json()

        try {
          productSchema.parse(body)
        } catch (error) {
          console.log("error", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const status = await prisma.status.findFirst({
          where: {
            name: body.status.toUpperCase(),
            statusType: {
              name: "PRODUCT"
            }
          }
        })

        if (!status) {
          throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
        }

        const organization = await prisma.organization.findUnique({
          where: { id: body.organizationId }
        })

        if (!organization) {
          throw createError(errors.BadRequestError, t("api.errors.invalidOrganization"))
        }

        const restaurant = await prisma.restaurant.findUnique({
          where: { id: body.restaurantId }
        })

        if (!restaurant) {
          throw createError(errors.BadRequestError, t("api.errors.invalidRestaurant"))
        }

        if (!body.picture) {
          throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
        }

        const picturePath = await imageProcessing(body.picture)
        if (!picturePath) {
          throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
        }

        const product = await prisma.$transaction(async (tx) => {
          const prod = await tx.product.create({
            data: {
              organizationId: body.organizationId,
              restaurantId: body.restaurantId,
              name: body.name,
              description: body.description,
              price: body.price,
              specialPrice: body.specialPrice,
              picture: picturePath,
              statusId: status.id
            }
          })

          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "CREATE" } }))!.id,
              userId: request.user.id,
              entityId: prod.id,
              entityType: "PRODUCT"
            }
          })

          return prod
        })

        return NextResponse.json({
          message: t("api.success.productCreated"),
          data: product
        })
      })
    )
  )
)
