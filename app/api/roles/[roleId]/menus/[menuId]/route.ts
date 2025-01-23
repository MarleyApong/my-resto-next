import { prisma } from "@/lib/db"
import { createError, errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { withAuth } from "@/middlewares/withAuth"
import { withErrorHandler } from "@/middlewares/withErrorHandler"
import { withLogging } from "@/middlewares/withLogging"
import { withPermission } from "@/middlewares/withPermission"
import { assignPermissionToMenuSchema } from "@/schemas/permission"
import { NextResponse } from "next/server"

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
          assignPermissionToMenuSchema.parse(body)
        } catch (error) {
          throw createError(errors.BadRequestError, t("api.errors.invalidInput"))
        }

        const { roleId, menuId } = params
        const { menuIds, permissions, specificPermissions } = body

        // Vérifier si le menuId existe
        const roleMenu = await prisma.roleMenu.findUnique({
          where: { roleId_baseMenuId: { roleId: roleId, baseMenuId: menuId } }
        })
        if (!roleMenu) {
          throw createError(errors.NotFoundError, t("api.errors.attributionNotFound"))
        }

        // Mettre à jour les permissions du rôle dans une transaction
        const updatedRole = await prisma.$transaction(async (tx) => {
          // Supprimer les associations de menus existantes pour le rôle
          await tx.roleMenu.deleteMany({
            where: { roleId }
          })

          // Créer de nouvelles associations de menus
          await tx.roleMenu.createMany({
            data: menuIds.map((baseMenuId: string) => ({
              roleId,
              baseMenuId,
              ...permissions // Ajouter les permissions générales
            }))
          })

          // Ajouter les permissions spécifiques si elles existent
          if (specificPermissions && specificPermissions.length > 0) {
            await tx.roleSpecificPermission.createMany({
              data: specificPermissions.map((perm: any) => ({
                roleMenuId: roleMenu.id,
                baseSpecificPermId: perm.id,
                granted: true // Ou une autre logique selon vos besoins
              }))
            })
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
