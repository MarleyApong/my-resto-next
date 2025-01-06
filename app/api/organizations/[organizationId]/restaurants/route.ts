// api/organizations/[organizationId]/restaurants/route.ts

import { NextResponse } from "next/server"
import { withLogging } from "@/middlewares/withLogging"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withPermission } from "@/middlewares/withPermission"
import { prisma } from "@/lib/db"

export const GET = withLogging(
  withAuth(
    withPermission(
      "employees",
      "create"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { organizationId: string } }) => {
        const { organizationId } = params

        // Vérifier si l'organisation existe
        const organization = await prisma.organization.findUnique({
          where: {
            id: organizationId,
            deletedAt: null
          }
        })

        if (!organization) {
          return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        // Récupérer les restaurants associés à l'organisation
        const restaurants = await prisma.restaurant.findMany({
          where: {
            organizationId: organizationId,
            deletedAt: null
          },
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
        })

        return NextResponse.json(restaurants)
      })
    )
  )
)
