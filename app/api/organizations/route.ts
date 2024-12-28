import { NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { organizationSchema } from "@/schemas/organization"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import prisma from "@/lib/db"
import sharp from "sharp"
import fs from "fs/promises"
import path from "path"

// Fonction utilitaire pour gérer les images
async function handleImage(imageBase64: string, oldImagePath?: string) {
  // Supprimer l'ancienne image si elle existe
  if (oldImagePath) {
    try {
      await fs.unlink(path.join(process.cwd(), 'public', oldImagePath))
    } catch (error) {
      console.error('Error deleting old image:', error)
    }
  }

  // Traiter et sauvegarder la nouvelle image
  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Générer un nom de fichier unique
    const filename = `org_${Date.now()}.webp`
    const relativePath = `/api/imgs/organizations/${filename}`
    const fullPath = path.join(process.cwd(), 'public', relativePath)

    // Compression et conversion en WebP
    await sharp(buffer)
      .resize(800, 800, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(fullPath)

    return relativePath
  }
  return null
}

// GET - Liste des organisations
export const GET = withLogging(
  withAuth(
    withErrorHandler(async (request: Request) => {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get("page") || "0")
      const size = parseInt(searchParams.get("size") || "20")
      const search = searchParams.get("search") || ""
      const status = searchParams.get("status") || undefined

      const where = {
        deletedAt: null,
        ...(status && status !== "*" && { status: { name: status } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } }
          ]
        })
      }

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          skip: page * size,
          take: size,
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
          },
          orderBy: {
            createdAt: "desc"
          }
        }),
        prisma.organization.count({ where })
      ])

      return NextResponse.json({
        data: organizations,
        recordsFiltered: total,
        recordsTotal: total
      })
    })
  )
)

// POST - Création d'une organisation
export const POST = withLogging(
  withAuth(
    withErrorHandler(async (request: Request & { user?: any }) => {
      const t = await getI18n()
      const body = await request.json()

      try {
        organizationSchema.parse(body)
      } catch (error) {
        throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
      }

      // Vérifier les permissions
      const hasPermission = request.user?.role.permissions.some(
        (p: any) => p.menuId === "organizations" && p.create
      )
      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      const status = await prisma.status.findFirst({
        where: { name: body.status.toUpperCase() }
      })
      if (!status) {
        throw createError(errors.BadRequestError, t("api.errors.invalidStatus"))
      }

      // Traiter l'image si présente
      const picturePath = body.picture ? await handleImage(body.picture) : null

      const organization = await prisma.$transaction(async (tx) => {
        // Créer l'organisation
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

        // Créer l'entrée d'audit
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