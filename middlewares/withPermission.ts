import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { withErrorHandler } from "./withErrorHandler"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"

type Permission = "view" | "create" | "update" | "delete" | SpecificPermissionAction

export function withPermission(menuId: string, requiredPermission: Permission) {
  return function (handler: Function) {
    return withErrorHandler(async (request: Request & { user?: any }, ...args: any[]) => {
      const t = await getI18n()

      if (!request.user) {
        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      // Vérifier les permissions CRUD de base
      const hasBasicPermission = request.user.role.permissions.some((p: any) => p.menuId === menuId && p[requiredPermission])

      // Vérifier les permissions spécifiques si nécessaire
      let hasSpecificPermission = false
      if (Object.values(SpecificPermissionAction).includes(requiredPermission as SpecificPermissionAction)) {
        hasSpecificPermission = request.user.role.permissions.some((p: any) => p.permissionActions.some((action: any) => action.name === requiredPermission))
      }

      if (!hasBasicPermission && !hasSpecificPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      return handler(request, ...args)
    })
  }
}
