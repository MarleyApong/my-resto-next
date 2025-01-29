import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { productCategorySchema } from "@/schemas/productCategory"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { buildWhereClause } from "@/lib/buildWhereClause"
import { prisma } from "@/lib/db"
import { withPermission } from "@/middlewares/withPermission"

export const GET = withLogging(
  withAuth(
    withPermission(
      "product-categories",
      "view"
    )(
      withErrorHandler(async (request: Request) => {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "0")
        const size = parseInt(searchParams.get("size") || "20")
        const order = searchParams.get("order") === "asc" ? "asc" : "desc"
        const filter = searchParams.get("filter") || "createdAt"
        const search = searchParams.get("search") || ""
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
            startDate,
            endDate
          },
          "PRODUCT_CATEGORIES"
        )

        const [categories, total] = await Promise.all([
          prisma.productCategory.findMany({
            where,
            orderBy,
            skip,
            take,
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
          }),
          prisma.productCategory.count({ where })
        ])

        console.log("categories", categories)

        return NextResponse.json({
          data: categories,
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
      "product-categories",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }) => {
        const t = await getI18n()
        const body = await request.json()

        try {
          productCategorySchema.parse(body)
        } catch (error) {
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const category = await prisma.productCategory.create({
          data: {
            name: body.name,
            description: body.description,
            organizationId: body.organizationId,
            restaurantId: body.restaurantId
          }
        })

        return NextResponse.json({
          message: t("api.success.productCategoryCreated"),
          data: category
        })
      })
    )
  )
)
