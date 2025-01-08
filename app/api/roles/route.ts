import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { roleSchema, roleUpdateSchema } from "@/schemas/role"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { buildWhereClause } from "@/lib/buildWhereClause"
import { prisma } from "@/lib/db"
import { withPermission } from "@/middlewares/withPermission"

export const GET = withLogging(
  withAuth(
    withPermission(
      "roles",
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
          "ROLE"
        )

        const [roles, total] = await Promise.all([
          prisma.role.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true,
              permissions: {
                select: {
                  id: true,
                  menuId: true,
                  view: true,
                  create: true,
                  update: true,
                  delete: true,
                  permissionActions: {
                    select: {
                      id: true,
                      name: true,
                      description: true
                    }
                  }
                }
              }
            }
          }),
          prisma.role.count({ where })
        ])

        return NextResponse.json({
          data: roles,
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
      "roles",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }) => {
        const t = await getI18n()
        const body = await request.json()

        // Validate the request body against the schema
        try {
          roleSchema.parse(body)
        } catch (error) {
          console.log("error", error)
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        // Normalize the role name by converting to lowercase and removing non-alphabetic characters
        const normalizedRoleName = body.name.toLowerCase().replace(/[^a-z]/g, "")

        // List of forbidden role names (normalized)
        const forbiddenRoleNames = ["superadmin", "admin"]

        // Check if the normalized role name is in the forbidden list
        if (forbiddenRoleNames.includes(normalizedRoleName)) {
          throw createError(errors.BadRequestError, t("api.errors.forbiddenRoleName"))
        }

        // Create the role within a transaction
        const role = await prisma.$transaction(async (tx) => {
          // Create the role
          const newRole = await tx.role.create({
            data: {
              name: body.name,
              description: body.description
            }
          })

          // Log the creation action in the audit log
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "CREATE" } }))!.id,
              userId: request.user.id,
              entityId: newRole.id,
              entityType: "ROLE"
            }
          })

          return newRole
        })

        // Return the created role (without permissions)
        return NextResponse.json({
          message: t("api.success.roleCreated"),
          data: role
        })
      })
    )
  )
)
