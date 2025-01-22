import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"
import { withErrorHandler } from "./withErrorHandler"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import { UserType } from "@/types/user"

// Types
type BasicPermission = "view" | "create" | "update" | "delete"
type Permission = BasicPermission | SpecificPermissionAction

interface ExtendedRequest extends Request {
  user?: UserType
}

export function withPermission(menuId: string, requiredPermission: Permission) {
  return function (handler: Function) {
    return withErrorHandler(async (request: ExtendedRequest, ...args: any[]) => {
      const t = await getI18n()

      // Check if user is logged in
      if (!request.user) {
        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      // Check if user has role and menus
      if (!request.user.role?.menus) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Find menu for the given menuId
      const menu = request.user.role.menus.find((menu) => menu.id === menuId)

      // If no menu found for this menuId
      if (!menu) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      // Check basic CRUD permissions
      const hasBasicPermission =
        (requiredPermission === "view" && menu.permissions.view) ||
        (requiredPermission === "create" && menu.permissions.create) ||
        (requiredPermission === "update" && menu.permissions.update) ||
        (requiredPermission === "delete" && menu.permissions.delete)

      // Check specific permissions if needed
      let hasSpecificPermission = false
      if (Object.values(SpecificPermissionAction).includes(requiredPermission as SpecificPermissionAction)) {
        hasSpecificPermission = menu.specificPermissions.some((permission) => permission.name === requiredPermission && permission.granted)
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
