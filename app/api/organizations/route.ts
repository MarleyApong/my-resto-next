import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { organizationSchema } from "@/schemas/organization"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { imageProcessing } from "@/lib/imageProcessing"
import { buildWhereClause } from "@/lib/buildWhereClause"
import prisma from "@/lib/db"

export const GET = withLogging(
  withAuth(
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
        "ORGANIZATION"
      )

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
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
            createdAt: true
          }
        }),
        prisma.organization.count({ where })
      ])
      const organizationsWithFlatStatus = organizations.map((org) => ({
        ...org,
        status: org.status.name
      }))

      return NextResponse.json({
        data: organizationsWithFlatStatus,
        recordsFiltered: total,
        recordsTotal: total
      })
    })
  )
)

export const POST = withLogging(
  withAuth(
    withErrorHandler(async (request: Request & { user?: any }) => {
      const t = await getI18n()
      const body = await request.json()

      try {
        organizationSchema.parse(body)
      } catch (error) {
        console.log("error", error)

        throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
      }

      const hasPermission = request.user?.role.permissions.some((p: any) => p.menuId === "organizations" && p.create)
      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      const status = await prisma.status.findFirst({
        where: { 
          name: body.status.toUpperCase(),
          statusType: {
            name: "ORGANIZATION" // ou la valeur appropriée pour le type attendu
          }
        }
      })
      
      if (!status) {
        throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
      }

      if (!body.picture) {
        throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
      }

      const picturePath = await imageProcessing(body.picture)
      if (!picturePath) {
        throw createError(errors.BadRequestError, t("api.errors.invalidPicture"))
      }

      const organization = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: body.name,
            description: body.description,
            city: body.city,
            neighborhood: body.neighborhood,
            phone: body.phone,
            email: body.email,
            picture: picturePath,
            statusId: status.id
          }
        })

        await tx.auditLog.create({
          data: {
            actionId: (await tx.action.findUnique({ where: { name: "CREATE" } }))!.id,
            userId: request.user.id,
            entityId: org.id,
            entityType: "Organization"
          }
        })

        return org
      })

      return NextResponse.json({
        message: t("api.success.organizationCreated"),
        data: organization
      })
    })
  )
)
