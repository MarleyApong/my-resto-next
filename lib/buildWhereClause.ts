import { z } from "zod"
import prisma from "./db"

// Types for supported entities
export type EntityType = "ORGANIZATION" | "RESTAURANT" | "USER" | "SURVEY" | "CUSTOMER" | "PRODUCT" | "ORDER"

// Mapping of entity types to their filter fields
const entityFilterFields: Record<EntityType, string[]> = {
  ORGANIZATION: ["name", "email", "phone", "createdAt", "updatedAt"],
  RESTAURANT: ["name", "email", "phone", "city", "neighborhood", "createdAt", "updatedAt"],
  USER: ["firstName", "lastName", "email", "phone", "city", "createdAt", "updatedAt"],
  SURVEY: ["name", "createdAt", "updatedAt"],
  CUSTOMER: ["firstName", "lastName", "email", "phone", "city", "createdAt", "updatedAt"],
  PRODUCT: ["name", "description", "price", "createdAt", "updatedAt"],
  ORDER: ["orderNumber", "totalAmount", "createdAt", "updatedAt"]
}

// Generic filter state interface
export interface FilterState {
  page?: number
  size?: number
  order?: "asc" | "desc"
  filterBy?: string
  status?: string
  searchValue?: string
  startDate?: Date
  endDate?: Date
}

// Dynamic schema generator based on entity type
function createFilterSchema(entityType: EntityType) {
  return z.object({
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(100).default(20),
    order: z.enum(["asc", "desc"]).default("desc"),
    filterBy: z.enum(entityFilterFields[entityType] as [string, ...string[]]).default("createdAt"),
    status: z.string().optional(),
    searchValue: z.string().trim().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  })
}

// Helper function to sanitize search input
function sanitizeSearchValue(value: string): string {
  return value.replace(/[<>*%&]/g, "").trim()
}

export async function buildWhereClause(
  params: FilterState,
  entityType: EntityType,
): Promise<{
  where: any
  orderBy: any
  skip: number
  take: number
}> {
  const filterSchema = createFilterSchema(entityType)
  const validatedParams = filterSchema.parse(params)
  const { page, size, order, filterBy, status, searchValue, startDate, endDate } = validatedParams

  const where: any = {
    deletedAt: null
  }

  // Handle status filtering
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

  // Handle date filters for createdAt/updatedAt
  if (filterBy === "createdAt" || filterBy === "updatedAt") {
    if (startDate && endDate) {
      where[filterBy] = {
        gte: startDate,
        lte: new Date(endDate.setHours(23, 59, 59, 999))
      }
    }
  }
  // Handle search filters
  else if (searchValue) {
    const sanitizedSearch = sanitizeSearchValue(searchValue)

    // Special handling for name fields
    if (filterBy === "name") {
      // For entities with firstName/lastName
      if (["USER", "CUSTOMER"].includes(entityType)) {
        where.OR = [{ firstName: { contains: sanitizedSearch, mode: "insensitive" } }, { lastName: { contains: sanitizedSearch, mode: "insensitive" } }]
      } else {
        where.name = { contains: sanitizedSearch, mode: "insensitive" }
      }
    }
    // Special handling for numeric fields
    else if (["price", "totalAmount"].includes(filterBy)) {
      const numericValue = parseFloat(sanitizedSearch)
      if (!isNaN(numericValue)) {
        where[filterBy] = numericValue
      }
    }
    // Phone number handling
    else if (filterBy === "phone") {
      where[filterBy] = { contains: sanitizedSearch }
    }
    // Default text search
    else {
      where[filterBy] = { contains: sanitizedSearch, mode: "insensitive" }
    }
  }

  return {
    where,
    orderBy: {
      [filterBy]: order
    },
    skip: page * size,
    take: size
  }
}
