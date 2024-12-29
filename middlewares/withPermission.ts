import { NextResponse } from "next/server"
import { getI18n } from "@/locales/server"
import { createError, errors } from "@/lib/errors"

type Permission = "view" | "create" | "update" | "delete"

export function withPermission(menuId: string, requiredPermission: Permission) {
  return function (handler: Function) {
    return async (request: Request & { user?: any }, ...args: any[]) => {
      const t = await getI18n()

      if (!request.user) {
        throw createError(errors.UnauthorizedError, t("api.errors.unauthorized"))
      }

      const hasPermission = request.user.role.permissions.some((p: any) => p.menuId === menuId && p[requiredPermission])

      if (!hasPermission) {
        throw createError(errors.ForbiddenError, t("api.errors.forbidden"))
      }

      return handler(request, ...args)
    }
  }
}

// Exemple d'utilisation:
// export const GET = withLogging(
//   withAuth(
//     withPermission("organizations", "view")(
//       async (request: Request) => {
//         // ... le reste du code
//       }
//     )
//   )
// )
