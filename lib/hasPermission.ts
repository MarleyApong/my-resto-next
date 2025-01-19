import { User } from "@/contexts/AuthContext"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"

type Permission = "view" | "create" | "update" | "delete" | SpecificPermissionAction


export function hasPermission(user: User | null, menuId: string, requiredPermission: Permission): boolean {
  // Check if user is null
  if (!user) {
    return false
  }

  // Check if user has a role and permissions
  if (!user.role?.permissions) {
    return false
  }

  // Find the permission for the given menuId
  const permission = user.role.permissions.find((p) => p.menuId === menuId)

  // If no permission exists for the menuId
  if (!permission) {
    return false
  }

  // Check basic CRUD permissions
  const hasBasicPermission =
    (requiredPermission === "view" && permission.view) ||
    (requiredPermission === "create" && permission.create) ||
    (requiredPermission === "update" && permission.update) ||
    (requiredPermission === "delete" && permission.delete)

  // Check specific permissions if required
  let hasSpecificPermission = false
  if (Object.values(SpecificPermissionAction).includes(requiredPermission as SpecificPermissionAction)) {
    hasSpecificPermission = permission.specificsPermissions.includes(requiredPermission)
  }

  return hasBasicPermission || hasSpecificPermission
}
