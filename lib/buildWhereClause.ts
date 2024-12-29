import { z } from "zod"
import prisma from "./db"

export type EntityType = "ORGANIZATION" | "RESTAURANT" | "USER" | "SURVEY" | "CUSTOMER" | "PRODUCT" | "ORDER"

const entityFilterFields: Record<EntityType, string[]> = {
  ORGANIZATION: ["name", "email", "phone", "createdAt", "updatedAt"],
  RESTAURANT: ["name", "email", "phone", "city", "neighborhood", "createdAt", "updatedAt"],
  USER: ["firstName", "lastName", "email", "phone", "city", "createdAt", "updatedAt"],
  SURVEY: ["name", "createdAt", "updatedAt"],
  CUSTOMER: ["firstName", "lastName", "email", "phone", "city", "createdAt", "updatedAt"],
  PRODUCT: ["name", "description", "price", "createdAt", "updatedAt"],
  ORDER: ["orderNumber", "totalAmount", "createdAt", "updatedAt"]
}

export interface FilterState {
  page?: number
  size?: number
  order?: "asc" | "desc"
  filter?: string
  status?: string
  search?: string
  startDate?: Date
  endDate?: Date
}

function createFilterSchema(entityType: EntityType) {
  return z.object({
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(100).default(20),
    order: z.enum(["asc", "desc"]).default("desc"),
    filter: z.enum(entityFilterFields[entityType] as [string, ...string[]]).default("createdAt"),
    status: z.string().optional(),
    search: z.string().trim().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  })
}

function sanitizeSearchValue(value: string): string {
  return value.replace(/[<>*%&]/g, "").trim()
}

export async function buildWhereClause(
  params: FilterState,
  entityType: EntityType
): Promise<{
  where: any
  order: any
  skip: number
  take: number
}> {
  const filterSchema = createFilterSchema(entityType)
  const validatedParams = filterSchema.parse(params)
  const { page, size, order, filter, status, search, startDate, endDate } = validatedParams

  const where: any = {
    deletedAt: null
  }

  if (status && status !== "*") {
    const statusRecord = await prisma.status.findFirst({
      where: {
        name: status.toUpperCase(),
        statusType: {
          name: entityType
        }
      }
    })

    if (statusRecord) {
      where.statusId = statusRecord.id
    }
  }

  if (filter === "createdAt" || filter === "updatedAt") {
    if (startDate && endDate) {
      where[filter] = {
        gte: startDate,
        lte: new Date(endDate.setHours(23, 59, 59, 999))
      }
    }
  } else if (search) {
    const sanitizedSearch = sanitizeSearchValue(search)

    if (filter === "name") {
      if (["USER", "CUSTOMER"].includes(entityType)) {
        where.OR = [{ firstName: { contains: sanitizedSearch, mode: "insensitive" } }, { lastName: { contains: sanitizedSearch, mode: "insensitive" } }]
      } else {
        where.name = { contains: sanitizedSearch, mode: "insensitive" }
      }
    } else if (["price", "totalAmount"].includes(filter)) {
      const numericValue = parseFloat(sanitizedSearch)
      if (!isNaN(numericValue)) {
        where[filter] = numericValue
      }
    } else if (filter === "phone") {
      where[filter] = { contains: sanitizedSearch }
    } else {
      where[filter] = { contains: sanitizedSearch, mode: "insensitive" }
    }
  }

  return {
    where,
    order: {
      [filter]: order
    },
    skip: page * size,
    take: size
  }
}
