import { z } from "zod"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { withPermission } from "@/middlewares/withPermission"
import { assignPermissionToMenuSchema } from "@/schemas/permission"

export const GET = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "view"
    )(
      withErrorHandler(async (request: Request, { params }: { params: { roleId: string; menuId: string } }) => {
        const t = await getI18n()
        const { roleId, menuId } = params

        // Récupérer les permissions générales
        const roleMenu = await prisma.roleMenu.findUnique({
          where: {
            roleId_baseMenuId: {
              roleId,
              baseMenuId: menuId
            }
          },
          select: {
            create: true,
            view: true,
            update: true,
            delete: true
          }
        })

        if (!roleMenu) {
          throw createError(errors.NotFoundError, t("api.errors.attributionNotFound"))
        }

        // Récupérer les permissions spécifiques
        const roleSpecificPermissions = await prisma.roleSpecificPermission.findMany({
          where: {
            roleMenu: {
              roleId,
              baseMenuId: menuId
            }
          },
          select: {
            baseSpecificPerm: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            granted: true
          }
        })

        // Formater les permissions spécifiques
        const specificPermissions = roleSpecificPermissions.map((perm) => ({
          id: perm?.baseSpecificPerm?.id,
          name: perm?.baseSpecificPerm?.name,
          description: perm?.baseSpecificPerm?.description,
          granted: perm.granted
        }))

        // Renvoyer la réponse
        return NextResponse.json({
          permissions: {
            create: roleMenu.create,
            view: roleMenu.view,
            update: roleMenu.update,
            delete: roleMenu.delete
          },
          specificPermissions
        })
      })
    )
  )
)

export const PUT = withLogging(
  withAuth(
    withPermission(
      "modules-permissions",
      "update"
    )(
      withErrorHandler(async (request: Request & { user?: any }, { params }: { params: { roleId: string; menuId: string } }) => {
        const t = await getI18n()
        const body = await request.json()

        // Valider le corps de la requête
        try {
          assignPermissionToMenuSchema.parse(body) // Valider les données avec Zod
        } catch (error) {
          console.error("Validation error:", error) // Log l'erreur de validation
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const { roleId, menuId } = params
        const { permissions, specificPermissions } = body

        // Vérifier si le menuId existe
        const roleMenu = await prisma.roleMenu.findUnique({
          where: { roleId_baseMenuId: { roleId, baseMenuId: menuId } }
        })
        if (!roleMenu) {
          throw createError(errors.NotFoundError, t("api.errors.attributionNotFound"))
        }

        // Mettre à jour les permissions du rôle dans une transaction
        const updatedRole = await prisma.$transaction(async (tx) => {
          // Mettre à jour les permissions générales
          await tx.roleMenu.update({
            where: { id: roleMenu.id },
            data: { ...permissions }
          })

          // Ajouter ou mettre à jour les permissions spécifiques
          if (specificPermissions && specificPermissions.length > 0) {
            for (const perm of specificPermissions) {
              await tx.roleSpecificPermission.upsert({
                where: { roleMenuId_baseSpecificPermId: { roleMenuId: roleMenu.id, baseSpecificPermId: perm.id } },
                update: { granted: perm.granted || false }, // Utiliser `false` comme valeur par défaut si `granted` est manquant
                create: {
                  roleMenuId: roleMenu.id,
                  baseSpecificPermId: perm.id,
                  granted: perm.granted || false // Utiliser `false` comme valeur par défaut si `granted` est manquant
                }
              })
            }
          }

          // Journaliser l'action d'attribution des permissions
          await tx.auditLog.create({
            data: {
              actionId: (await tx.action.findUnique({ where: { name: "UPDATE" } }))!.id,
              userId: request.user.id,
              entityId: roleId,
              entityType: "ROLE"
            }
          })

          return roleMenu
        })

        // Renvoyer la réponse avec le rôle mis à jour
        return NextResponse.json({
          message: t("api.success.menusAssigned"),
          data: updatedRole
        })
      })
    )
  )
)
