import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { imageProcessing } from "@/lib/imageProcessing"
import { buildWhereClause } from "@/lib/buildWhereClause"
import prisma from "@/lib/db"
import { userSchema } from "@/schemas/user"
import { withPermission } from "@/middlewares/withPermission"
import { hashPassword } from "@/lib/hashComparePassword"

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
          "USER"
        )

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
              id: true,
              firstname: true,
              lastname: true,
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
              organizations: {
                select: {
                  organization: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              restaurants: {
                select: {
                  restaurant: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              createdAt: true
            }
          }),
          prisma.user.count({ where })
        ])

        const usersWithFlatStatusAndRelations = users.map((user) => ({
          ...user,
          status: user.status.name,
          organization: user.organizations[0]?.organization || null,
          restaurant: user.restaurants[0]?.restaurant || null
        }))

        return NextResponse.json({
          data: usersWithFlatStatusAndRelations,
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
          userSchema.parse(body)
        } catch (error) {
          console.log("error", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Find the status for the user
        const status = await prisma.status.findFirst({
          where: {
            name: body.status.toUpperCase(),
            statusType: {
              name: "USER"
            }
          }
        })

        if (!status) {
          throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
        }

        // Check if the organization exists
        const organization = await prisma.organization.findUnique({
          where: { id: body.organizationId }
        })

        if (!organization) {
          throw createError(errors.BadRequestError, t("api.errors.invalidOrganization"))
        }

        // Check if the restaurant exists (if restaurantId is provided)
        if (body.restaurantId) {
          const restaurant = await prisma.restaurant.findUnique({
            where: { id: body.restaurantId }
          })
          if (!restaurant) {
            throw createError(errors.BadRequestError, t("api.errors.invalidRestaurant"))
          }
        }

        // Process the user picture if provided
        let picturePath: string | null
        if (body.picture) {
          picturePath = await imageProcessing(body.picture)
          if (!picturePath) {
            throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
          }
        }

        // Hash the default password
        const hashedPassword = await hashPassword("Default@123")

        // Create the user in a transaction
        const user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              firstname: body.firstname,
              lastname: body.lastname,
              city: body.city,
              neighborhood: body.neighborhood,
              phone: body.phone,
              email: body.email,
              picture: picturePath,
              statusId: status.id,
              roleId: body.roleId || undefined,
              password: hashedPassword,
              organizations: {
                create: {
                  organizationId: body.organizationId
                }
              },
              restaurants: body.restaurantId
                ? {
                    create: {
                      restaurantId: body.restaurantId
                    }
                  }
                : undefined
            }
          })

          // Create an audit log for the creation action
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "CREATE" } }))!.id,
              userId: request.user.id,
              entityId: newUser.id,
              entityType: "USER"
            }
          })

          return newUser
        })

        // Return success response with the created user data
        return NextResponse.json({
          message: t("api.success.userCreated"),
          data: user
        })
      })
    )
  )
)
