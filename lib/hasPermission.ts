import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import { UserType } from "@/types/user"

// Types
type BasicPermission = "view" | "create" | "update" | "delete"
type Permission = BasicPermission | SpecificPermissionAction

export function hasPermission(user: UserType | null, menuId: string, requiredPermission: Permission): boolean {
  // Check if user is null
  if (!user) {
    return false
  }

  // Check if user has a role and menus
  if (!user.role?.menus) {
    return false
  }

  // Find the menu for the given menuId
  const menu = user.role.menus.find((menu) => menu.id === menuId)

  // If no menu exists for the menuId
  if (!menu) {
    return false
  }

  // Check basic CRUD permissions
  const hasBasicPermission =
    (requiredPermission === "view" && menu.permissions.view) ||
    (requiredPermission === "create" && menu.permissions.create) ||
    (requiredPermission === "update" && menu.permissions.update) ||
    (requiredPermission === "delete" && menu.permissions.delete)

  // Check specific permissions if required
  let hasSpecificPermission = false
  if (Object.values(SpecificPermissionAction).includes(requiredPermission as SpecificPermissionAction)) {
    hasSpecificPermission = menu.specificPermissions.some((permission) => permission.name === requiredPermission && permission.granted)
  }

  return hasBasicPermission || hasSpecificPermission
}
