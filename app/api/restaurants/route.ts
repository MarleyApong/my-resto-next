import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { restaurantSchema } from "@/schemas/restaurant"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { imageProcessing } from "@/lib/imageProcessing"
import { buildWhereClause } from "@/lib/buildWhereClause"
import prisma from "@/lib/db"
import { withPermission } from "@/middlewares/withPermission"

export const GET = withLogging(
  withAuth(
    withPermission(
      "restaurants",
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
          "RESTAURANT"
        )

        const [restaurants, total] = await Promise.all([
          prisma.restaurant.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
              id: true,
              name: true,
              description: true,
              city: true,
              neighborhood: true,
              phone: true,
              email: true,
              picture: true,
              status: {
                select: {
                  name: true
                }
              },
              organization: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  phone: true,
                  email: true,
                  city: true,
                  neighborhood: true,
                  picture: true
                }
              },
              createdAt: true
            }
          }),
          prisma.restaurant.count({ where })
        ])

        const restaurantsWithFlatStatusAndOrganization = restaurants.map((resto) => ({
          ...resto,
          status: resto.status.name
        }))

        return NextResponse.json({
          data: restaurantsWithFlatStatusAndOrganization,
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
      "restaurants",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }) => {
        const t = await getI18n()
        const body = await request.json()

        try {
          // Validate the request body against the schema
          restaurantSchema.parse(body)
        } catch (error) {
          console.log("error", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Find the status for the restaurant
        const status = await prisma.status.findFirst({
          where: {
            name: body.status.toUpperCase(),
            statusType: {
              name: "RESTAURANT"
            }
          }
        })

        if (!status) {
          throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
        }

        // Find the organization associated with the provided organizationId
        const organization = await prisma.organization.findUnique({
          where: { id: body.organizationId }
        })

        if (!organization) {
          throw createError(errors.BadRequestError, t("api.errors.invalidOrganization"))
        }

        // Validate and process the restaurant picture
        if (!body.picture) {
          throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
        }

        const picturePath = await imageProcessing(body.picture)
        if (!picturePath) {
          throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
        }

        // Format names for the webpage URL
        const formatForUrl = (str: string) => {
          return str
            .toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, "") // Remove special characters
        }

        // Format organization and restaurant names
        const organizationNameFormatted = formatForUrl(organization.name)
        const restaurantNameFormatted = formatForUrl(body.name)

        // Create the webpage URL by concatenating formatted names
        const webpage = `/${organizationNameFormatted}/${restaurantNameFormatted}`

        // Create the restaurant in a transaction
        const restaurant = await prisma.$transaction(async (tx) => {
          const resto = await tx.restaurant.create({
            data: {
              organizationId: body.organizationId,
              name: body.name,
              description: body.description,
              city: body.city,
              neighborhood: body.neighborhood,
              phone: body.phone,
              email: body.email,
              picture: picturePath,
              statusId: status.id,
              webpage: webpage
            }
          })

          // Create an audit log for the creation action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "CREATE" } }))!.id,
              userId: request.user.id,
              entityId: resto.id,
              entityType: "RESTAURANT"
            }
          })

          return resto
        })

        // Return success response with the created restaurant data
        return NextResponse.json({
          message: t("api.success.restaurantCreated"),
          data: restaurant
        })
      })
    )
  )
)
