import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { withErrorHandler } from "./withErrorHandler"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"

type Permission = "view" | "create" | "update" | "delete" | SpecificPermissionAction

export function withPermission(menuId: string, requiredPermission: Permission) {
  return function (handler: Function) {
    return withErrorHandler(async (request: Request & { user?: any }, ...args: any[]) => {
      const t = await getI18n()

      // Check if user is logged in
      if (!request.user) {
        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      // Check if user has role and permissions
      if (!request.user.role?.permissions) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Find permission for the given menuId
      const permission = request.user.role.permissions.find((p: any) => p.menuId === menuId)

      // If no permission for this menuId
      if (!permission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Check basic CRUD permissions
      const hasBasicPermission =
        (requiredPermission === "view" && permission.view) ||
        (requiredPermission === "create" && permission.create) ||
        (requiredPermission === "update" && permission.update) ||
        (requiredPermission === "delete" && permission.delete)

      // Check specific permissions if needed
      let hasSpecificPermission = false
      if (Object.values(SpecificPermissionAction).includes(requiredPermission as SpecificPermissionAction)) {
        hasSpecificPermission = permission.specificsPermissions.includes(requiredPermission)
      }

      // If user lacks required permissions
      if (!hasBasicPermission && !hasSpecificPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Execute handler if all checks pass
      return handler(request, ...args)
    })
  }
}
